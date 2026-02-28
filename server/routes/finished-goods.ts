import { RequestHandler } from "express";
import prisma from "../lib/prisma";

export const getFinishedGoods: RequestHandler = async (_req, res) => {
    try {
        const goods = await prisma.menuItem.findMany({
            include: {
                recipes: {
                    include: { ingredient: true },
                },
            },
        });

        // Format for frontend
        const formatted = goods.map(g => {
            const recipe = g.recipes.map(r => ({
                ingredientId: r.ingredientId,
                ingredientName: r.ingredient.name,
                quantityRequired: r.quantity,
                unit: r.ingredient.unit
            }));

            const totalCost = g.recipes.reduce((sum, r) => sum + (r.quantity * r.ingredient.unitPrice), 0);

            return {
                id: g.id.toString(),
                name: g.name,
                category: g.category,
                recipe,
                totalCost,
                sellingPrice: g.price,
                currentStock: g.currentStock,
                createdAt: g.createdAt.toISOString(),
                updatedAt: g.updatedAt.toISOString(),
            };
        });

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch finished goods" });
    }
};

export const createFinishedGood: RequestHandler = async (req, res) => {
    try {
        const { name, category, price, prepTime, description, recipe } = req.body;

        if (!name || !category || price === undefined) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }

        const newGood = await prisma.menuItem.create({
            data: {
                name,
                category,
                price: parseFloat(price),
                prepTime: parseInt(prepTime || 15),
                description,
                recipes: {
                    create: recipe?.map((r: any) => ({
                        ingredientId: r.ingredientId,
                        quantity: parseFloat(r.quantity),
                    })),
                },
            },
        });

        res.status(201).json(newGood);
    } catch (error) {
        res.status(500).json({ error: "Failed to create finished good" });
    }
};

export const updateFinishedGood: RequestHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, price, description, recipe } = req.body;

        // First delete old recipes if providing new one
        if (recipe) {
            await prisma.recipe.deleteMany({
                where: { menuItemId: parseInt(id) },
            });
        }

        const updatedGood = await prisma.menuItem.update({
            where: { id: parseInt(id) },
            data: {
                name,
                category,
                price: price !== undefined ? parseFloat(price) : undefined,
                description,
                recipes: recipe ? {
                    create: recipe.map((r: any) => ({
                        ingredientId: r.ingredientId,
                        quantity: parseFloat(r.quantity),
                    })),
                } : undefined,
            },
        });

        res.json(updatedGood);
    } catch (error) {
        res.status(500).json({ error: "Failed to update finished good" });
    }
};

export const produceFinishedGood: RequestHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;

        const prodQuantity = parseFloat(quantity || 1);

        const result = await prisma.$transaction(async (tx) => {
            // Get the recipe
            const menuItem = await tx.menuItem.findUnique({
                where: { id: parseInt(id) },
                include: { recipes: true },
            });

            if (!menuItem) throw new Error("Item not found");

            // Deduct ingredients from stock
            for (const recipeItem of menuItem.recipes) {
                const needed = recipeItem.quantity * prodQuantity;
                await tx.ingredient.update({
                    where: { id: recipeItem.ingredientId },
                    data: {
                        currentStock: { decrement: needed },
                    },
                });

                await tx.stockMovement.create({
                    data: {
                        ingredientId: recipeItem.ingredientId,
                        quantity: needed,
                        type: "OUT",
                        reason: `Produced ${prodQuantity} units of ${menuItem.name}`,
                    },
                });
            }

            // Record production history
            await tx.productionRecord.create({
                data: {
                    menuItemId: parseInt(id),
                    quantityProduced: prodQuantity,
                },
            });

            // Increment finished good stock
            await tx.menuItem.update({
                where: { id: parseInt(id) },
                data: {
                    currentStock: { increment: prodQuantity },
                },
            });

            return {
                id: menuItem.id.toString(),
                name: menuItem.name,
                category: menuItem.category
            };
        });

        res.json({ message: "Production recorded", good: result });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message || "Failed to record production" });
    }
};

export const getProductionRecords: RequestHandler = async (_req, res) => {
    try {
        const records = await prisma.productionRecord.findMany({
            include: {
                menuItem: {
                    select: { name: true, recipes: { include: { ingredient: true } } }
                }
            },
            orderBy: { createdAt: "desc" },
        });

        // Format for frontend
        const formatted = records.map(r => ({
            id: r.id.toString(),
            finishedGoodId: r.menuItemId.toString(),
            finishedGoodName: r.menuItem.name,
            quantityProduced: r.quantityProduced,
            dateProduced: r.dateProduced.toISOString(),
            rawMaterialsUsed: r.menuItem.recipes.map(recipe => ({
                ingredientId: recipe.ingredientId,
                ingredientName: recipe.ingredient.name,
                quantityUsed: recipe.quantity * r.quantityProduced,
                unit: recipe.ingredient.unit
            }))
        }));

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch production history" });
    }
};
