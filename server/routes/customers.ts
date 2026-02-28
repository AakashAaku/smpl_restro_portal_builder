import { RequestHandler } from "express";
import prisma from "../lib/prisma";

export const getCustomers: RequestHandler = async (_req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { name: "asc" },
    });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch customers" });
  }
};

export const getCustomerById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        orders: {
          take: 5,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch customer" });
  }
};

export const createCustomer: RequestHandler = async (req, res) => {
  try {
    const { name, phone, email } = req.body;

    if (!name || !phone) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const newCustomer = await prisma.customer.create({
      data: {
        name,
        phone,
        email,
      },
    });

    res.status(201).json(newCustomer);
  } catch (error) {
    res.status(500).json({ error: "Failed to create customer" });
  }
};

export const updateCustomer: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, isVip } = req.body;

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        name,
        phone,
        email,
        isVip,
      },
    });

    res.json(updatedCustomer);
  } catch (error) {
    if ((error as any).code === "P2025") {
      res.status(404).json({ error: "Customer not found" });
    } else {
      res.status(500).json({ error: "Failed to update customer" });
    }
  }
};

export const addLoyaltyPoints: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { points } = req.body;

    if (points === undefined) {
      res.status(400).json({ error: "Points required" });
      return;
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        loyaltyPoints: {
          increment: parseInt(points),
        },
      },
    });

    res.json(updatedCustomer);
  } catch (error) {
    res.status(500).json({ error: "Failed to add loyalty points" });
  }
};

export const redeemLoyaltyPoints: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { points } = req.body;

    if (points === undefined) {
      res.status(400).json({ error: "Points required" });
      return;
    }

    const customer = await prisma.customer.findUnique({
      where: { id },
      select: { loyaltyPoints: true },
    });

    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    if (customer.loyaltyPoints < points) {
      res.status(400).json({ error: "Insufficient points" });
      return;
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        loyaltyPoints: {
          decrement: parseInt(points),
        },
      },
    });

    res.json(updatedCustomer);
  } catch (error) {
    res.status(500).json({ error: "Failed to redeem loyalty points" });
  }
};

export const getCustomerStats: RequestHandler = async (_req, res) => {
  try {
    const totalCustomers = await prisma.customer.count();
    const vipCustomers = await prisma.customer.count({ where: { isVip: true } });
    const totalLoyaltyPoints = await prisma.customer.aggregate({
      _sum: { loyaltyPoints: true },
    });

    const totalRevenue = await prisma.order.aggregate({
      _sum: { totalAmount: true },
    });

    res.json({
      totalCustomers,
      activeCustomers: totalCustomers, // simplified for now
      vipCustomers,
      totalLoyaltyPoints: totalLoyaltyPoints._sum.loyaltyPoints || 0,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      averageOrderValue: totalCustomers > 0 ? (totalRevenue._sum.totalAmount || 0) / totalCustomers : 0,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch customer stats" });
  }
};

export const getTopCustomers: RequestHandler = async (_req, res) => {
  try {
    // This is technically more complex because Prisma doesn't group by related total sum easily in one call without raw SQL or multiple steps
    // For now, let's just get customers who have the most loyalty points or just findMany with orders
    const top = await prisma.customer.findMany({
      take: 10,
      include: {
        orders: {
          select: { totalAmount: true },
        },
      },
    });

    // In a real production app, we'd use a more sophisticated sorting
    res.json(top);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch top customers" });
  }
};
