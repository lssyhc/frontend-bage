# Bage Frontend Local Setup

Panduan ini menyiapkan frontend Next.js untuk local development tanpa wrapper shell khusus. Jalankan command dari root repository `frontend-bage`.

## Prasyarat

- Node.js dan npm tersedia di machine lokal.
- Backend local berjalan di `http://localhost:8000`.

## Environment

Salin template env:

```bash
cp .env.local.example .env.local
```

Nilai local yang perlu dipastikan:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_MEDIA_URL=http://localhost:8000/media
```

## Install dan Jalankan Frontend

```bash
npm ci
npm run dev
```

Frontend local tersedia di `http://localhost:3000`.

## Verifikasi

```bash
npm run lint
npx tsc --noEmit
```

E2E local dapat dijalankan setelah backend dan frontend menyala:

```bash
env E2E_RUN_LIVE=true E2E_FRONTEND_URL=http://localhost:3000 E2E_API_URL=http://localhost:8000/api npm run test:e2e:production
```

## Catatan Build

Local development memakai `npm run dev`. `npm run build` dengan env localhost sengaja gagal karena `next.config.ts` melarang host media localhost pada build production. Untuk build production, gunakan URL publik production.
