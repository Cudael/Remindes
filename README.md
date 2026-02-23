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

The easiest way to deploy this app is with [Vercel](https://vercel.com). Connect your GitHub repository in the Vercel dashboard and it will be deployed automatically on every push. See the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

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
