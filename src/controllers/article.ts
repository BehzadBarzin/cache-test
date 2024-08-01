import { Request, RequestHandler, Response } from "express";
import { prisma } from "../utils/prisma";
import multer from "multer";
import { Article } from "@prisma/client";
import { cache } from "../middlewares/cache";

// =============================================================================
// Setup Multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/"); // Specify the directory where you want to save the uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`); // Specify the name of the file
  },
});

const upload = multer({ storage });

// =============================================================================
const getArticles = [
  cache(5), // Cache for 5 seconds
  async (req: Request, res: Response) => {
    // Get ?author=xyz from query string
    const { author } = req.query;

    let articles: Article[] = [];

    if (author) {
      // Query the database
      articles = await prisma.article.findMany({
        where: { userId: Number(author) },
      });

      // ⚠️Delay for 2 seconds
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } else {
      // If user requests for all articles, don't user cache
      articles = await prisma.article.findMany();
    }

    // Must send with res.send because we overwrite res.send in the cache middleware
    return res.send(articles);
  },
];

// =============================================================================
const getArticle = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ message: "Invalid article id" });
  }

  const article = await prisma.article.findUnique({
    where: { id: Number(id) },
  });

  if (!article) {
    return res.status(404).json({ message: "Article not found" });
  }

  return res.json(article);
};

// =============================================================================
const createArticle: RequestHandler[] = [
  // Multer middleware to accept file upload
  upload.single("image"),
  // Main request handler
  async (req: Request, res: Response) => {
    // Get article data from body
    const { title, body } = req.body;
    // Get user data added by auth middleware
    const userId = req.user!.userId;
    // Get uploaded file from request (added by multer middleware)
    const image = req.file?.filename;

    try {
      // Create article
      const article = await prisma.article.create({
        data: {
          title,
          body,
          image: image || "",
          userId,
        },
      });

      return res.status(201).json(article);
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  },
];

// =============================================================================
const updateArticle: RequestHandler[] = [
  // Multer middleware to accept file upload
  upload.single("image"),
  // Main request handler
  async (req: Request, res: Response) => {
    const { id } = req.params;

    // Get article data from body
    const { title, body } = req.body;

    // Get user data added by auth middleware
    const userId = req.user!.userId;

    // Get uploaded file from request (added by multer middleware)
    const image = req.file?.filename;

    try {
      const existingArticle = await prisma.article.findUnique({
        where: { id: Number(id) },
      });

      if (!existingArticle || existingArticle.userId !== userId) {
        return res
          .status(404)
          .json({ message: "Article not found or not authorized" });
      }

      const updatedArticle = await prisma.article.update({
        where: { id: Number(id) },
        data: {
          title: title ? title : existingArticle.title,
          body: body ? body : existingArticle.body,
          image: image ? image : existingArticle.image,
        },
      });

      return res.json(updatedArticle);
    } catch (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
  },
];

// =============================================================================

export { getArticles, getArticle, createArticle, updateArticle };
