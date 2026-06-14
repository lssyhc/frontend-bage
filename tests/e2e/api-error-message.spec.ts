import { expect, test } from '@playwright/test';

import { getApiErrorMessage } from '../../lib/axios';

test('uses validation field messages before Laravel validation summary', () => {
  const error = {
    isAxiosError: true,
    response: {
      data: {
        message:
          'The longitude field must be between 95 and 141. (and 1 more error)',
        errors: {
          longitude: [
            'Lokasi harus berada di dalam wilayah Indonesia (Bujur 95 s.d 141).',
          ],
        },
      },
    },
  };

  expect(getApiErrorMessage(error, 'Fallback error')).toBe(
    'Lokasi harus berada di dalam wilayah Indonesia (Bujur 95 s.d 141).'
  );
});

test('joins multiple validation field messages without duplicates', () => {
  const error = {
    isAxiosError: true,
    response: {
      data: {
        message: 'The given data was invalid. (and 1 more error)',
        errors: {
          longitude: ['Bujur wajib berada di rentang 95 sampai 141.'],
          latitude: ['Lintang wajib berada di rentang -11 sampai 6.'],
          duplicate: ['Bujur wajib berada di rentang 95 sampai 141.'],
        },
      },
    },
  };

  expect(getApiErrorMessage(error, 'Fallback error')).toBe(
    'Bujur wajib berada di rentang 95 sampai 141.; Lintang wajib berada di rentang -11 sampai 6.'
  );
});
