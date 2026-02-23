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

In the Vercel project **Settings → Environment Variables**, add every variable listed below:

| Variable                              | Where used    | Description                                                        |
| ------------------------------------- | ------------- | ------------------------------------------------------------------ |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`   | Build + Runtime | Clerk publishable key (starts with `pk_`)                        |
| `CLERK_SECRET_KEY`                    | Runtime       | Clerk secret key (starts with `sk_`)                               |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`       | Build + Runtime | Sign-in page path, e.g. `/sign-in`                              |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL`       | Build + Runtime | Sign-up page path, e.g. `/sign-up`                              |
| `DATABASE_URL`                        | Runtime       | PostgreSQL connection string                                       |
| `R2_ENDPOINT`                         | Runtime       | Cloudflare R2 S3-compatible endpoint                               |
| `R2_ACCESS_KEY_ID`                    | Runtime       | R2 API token access key ID                                         |
| `R2_SECRET_ACCESS_KEY`                | Runtime       | R2 API token secret access key                                     |
| `R2_BUCKET`                           | Runtime       | Name of the R2 bucket                                              |

> A `.env.example` file is included in the repo with placeholder values for every variable above.

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
