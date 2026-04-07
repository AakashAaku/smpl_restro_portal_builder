import { RequestHandler } from "express";
import prisma from "../lib/prisma";

export const getPrepLists: RequestHandler = async (req, res) => {
  try {
    const { date } = req.query;
    // For date filtering, we might want to match the whole day
    let where = {};
    if (date) {
      const startOfDay = new Date(date as string);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date as string);
      endOfDay.setHours(23, 59, 59, 999);
      where = {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      };
    }

    const prepLists = await prisma.prepList.findMany({
      where,
      include: { items: true },
      orderBy: { date: "desc" },
    });
    res.json(prepLists);
  } catch (error) {
    console.error("Fetch Prep Lists Error:", error);
    res.status(500).json({ error: "Failed to fetch prep lists" });
  }
};

export const createPrepList: RequestHandler = async (req, res) => {
  try {
    const { date, shift, items } = req.body;
    
    if (!shift || !items || !Array.isArray(items)) {
      res.status(400).json({ error: "Missing required fields: shift and items array" });
      return;
    }

    const newPrepList = await prisma.prepList.create({
      data: {
        date: date ? new Date(date) : new Date(),
        shift,
        items: {
          create: items.map((item: any) => ({
            itemName: item.itemName,
            category: item.category,
            expectedOrders: item.expectedOrders || 0,
            prepQuantity: item.prepQuantity || 0,
            prepTime: item.prepTime || 30,
            assignedTo: item.assignedTo,
            status: "pending",
          })),
        },
      },
      include: { items: true },
    });
    
    res.status(201).json(newPrepList);
  } catch (error) {
    console.error("Create Prep List Error:", error);
    res.status(500).json({ error: "Failed to create prep list" });
  }
};

export const updatePrepItemStatus: RequestHandler = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { status } = req.body;
    
    if (!status) {
      res.status(400).json({ error: "Status is required" });
      return;
    }

    const { updatedItem, alerts } = await prisma.$transaction(async (tx) => {
      const item = await tx.prepItem.findUnique({
        where: { id: parseInt(itemId as string) },
      });

      if (!item) throw new Error("Prep item not found");

      const newItem = await tx.prepItem.update({
        where: { id: parseInt(itemId as string) },
        data: { status },
      });

      const alerts: string[] = [];

      // Stage A -> Stage B: In Progress (Deduct Raw Materials)
      if (status === "in-progress" && item.status === "pending") {
        const menuItem = await tx.menuItem.findFirst({
          where: { name: item.itemName },
          include: { recipes: true },
        });

        if (menuItem && menuItem.recipes.length > 0) {
          for (const recipe of menuItem.recipes) {
            const needed = recipe.quantity * item.prepQuantity;
            
            const ingr = await tx.ingredient.update({
              where: { id: recipe.ingredientId },
              data: { currentStock: { decrement: needed } },
            });

            if (ingr.currentStock <= ingr.minStock) {
               alerts.push(`Low stock alert: ${ingr.name} is now at ${ingr.currentStock} ${ingr.unit}`);
            }

            await tx.stockMovement.create({
              data: {
                ingredientId: recipe.ingredientId,
                quantity: needed,
                type: "OUT",
                reason: `Prep: ${item.itemName} (${item.prepQuantity} qty)`,
              },
            });
          }
        }
      }

      // Stage B -> Stage C: Completed (Increment Finished Goods)
      if (status === "completed" && item.status !== "completed") {
        const menuItem = await tx.menuItem.findFirst({
          where: { name: item.itemName },
          include: { recipes: true },
        });

        // Fast-track: if moving direct from pending -> completed, deduct materials now
        if (item.status === 'pending' && menuItem && menuItem.recipes.length > 0) {
            for (const recipe of menuItem.recipes) {
              const needed = recipe.quantity * item.prepQuantity;
              
              const ingr = await tx.ingredient.update({
                where: { id: recipe.ingredientId },
                data: { currentStock: { decrement: needed } },
              });
  
              if (ingr.currentStock <= ingr.minStock) {
                 alerts.push(`Low stock alert: ${ingr.name} is now at ${ingr.currentStock} ${ingr.unit}`);
              }
  
              await tx.stockMovement.create({
                data: {
                  ingredientId: recipe.ingredientId,
                  quantity: needed,
                  type: "OUT",
                  reason: `Prep (Fast-Track): ${item.itemName} (${item.prepQuantity} qty)`,
                },
              });
            }
        }

        if (menuItem) {
          // Record production history for reports
          await tx.productionRecord.create({
            data: {
              menuItemId: menuItem.id,
              quantityProduced: item.prepQuantity,
              dateProduced: new Date(),
            }
          });

          // Also update MenuItem stock if it's a finished good
          await tx.menuItem.update({
            where: { id: menuItem.id },
            data: { currentStock: { increment: item.prepQuantity } }
          });
        }
      }

      return { updatedItem: newItem, alerts };
    });
    
    res.json({ updatedItem, alerts });
  } catch (error) {
    console.error("Update Prep Item Error:", error);
    res.status(500).json({ error: "Failed to update prep item status" });
  }
};

export const getForecast: RequestHandler = async (_req, res) => {
  try {
    // Simple forecast logic: top 10 items based on historical orders if any, 
    // otherwise just return some base items from the menu
    const menuItems = await prisma.menuItem.findMany({
      take: 10,
      orderBy: { orderItems: { _count: "desc" } },
    });
    
    const forecast = menuItems.map(item => ({
      itemName: item.name,
      category: item.category,
      expectedOrders: Math.floor(Math.random() * 30) + 10,
      prepQuantity: Math.floor(Math.random() * 50) + 20,
      prepTime: item.prepTime || 45,
    }));
    
    res.json(forecast);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch forecast" });
  }
};
