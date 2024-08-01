import express, { Express, Request, Response, json } from "express";

// Make sure to import the env file first
import "./utils/env";
import { authRouter } from "./routes/auth";
import { articleRouter } from "./routes/article";

import { redis } from "./utils/redis";
import { seedDatabase } from "./utils/seed-db";

export async function createServer() {
  const app: Express = express();

  // Serve static files
  app.use(express.static("public"));

  // Parse JSON request bodies
  app.use(json());

  app.get("/", async (req: Request, res: Response) => {
    res.json({ data: "Hello World" });
  });

  app.post("/seed-db", async (req: Request, res: Response) => {
    const { users, articlesPerUser } = req.body;
    if (isNaN(Number(users)) || isNaN(Number(articlesPerUser))) {
      return res.status(400).json({ message: "Invalid seed data" });
    }

    // Start seeding in the background
    seedDatabase({
      users: Number(users),
      articlesPerUser: Number(articlesPerUser),
    })
      .then(() => {})
      .catch((error) => {
        console.error(error);
      });

    return res.send({
      message: `Seeding database with ${users} users and ${articlesPerUser} articles per user started in the background.`,
    });
  });

  // Application Routers
  app.use("/auth", authRouter);
  app.use("/articles", articleRouter);

  return app;
}
