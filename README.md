# Remindes

Your personal reminder application built with [Next.js](https://nextjs.org) and TypeScript.

## Getting Started

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Or, if you use [pnpm](https://pnpm.io):

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

## Available Scripts

- `npm run dev` — Start the development server
- `npm run build` — Build for production
- `npm run start` — Start the production server
- `npm run lint` — Run ESLint
- `npm run db:generate` — Generate the Prisma client
- `npm run db:migrate` — Run Prisma migrations in development
- `npm run db:studio` — Open Prisma Studio

## Database Setup

This project uses [Prisma](https://www.prisma.io/) with PostgreSQL.

1. Set the `DATABASE_URL` environment variable in a `.env` file at the project root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

2. Generate the Prisma client and run migrations:

```bash
npm run db:generate
npm run db:migrate
```

3. (Optional) Open Prisma Studio to browse your data:

```bash
npm run db:studio
```

## Deploying to Vercel

### 1. Import the project

1. Push this repository to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.

### 2. Set environment variables

In the Vercel project **Settings → Environment Variables**, add every variable listed below.

#### Exact Vercel env vars

Copy each variable name exactly as shown. All are **required** — the app validates them on startup and will refuse to boot if any are missing.

| Variable                              | Environments        | Example / format                                      |
| ------------------------------------- | ------------------- | ----------------------------------------------------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`   | Production, Preview | `pk_live_…` or `pk_test_…`                            |
| `CLERK_SECRET_KEY`                    | Production, Preview | `sk_live_…` or `sk_test_…`                            |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`       | Production, Preview | `/sign-in`                                            |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL`       | Production, Preview | `/sign-up`                                            |
| `DATABASE_URL`                        | Production, Preview | `postgresql://user:password@host:5432/remindes`       |
| `R2_ENDPOINT`                         | Production, Preview | `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`       |
| `R2_ACCESS_KEY_ID`                    | Production, Preview | your R2 API-token access key ID                       |
| `R2_SECRET_ACCESS_KEY`                | Production, Preview | your R2 API-token secret access key                   |
| `R2_BUCKET`                           | Production, Preview | `remindes` (your bucket name)                         |

> **Tip:** A `.env.example` file is included in the repo with placeholder values for every variable above — use it as a checklist.
>
> **Startup validation:** On server boot the app checks that every variable above is set. If any are missing it will throw an error listing exactly which ones are absent, so preview deployments fail fast instead of with a cryptic runtime error.

### 3. Deploy

Vercel will run `npm run build` automatically (`prisma generate && next build`). After the first successful deploy, every push to the default branch triggers a new deployment.

### 4. Run database migrations

After setting `DATABASE_URL`, run migrations against your production database:

```bash
DATABASE_URL="<your-production-url>" npx prisma migrate deploy
```

## Cloudflare R2 (File Storage)

File uploads use [Cloudflare R2](https://developers.cloudflare.com/r2/) via the AWS SDK (S3-compatible API). Uploads are **not public**; all access goes through pre-signed URLs.

Add the following environment variables to your `.env` (or hosting provider):

| Variable              | Description                                                  |
| --------------------- | ------------------------------------------------------------ |
| `R2_ENDPOINT`         | R2 S3-compatible endpoint, e.g. `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` |
| `R2_ACCESS_KEY_ID`    | R2 API token access key ID                                   |
| `R2_SECRET_ACCESS_KEY`| R2 API token secret access key                               |
| `R2_BUCKET`           | Name of the R2 bucket                                        |

### File API Endpoints (auth required, owner-only)

| Method | Endpoint                        | Description                                          |
| ------ | ------------------------------- | ---------------------------------------------------- |
| POST   | `/api/v1/files/upload-url`      | Returns `{ data: { storageKey, uploadUrl } }` (pre-signed PUT URL) |
| POST   | `/api/v1/files/complete`        | Writes a File row to DB after upload completes       |
| GET    | `/api/v1/files/:id/download`    | Returns `{ data: { url } }` (pre-signed GET URL)    |
| DELETE | `/api/v1/files/:id`             | Deletes file from R2 and DB (owner check)            |

**Allowed file types:** `application/pdf`, `image/jpeg`, `image/png`, `image/webp`
**Max file size:** 10 MB

## API Overview

All API responses use a standard envelope: `{ data: T }` for success and `{ error: { code, message, details? } }` for errors. Request bodies are validated with [Zod](https://zod.dev).

### Core Endpoints (auth required)

| Method | Endpoint                                 | Description                      |
| ------ | ---------------------------------------- | -------------------------------- |
| GET    | `/api/v1/me`                             | Current user info                |
| GET    | `/api/v1/health`                         | Health check                     |
| GET    | `/api/v1/items`                          | List items (filterable)          |
| POST   | `/api/v1/items`                          | Create an item                   |
| GET    | `/api/v1/items/:id`                      | Get item details                 |
| PATCH  | `/api/v1/items/:id`                      | Update an item                   |
| DELETE | `/api/v1/items/:id`                      | Delete an item                   |
| GET    | `/api/v1/items/stats`                    | Aggregated vault statistics      |
| GET    | `/api/v1/items/:id/attachments`          | List item attachments            |
| POST   | `/api/v1/items/:id/attachments`          | Attach a file to an item         |
| DELETE | `/api/v1/items/:id/attachments/:attachId`| Remove an attachment             |
| GET    | `/api/v1/item-types`                     | List item types                  |
| POST   | `/api/v1/item-types`                     | Create an item type              |
| GET    | `/api/v1/item-types/:id`                 | Get item type details            |
| GET    | `/api/v1/item-types/categories`          | List unique categories           |
| GET    | `/api/v1/notifications`                  | List notifications               |
| POST   | `/api/v1/notifications`                  | Mark notification(s) as read     |
| DELETE | `/api/v1/notifications`                  | Delete read notifications        |
