import { expect, request, test, type Page } from '@playwright/test';

const runLive = process.env.E2E_RUN_LIVE === 'true';
const frontendURL = process.env.E2E_FRONTEND_URL ?? 'https://bage-app.vercel.app';
const apiURL = process.env.E2E_API_URL ?? 'https://backend-bage.onrender.com/api';
const imageBase64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=';

test.skip(!runLive, 'Set E2E_RUN_LIVE=true to run live production write tests.');

type TestAccount = {
  email: string;
  name: string;
  password: string;
  username: string;
};

type BrowserRequest = {
  body?: string;
  headers?: Record<string, string>;
  method?: string;
};

async function deleteAccount(account: TestAccount) {
  const api = await request.newContext({
    baseURL: apiURL,
    extraHTTPHeaders: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  try {
    const login = await api.post('/auth/login', {
      data: {
        credential: account.username,
        password: account.password,
      },
    });

    if (login.ok()) {
      await api.delete('/auth/account');
    }
  } finally {
    await api.dispose();
  }
}

async function apiFetch<T>(
  page: Page,
  path: string,
  init: BrowserRequest = {}
): Promise<{ body: T; status: number }> {
  return page.evaluate(
    async ({ apiURL, init, path }) => {
      const response = await fetch(`${apiURL}${path}`, {
        credentials: 'include',
        ...init,
        headers: {
          Accept: 'application/json',
          ...(init.body ? { 'Content-Type': 'application/json' } : {}),
          ...(init.headers ?? {}),
        },
      });
      const body = await response.json();

      return { body, status: response.status };
    },
    { apiURL, init, path }
  );
}

test('live production supports auth, content, media, social, and notification flows', async ({
  page,
}) => {
  const suffix = Date.now().toString(36);
  const password = `E2e!${suffix}Aa1`;
  const first: TestAccount = {
    email: `e2e.${suffix}.first@gmail.com`,
    name: `E2E First ${suffix}`,
    password,
    username: `e2e_first_${suffix}`,
  };
  const second: TestAccount = {
    email: `e2e.${suffix}.second@gmail.com`,
    name: `E2E Second ${suffix}`,
    password,
    username: `e2e_second_${suffix}`,
  };
  const consoleIssues: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      consoleIssues.push(`${message.type()}: ${message.text()}`);
    }
  });
  page.on('pageerror', (error) => {
    consoleIssues.push(`pageerror: ${error.message}`);
  });

  try {
    await page.goto(`${frontendURL}/signup`);
    await page.getByLabel('Nama Lengkap').fill(first.name);
    await page.getByLabel('Username').fill(first.username);
    await page.getByLabel('Email').fill(first.email);
    await page.getByLabel('Password', { exact: true }).fill(first.password);
    await page
      .getByLabel('Konfirmasi Password', { exact: true })
      .fill(first.password);
    await page.getByRole('button', { name: 'Daftar' }).click();
    await expect(page).toHaveURL(/\/feed/);

    const currentUser = await apiFetch<{ data: { id: number; username: string } }>(
      page,
      '/user'
    );
    expect(currentUser.status).toBe(200);
    expect(currentUser.body.data.username).toBe(first.username);

    const categories = await apiFetch<{
      data: Array<{ id: number; name: string }>;
    }>(page, '/categories');
    expect(categories.status).toBe(200);
    expect(categories.body.data.length).toBeGreaterThanOrEqual(6);

    const categoryId = categories.body.data[0].id;
    const location = await apiFetch<{
      data: { id: number; name: string };
    }>(page, '/locations', {
      method: 'POST',
      body: JSON.stringify({
        address: `Jl. E2E ${suffix}, Jakarta`,
        category_id: categoryId,
        description: 'Tempat sementara untuk verifikasi production.',
        latitude: -6.2,
        longitude: 106.816666,
        name: `Tempat E2E ${suffix}`,
      }),
    });
    expect(location.status).toBe(201);

    const createdPost = await page.evaluate(
      async ({ apiURL, imageBase64, locationId, suffix }) => {
        const bytes = Uint8Array.from(atob(imageBase64), (char) =>
          char.charCodeAt(0)
        );
        const file = new File([bytes], `e2e-${suffix}.png`, {
          type: 'image/png',
        });
        const data = new FormData();
        data.append('location_id', String(locationId));
        data.append('rating', '5');
        data.append('content', `Post E2E ${suffix}`);
        data.append('media[]', file);

        const response = await fetch(`${apiURL}/posts`, {
          method: 'POST',
          body: data,
          credentials: 'include',
          headers: { Accept: 'application/json' },
        });

        return {
          body: await response.json(),
          status: response.status,
        };
      },
      {
        apiURL,
        imageBase64,
        locationId: location.body.data.id,
        suffix,
      }
    );
    expect(createdPost.status).toBe(201);
    expect(createdPost.body.data.media.length).toBeGreaterThan(0);

    await page.goto(`${frontendURL}/post/${createdPost.body.data.id}`);
    await expect(page.getByText(`Post E2E ${suffix}`)).toBeVisible();

    const secondRegistration = await apiFetch(page, '/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: second.email,
        name: second.name,
        password: second.password,
        password_confirmation: second.password,
        username: second.username,
      }),
    });
    expect(secondRegistration.status).toBe(201);

    const like = await apiFetch<{ data: { liked: boolean; total_likes: number } }>(
      page,
      `/posts/${createdPost.body.data.id}/like`,
      { method: 'POST' }
    );
    expect(like.status).toBe(200);
    expect(like.body.data.liked).toBe(true);

    const comment = await apiFetch<{ data: { content: string } }>(
      page,
      `/posts/${createdPost.body.data.id}/comments`,
      {
        method: 'POST',
        body: JSON.stringify({ content: `Komentar E2E ${suffix}` }),
      }
    );
    expect(comment.status).toBe(201);
    expect(comment.body.data.content).toBe(`Komentar E2E ${suffix}`);

    const follow = await apiFetch<{ data: { is_following: boolean } }>(
      page,
      `/users/${currentUser.body.data.id}/follow`,
      { method: 'POST' }
    );
    expect(follow.status).toBe(200);
    expect(follow.body.data.is_following).toBe(true);

    await page.context().clearCookies();
    await page.goto(`${frontendURL}/login`);
    await page.getByLabel('Email atau username').fill(first.username);
    await page.getByLabel('Password', { exact: true }).fill(first.password);
    await page.getByRole('button', { name: 'Masuk' }).click();
    await expect(page).toHaveURL(/\/feed/);

    await page.goto(`${frontendURL}/notifications`);
    await expect(
      page.locator(`a[href="/profile/${second.username}"]`).first()
    ).toBeVisible();

    expect(consoleIssues).toEqual([]);
  } finally {
    await deleteAccount(second);
    await deleteAccount(first);
  }
});
