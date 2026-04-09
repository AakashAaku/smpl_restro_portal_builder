import { Router, RequestHandler } from "express";
import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";
import pkg from "../generated/client";
const { Role } = pkg;
import type { Role as RoleType } from "../generated/client";

const router = Router();

// Get all users
export const getUsers: RequestHandler = async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// Create a new user (Admin only)
export const createUser: RequestHandler = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name || !role) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({ error: "User with this email already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role as RoleType,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
};

// Update an existing user
export const updateUser: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id as string;
    const { email, name, role, password } = req.body;

    const dataToUpdate: any = { email, name };
    
    if (role) {
      dataToUpdate.role = role as RoleType;
    }
    
    if (password && password.trim() !== '') {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
};

// Delete a user
export const deleteUser: RequestHandler = async (req, res) => {
  try {
    const id = req.params.id as string;
    
    // Prevent deleting oneself - would normally check req.user.id but for simplicity:
    // ...

    await prisma.user.delete({
      where: { id },
    });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
};

router.get("/", getUsers);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
