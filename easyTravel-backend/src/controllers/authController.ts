import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey"; // fallback for safety

// 🧩 Register a new user
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, isDriver } = req.body;
    console.log("📩 Incoming signup data:", req.body);


    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        isDriver: isDriver || false,
      },
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isDriver: user.isDriver,
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔐 Login user
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isDriver: user.isDriver,
      },
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Server error" });
  }
};
