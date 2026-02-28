import { RequestHandler } from "express";
import prisma from "../lib/prisma";

export const getMenuItems: RequestHandler = async (_req, res) => {
  try {
    const menuItems = await prisma.menuItem.findMany({
      orderBy: { name: "asc" },
    });
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch menu items" });
  }
};

export const getMenuItemById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await prisma.menuItem.findUnique({
      where: { id: parseInt(id as string) },
    });

    if (!item) {
      res.status(404).json({ error: "Menu item not found" });
      return;
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch menu item" });
  }
};

export const createMenuItem: RequestHandler = async (req, res) => {
  try {
    const { name, category, price, prepTime, description, status } = req.body;

    // Validation
    if (!name || !category || !price || !prepTime) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const newItem = await prisma.menuItem.create({
      data: {
        name,
        category,
        price: parseFloat(price),
        prepTime: parseInt(prepTime),
        description: description || "",
        status: status || "available",
      },
    });

    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: "Failed to create menu item" });
  }
};

export const updateMenuItem: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, prepTime, description, status } = req.body;

    const updatedItem = await prisma.menuItem.update({
      where: { id: parseInt(id as string) },
      data: {
        name,
        category,
        price: price !== undefined ? parseFloat(price) : undefined,
        prepTime: prepTime !== undefined ? parseInt(prepTime) : undefined,
        description,
        status,
      },
    });

    res.json(updatedItem);
  } catch (error) {
    if ((error as any).code === "P2025") {
      res.status(404).json({ error: "Menu item not found" });
    } else {
      res.status(500).json({ error: "Failed to update menu item" });
    }
  }
};

export const deleteMenuItem: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const itemId = parseInt(id as string);

    await prisma.$transaction(async (tx) => {
      // Delete associated recipe records first
      await tx.recipe.deleteMany({
        where: { menuItemId: itemId },
      });

      // Delete the menu item
      await tx.menuItem.delete({
        where: { id: itemId },
      });
    });

    res.json({ message: "Menu item deleted successfully" });
  } catch (error) {
    if ((error as any).code === "P2025") {
      res.status(404).json({ error: "Menu item not found" });
    } else {
      console.error("Delete menu item error:", error);
      res.status(500).json({ error: "Failed to delete menu item" });
    }
  }
};

export const getMenuCategories: RequestHandler = async (_req, res) => {
  try {
    const categories = await prisma.menuItem.findMany({
      select: { category: true },
      distinct: ["category"],
    });
    res.json(categories.map((c) => c.category));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};
