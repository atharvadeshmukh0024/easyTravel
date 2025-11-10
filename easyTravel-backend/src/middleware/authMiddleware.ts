import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    if (!decoded.id) {
      return res.status(400).json({ message: "User ID missing from token" });
    }

    req.user = { id: decoded.id }; // ✅ consistent field name
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token." });
  }
};
