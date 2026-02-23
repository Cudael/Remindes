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
