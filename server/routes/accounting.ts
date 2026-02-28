import { RequestHandler } from "express";
import prisma from "../lib/prisma";

export const getDailySalesReport: RequestHandler = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate ? new Date(startDate as string) : undefined,
          lte: endDate ? new Date(endDate as string) : undefined,
        },
      },
      select: {
        createdAt: true,
        totalAmount: true,
        paymentMethod: true,
      },
    });

    // Group by date
    const reports: Record<string, any> = {};
    orders.forEach((order) => {
      const dateStr = order.createdAt.toISOString().split("T")[0];
      if (!reports[dateStr]) {
        reports[dateStr] = {
          date: dateStr,
          totalOrders: 0,
          totalRevenue: 0,
          paymentBreakdown: { cash: 0, card: 0, online: 0 },
        };
      }
      reports[dateStr].totalOrders++;
      reports[dateStr].totalRevenue += order.totalAmount;
      const method = (order.paymentMethod || "online").toLowerCase();
      if (reports[dateStr].paymentBreakdown[method] !== undefined) {
        reports[dateStr].paymentBreakdown[method] += order.totalAmount;
      }
    });

    res.json(Object.values(reports));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch daily sales report" });
  }
};

export const getMonthlySalesReport: RequestHandler = async (_req, res) => {
  try {
    // Simplified: Group by month for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true, totalAmount: true },
    });

    const months: Record<string, any> = {};
    orders.forEach((order) => {
      const month = order.createdAt.toLocaleString("default", { month: "short" });
      if (!months[month]) {
        months[month] = { month, revenue: 0, orders: 0, profit: 0, expense: 0 };
      }
      months[month].revenue += order.totalAmount;
      months[month].orders++;
      months[month].expense += order.totalAmount * 0.6; // Assuming 60% COGS + OpEx
      months[month].profit = months[month].revenue - months[month].expense;
    });

    res.json(Object.values(months));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch monthly sales report" });
  }
};

export const getFinancialSummary: RequestHandler = async (_req, res) => {
  try {
    const totalRevenue = await prisma.order.aggregate({
      _sum: { totalAmount: true },
    });
    const totalExpenses = await prisma.expense.aggregate({
      where: { status: "paid" },
      _sum: { amount: true },
    });

    const revenue = totalRevenue._sum.totalAmount || 0;
    const expenses = totalExpenses._sum.amount || 0;
    const profit = revenue - expenses;

    res.json({
      revenue,
      expenses,
      profit,
      totalRevenue: revenue,
      totalExpenses: expenses,
      totalProfit: profit,
      profitMargin: revenue > 0 ? `${Math.round((profit / revenue) * 100)}%` : "0%",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch financial summary" });
  }
};

export const getExpenses: RequestHandler = async (_req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { date: "desc" },
    });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
};

export const createExpense: RequestHandler = async (req, res) => {
  try {
    const { category, amount, description, date } = req.body;

    if (!category || !amount || !description) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const newExpense = await prisma.expense.create({
      data: {
        category,
        amount: parseFloat(amount),
        description,
        date: date ? new Date(date) : undefined,
      },
    });

    res.status(201).json(newExpense);
  } catch (error) {
    res.status(500).json({ error: "Failed to create expense" });
  }
};

export const updateExpenseStatus: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedExpense = await prisma.expense.update({
      where: { id: parseInt(id) },
      data: { status },
    });

    res.json(updatedExpense);
  } catch (error) {
    res.status(500).json({ error: "Failed to update expense status" });
  }
};

export const getPaymentBreakdown: RequestHandler = async (_req, res) => {
  try {
    const breakdown = await prisma.order.groupBy({
      by: ["paymentMethod"],
      _sum: { totalAmount: true },
    });

    const result: Record<string, number> = { cash: 0, card: 0, online: 0 };
    breakdown.forEach((b) => {
      const method = (b.paymentMethod || "online").toLowerCase();
      if (result[method] !== undefined) {
        result[method] = b._sum.totalAmount || 0;
      }
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch payment breakdown" });
  }
};

export const getTaxReport: RequestHandler = async (_req, res) => {
  try {
    // Reports.tsx expects an array for charts
    const sixMonths = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const month = d.toLocaleString("default", { month: "short" });

      // Calculate data for this month only
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);

      const monthRevenue = await prisma.order.aggregate({
        where: { createdAt: { gte: monthStart, lte: monthEnd } },
        _sum: { totalAmount: true }
      });

      const rev = monthRevenue._sum.totalAmount || 0;
      const vat = Math.round(rev * 0.13);

      sixMonths.push({
        month,
        taxableAmount: rev - vat,
        vat: vat,
        grossRevenue: rev
      });
    }

    res.json(sixMonths);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tax report" });
  }
};

export const getProfitabilityReport: RequestHandler = async (_req, res) => {
  try {
    const menuItems = await prisma.menuItem.findMany({
      include: {
        recipes: {
          include: {
            ingredient: true
          }
        }
      }
    });

    const report = menuItems.map(item => {
      const foodCost = item.recipes.reduce((sum, r) => {
        return sum + (r.quantity * (r.ingredient.unitPrice || 0));
      }, 0);

      const margin = item.price - foodCost;
      const marginPercentage = item.price > 0 ? (margin / item.price) * 100 : 0;

      return {
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
        foodCost: Math.round(foodCost * 100) / 100,
        margin: Math.round(margin * 100) / 100,
        marginPercentage: Math.round(marginPercentage * 10) / 10,
      };
    });

    res.json(report);
  } catch (error) {
    console.error("Profitability Analysis Error:", error);
    res.status(500).json({ error: "Failed to fetch profitability analysis" });
  }
};
