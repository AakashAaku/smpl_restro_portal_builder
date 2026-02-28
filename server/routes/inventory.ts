import { RequestHandler } from "express";
import prisma from "../lib/prisma";
import { MovementType } from "@prisma/client";

export const getIngredients: RequestHandler = async (_req, res) => {
  try {
    const ingredients = await prisma.ingredient.findMany({
      orderBy: { name: "asc" },
    });
    res.json(ingredients);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch ingredients" });
  }
};

export const getIngredientById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const ingredient = await prisma.ingredient.findUnique({
      where: { id: parseInt(id as string) },
      include: { stockMovements: { take: 10, orderBy: { date: "desc" } } },
    });

    if (!ingredient) {
      res.status(404).json({ error: "Ingredient not found" });
      return;
    }

    res.json(ingredient);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch ingredient" });
  }
};

export const createIngredient: RequestHandler = async (req, res) => {
  try {
    const { name, unit, currentStock, minStock, unitPrice } = req.body;

    if (!name || !unit) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const newIngredient = await prisma.ingredient.create({
      data: {
        name,
        unit,
        currentStock: currentStock ? parseFloat(currentStock) : 0,
        minStock: minStock ? parseFloat(minStock) : 0,
        unitPrice: unitPrice ? parseFloat(unitPrice) : 0,
      },
    });

    res.status(201).json(newIngredient);
  } catch (error) {
    res.status(500).json({ error: "Failed to create ingredient" });
  }
};

export const updateIngredient: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, unit, currentStock, minStock, unitPrice } = req.body;

    const updatedIngredient = await prisma.ingredient.update({
      where: { id: parseInt(id as string) },
      data: {
        name,
        unit,
        currentStock: currentStock !== undefined ? parseFloat(currentStock) : undefined,
        minStock: minStock !== undefined ? parseFloat(minStock) : undefined,
        unitPrice: unitPrice !== undefined ? parseFloat(unitPrice) : undefined,
      },
    });

    res.json(updatedIngredient);
  } catch (error) {
    if ((error as any).code === "P2025") {
      res.status(404).json({ error: "Ingredient not found" });
    } else {
      res.status(500).json({ error: "Failed to update ingredient" });
    }
  }
};

export const deleteIngredient: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.ingredient.delete({
      where: { id: parseInt(id as string) },
    });
    res.json({ message: "Ingredient deleted" });
  } catch (error) {
    if ((error as any).code === "P2025") {
      res.status(404).json({ error: "Ingredient not found" });
    } else {
      res.status(500).json({ error: "Failed to delete ingredient" });
    }
  }
};

export const getLowStockIngredients: RequestHandler = async (_req, res) => {
  try {
    // Note: Prisma doesn't support comparing two columns in a where clause directly in findMany efficiently without raw SQL or a filter
    // but we can fetch and filter or use raw SQL. For now, we'll fetch elements where currentStock < a threshold or fetch all and filter.
    const ingredients = await prisma.ingredient.findMany();
    const lowStock = ingredients.filter((i) => i.currentStock <= i.minStock);
    res.json(lowStock);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch low stock ingredients" });
  }
};

export const getSuppliers: RequestHandler = async (_req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch suppliers" });
  }
};

export const createSupplier: RequestHandler = async (req, res) => {
  try {
    const { name, contact, email, address } = req.body;

    const newSupplier = await prisma.supplier.create({
      data: { name, contact, email, address },
    });

    res.status(201).json(newSupplier);
  } catch (error) {
    res.status(500).json({ error: "Failed to create supplier" });
  }
};

export const recordStockMovement: RequestHandler = async (req, res) => {
  try {
    const { ingredientId, type, quantity, reason } = req.body;

    const movement = await prisma.$transaction(async (tx) => {
      // Update ingredient stock
      const ingredient = await tx.ingredient.update({
        where: { id: ingredientId },
        data: {
          currentStock: {
            [type === "IN" ? "increment" : "decrement"]: parseFloat(quantity),
          },
        },
      });

      // Characterize movement
      return tx.stockMovement.create({
        data: {
          ingredientId,
          type: type as MovementType,
          quantity: parseFloat(quantity),
          reason,
        },
      });
    });

    res.status(201).json(movement);
  } catch (error) {
    res.status(500).json({ error: "Failed to record stock movement" });
  }
};

export const getInventoryValue: RequestHandler = async (_req, res) => {
  try {
    const ingredients = await prisma.ingredient.findMany();

    const totalValue = ingredients.reduce(
      (sum, i) => sum + i.currentStock * i.unitPrice,
      0
    );

    res.json({
      totalInventoryValue: Math.round(totalValue),
      itemCount: ingredients.length,
      lowStockCount: ingredients.filter((i) => i.currentStock <= i.minStock).length,
      ingredients: ingredients.map((i) => ({
        ...i,
        value: Math.round(i.currentStock * i.unitPrice),
        isLowStock: i.currentStock <= i.minStock,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to calculate inventory value" });
  }
};

export const getStockMovements: RequestHandler = async (_req, res) => {
  try {
    const movements = await prisma.stockMovement.findMany({
      include: { ingredient: true },
      orderBy: { date: "desc" },
    });
    res.json(movements.map(m => ({
      id: m.id,
      ingredientId: m.ingredientId,
      ingredientName: m.ingredient.name,
      type: m.type,
      quantity: m.quantity,
      reason: m.reason,
      date: m.date,
    })));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stock movements" });
  }
};
