# Simple Express Server with Prisma to Implement Caching

This is a simple express server with Prisma, and is created to show how to implement caching in API.

## Technologies

- Express
- TypeScript
- Prisma
- Redis

## How to use

1. Maker sure Redis is running with Docker:

```bash
docker run --name redis-instance -d -p 6379:6379 redis
```

2. Install dependencies:

```bash
pnpm install
```

3. Add required env variables (`.env.dev` and `.env.prod`). Use `.env-example` as a reference.

4. Start the development server:

```bash
pnpm dev
```

5. Or build and start the production server:

- Make sure to run Prisma migration for production database.

```bash
pnpm build
pnpm start
```
