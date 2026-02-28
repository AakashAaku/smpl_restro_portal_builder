import { RequestHandler } from "express";
import prisma from "../lib/prisma";

export const getRecipesByMenuItem: RequestHandler = async (req, res) => {
    try {
        const { menuItemId } = req.params;
        const recipes = await prisma.recipe.findMany({
            where: { menuItemId: parseInt(menuItemId) },
            include: { ingredient: true }
        });
        res.json(recipes);
    } catch (error) {
        console.error("Get Recipes Error:", error);
        res.status(500).json({ error: "Failed to fetch recipes" });
    }
};

export const updateMenuItemRecipe: RequestHandler = async (req, res) => {
    try {
        const { menuItemId } = req.params;
        const { ingredients } = req.body; // Array of { ingredientId, quantity }

        if (!Array.isArray(ingredients)) {
            res.status(400).json({ error: "Ingredients must be an array" });
            return;
        }

        await prisma.$transaction(async (tx) => {
            // Clear existing recipes for this item
            await tx.recipe.deleteMany({
                where: { menuItemId: parseInt(menuItemId) }
            });

            // Create new ones if any
            if (ingredients.length > 0) {
                await tx.recipe.createMany({
                    data: ingredients.map((ing: any) => ({
                        menuItemId: parseInt(menuItemId),
                        ingredientId: parseInt(ing.ingredientId),
                        quantity: parseFloat(ing.quantity)
                    }))
                });
            }
        });

        res.json({ message: "Recipe updated successfully" });
    } catch (error) {
        console.error("Update Recipe Error:", error);
        res.status(500).json({ error: "Failed to update recipe" });
    }
};
