import { RequestHandler } from "express";
import prisma from "../lib/prisma";
import { OrderStatus } from "@prisma/client";

export const getOrdersByCustomer: RequestHandler = async (req, res) => {
  try {
    const { idOrPhone } = req.params;
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { customerId: idOrPhone },
          { customer: { phone: idOrPhone } },
        ],
      },
      include: {
        orderItems: {
          include: { menuItem: true },
        },
        customer: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch customer orders" });
  }
};

export const getOrders: RequestHandler = async (_req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        orderItems: {
          include: { menuItem: true },
        },
        customer: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

export const getOrderById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: { menuItem: true },
        },
        customer: true,
      },
    });

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch order" });
  }
};

export const createOrder: RequestHandler = async (req, res) => {
  try {
    const { customerId, tableId, items, specialInstructions, customerName, customerPhone } = req.body;

    // Validation
    if (!items || items.length === 0) {
      res.status(400).json({ error: "Order must have at least one item" });
      return;
    }

    // Generate order number
    const count = await prisma.order.count();
    const orderNumber = `ORD-${String(count + 1).padStart(4, "0")}`;

    const total = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    // If customerName is provided but no customerId, we find or create customer
    let targetCustomerId = customerId;
    if (!targetCustomerId && customerName) {
      // Find customer by phone or create new one
      let customer = await prisma.customer.findFirst({
        where: { phone: customerPhone },
      });

      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            name: customerName,
            phone: customerPhone
          },
        });
      }
      targetCustomerId = customer.id;
    }

    // Use transaction for atomicity
    const [newOrder] = await prisma.$transaction([
      prisma.order.create({
        data: {
          orderNumber,
          customerId: targetCustomerId,
          tableId: tableId ? parseInt(tableId) : undefined,
          totalAmount: total,
          status: OrderStatus.PENDING,
          orderItems: {
            create: items.map((item: any) => ({
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          orderItems: true,
        },
      }),
      // Automatically update table status if tableId is provided
      ...(tableId ? [
        prisma.table.update({
          where: { id: parseInt(tableId) },
          data: {
            status: "occupied",
          }
        })
      ] : [])
    ]);

    res.status(201).json(newOrder);
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
};

export const updateOrderStatus: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: status.toUpperCase() as OrderStatus },
    });

    res.json(updatedOrder);

    // If order is now PREPARING, deduct stock
    if (status.toUpperCase() === "PREPARING") {
      try {
        await deductIngredientsForOrder(id);
      } catch (error) {
        console.error(`Failed to deduct stock for order ${id}:`, error);
      }
    }
  } catch (error) {
    if ((error as any).code === "P2025") {
      res.status(404).json({ error: "Order not found" });
    } else {
      res.status(500).json({ error: "Failed to update order status" });
    }
  }
};

export const cancelOrder: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const cancelledOrder = await prisma.order.update({
      where: { id },
      data: { status: OrderStatus.CANCELLED },
    });

    res.json({ message: "Order cancelled", order: cancelledOrder });
  } catch (error) {
    if ((error as any).code === "P2025") {
      res.status(404).json({ error: "Order not found" });
    } else {
      res.status(500).json({ error: "Failed to cancel order" });
    }
  }
};

export const getOrdersByStatus: RequestHandler = async (req, res) => {
  try {
    const { status } = req.params;

    const orders = await prisma.order.findMany({
      where: { status: (status as string).toUpperCase() as OrderStatus },
      include: {
        orderItems: {
          include: { menuItem: true },
        },
      },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders by status" });
  }
};

export const getOrderStats: RequestHandler = async (_req, res) => {
  try {
    const stats = await prisma.order.groupBy({
      by: ["status"],
      _count: { _all: true },
      _sum: { totalAmount: true },
    });

    const totalOrders = await prisma.order.count();
    const totalRevenue = await prisma.order.aggregate({
      _sum: { totalAmount: true },
    });

    const statusBreakdown: Record<string, number> = {};
    stats.forEach((stat) => {
      statusBreakdown[stat.status.toLowerCase()] = stat._count._all;
    });

    res.json({
      totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      averageOrderValue: totalOrders > 0 ? (totalRevenue._sum.totalAmount || 0) / totalOrders : 0,
      statusBreakdown,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch order stats" });
  }
};

async function deductIngredientsForOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: {
        include: {
          menuItem: {
            include: {
              recipes: true
            }
          }
        }
      }
    }
  });

  if (!order) return;

  await prisma.$transaction(async (tx) => {
    for (const item of order.orderItems) {
      // 1. Deduct from Finished Goods stock if available
      if (item.menuItem.currentStock > 0) {
        const deduction = Math.min(item.menuItem.currentStock, item.quantity);
        await tx.menuItem.update({
          where: { id: item.menuItemId },
          data: { currentStock: { decrement: deduction } }
        });

        // If we fulfilled the whole quantity from stock, skip ingredient deduction
        if (deduction >= item.quantity) continue;
      }

      // 2. Deduct from Raw Materials (Ingredients) if recipe exists
      if (!item.menuItem.recipes || item.menuItem.recipes.length === 0) continue;

      for (const recipe of item.menuItem.recipes) {
        // Only deduct what wasn't fulfilled by finished stock
        const remainingQty = item.quantity; // Simplification: if no stock, deduct full recipe
        const totalDeduction = recipe.quantity * remainingQty;

        // Update stock
        await tx.ingredient.update({
          where: { id: recipe.ingredientId },
          data: {
            currentStock: {
              decrement: totalDeduction
            }
          }
        });

        // Record movement
        await tx.stockMovement.create({
          data: {
            ingredientId: recipe.ingredientId,
            type: "OUT",
            quantity: totalDeduction,
            reason: `Order ${order.orderNumber} - ${item.menuItem.name}`
          }
        });
      }
    }
  });
}
