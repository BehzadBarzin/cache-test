import { Router } from "express";
import {
  getArticles,
  getArticle,
  createArticle,
  updateArticle,
} from "../controllers/article";
import authMiddleware from "../middlewares/auth";

const articleRouter = Router();

articleRouter.get("/", getArticles);
articleRouter.get("/:id", getArticle);
articleRouter.post("/", authMiddleware, createArticle);
articleRouter.patch("/:id", authMiddleware, updateArticle);

export { articleRouter };
