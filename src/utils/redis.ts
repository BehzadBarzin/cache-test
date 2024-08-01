import Redis from "ioredis";

if (!process.env.REDIS_URL) {
  console.error("💀[Error] REDIS_URL environment variable is not set");
}

const redis = new Redis(process.env.REDIS_URL!);

export { redis };
