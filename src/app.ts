import express, { Express, Request, Response, json } from "express";

// Make sure to import the env file first
import "./utils/env";
import { authRouter } from "./routes/auth";
import { articleRouter } from "./routes/article";

import { redis } from "./utils/redis";

export async function createServer() {
  const app: Express = express();

  // Serve static files
  app.use(express.static("public"));

  // Parse JSON request bodies
  app.use(json());

  app.get("/", async (req: Request, res: Response) => {
    res.json({ data: "Hello World" });
  });

  // Application Routers
  app.use("/auth", authRouter);
  app.use("/articles", articleRouter);

  return app;
}
