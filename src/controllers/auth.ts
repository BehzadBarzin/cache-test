import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// =============================================================================
const register = async (req: Request, res: Response) => {
  // Extract user info from body
  const { email, password } = req.body;

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    return res.status(201).json({
      id: user.id,
      email: user.email,
    });
  } catch (err) {
    return res.status(400).json({ message: "User already exists" });
  }
};

// =============================================================================
const login = async (req: Request, res: Response) => {
  // Extract user info from body
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "Not Authenticated" });
    }

    // Check password
    const passwordMatch = await bcrypt.compare(password, user!.password);

    if (!user || !passwordMatch) {
      return res.status(401).json({ message: "Not Authenticated" });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1h",
      }
    );

    // Return token to the user
    return res.json({ token });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

// =============================================================================

export { register, login };
