import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export type TTokenPayload = {
  userId: number;
  iat: number;
  exp: number;
};

declare global {
  namespace Express {
    interface Request {
      user?: TTokenPayload;
    }
  }
}

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Get token from header
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Not Authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

    req.user = decoded as TTokenPayload;

    return next();
  } catch (err) {
    return res.status(401).json({ message: "Not Authenticated" });
  }
};

export default authMiddleware;
