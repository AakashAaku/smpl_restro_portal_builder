import { RequestHandler } from "express";

export interface SalesReport {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  paymentBreakdown: {
    cash: number;
    card: number;
    upi: number;
    other: number;
  };
}

export interface Expense {
  id: number;
  category: "salary" | "utilities" | "marketing" | "supplies" | "other";
  amount: number;
  date: string;
  description: string;
  status: "pending" | "paid";
}

let expenses: Expense[] = [
  {
    id: 1,
    category: "salary",
    amount: 50000,
    date: "2024-01-01",
    description: "Monthly staff salary",
    status: "paid",
  },
  {
    id: 2,
    category: "utilities",
    amount: 8000,
    date: "2024-01-15",
    description: "Electricity and water bill",
    status: "paid",
  },
  {
    id: 3,
    category: "marketing",
    amount: 5000,
    date: "2024-01-20",
    description: "Social media marketing campaign",
    status: "pending",
  },
  {
    id: 4,
    category: "supplies",
    amount: 12000,
    date: "2024-01-22",
    description: "Kitchen equipment replacement",
    status: "pending",
  },
];

// Mock sales data
const generateSalesReports = (): SalesReport[] => {
  const reports: SalesReport[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    reports.push({
      date: dateStr,
      totalOrders: Math.floor(Math.random() * 30) + 15,
      totalRevenue: Math.floor(Math.random() * 50000) + 20000,
      averageOrderValue: Math.floor(Math.random() * 800) + 400,
      paymentBreakdown: {
        cash: Math.floor(Math.random() * 20000) + 5000,
        card: Math.floor(Math.random() * 20000) + 5000,
        upi: Math.floor(Math.random() * 20000) + 5000,
        other: Math.floor(Math.random() * 10000) + 2000,
      },
    });
  }
  return reports;
};

export const getDailySalesReport: RequestHandler = (req, res) => {
  const { startDate, endDate } = req.query;

  const reports = generateSalesReports();

  if (startDate || endDate) {
    const filtered = reports.filter((r) => {
      const rDate = new Date(r.date);
      const start = startDate ? new Date(startDate as string) : new Date(0);
      const end = endDate ? new Date(endDate as string) : new Date();
      return rDate >= start && rDate <= end;
    });
    res.json(filtered);
    return;
  }

  res.json(reports);
};

export const getMonthlySalesReport: RequestHandler = (_req, res) => {
  const months = [
    { month: "Jan", revenue: 450000, orders: 320, profit: 180000 },
    { month: "Feb", revenue: 480000, orders: 340, profit: 192000 },
    { month: "Mar", revenue: 520000, orders: 370, profit: 208000 },
    { month: "Apr", revenue: 490000, orders: 350, profit: 196000 },
    { month: "May", revenue: 560000, orders: 400, profit: 224000 },
    { month: "Jun", revenue: 580000, orders: 410, profit: 232000 },
  ];

  res.json(months);
};

export const getFinancialSummary: RequestHandler = (_req, res) => {
  const reports = generateSalesReports();
  const totalRevenue = reports.reduce((sum, r) => sum + r.totalRevenue, 0);
  const totalExpenses = expenses
    .filter((e) => e.status === "paid")
    .reduce((sum, e) => sum + e.amount, 0);
  const totalProfit = totalRevenue - totalExpenses;
  const profitMargin = Math.round((totalProfit / totalRevenue) * 100);

  res.json({
    totalRevenue,
    totalExpenses,
    totalProfit,
    profitMargin: `${profitMargin}%`,
    revenueLastWeek: reports.slice(-7).reduce((sum, r) => sum + r.totalRevenue, 0),
    expensesLastWeek: expenses
      .filter((e) => e.status === "paid")
      .slice(-7)
      .reduce((sum, e) => sum + e.amount, 0),
  });
};

export const getExpenses: RequestHandler = (_req, res) => {
  res.json(expenses);
};

export const createExpense: RequestHandler = (req, res) => {
  const { category, amount, description, date } = req.body;

  if (!category || !amount || !description) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const newExpense: Expense = {
    id: Math.max(...expenses.map((e) => e.id), 0) + 1,
    category,
    amount: parseFloat(amount),
    date: date || new Date().toISOString().split("T")[0],
    description,
    status: "pending",
  };

  expenses.push(newExpense);
  res.status(201).json(newExpense);
};

export const updateExpenseStatus: RequestHandler = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const expense = expenses.find((e) => e.id === parseInt(id));

  if (!expense) {
    res.status(404).json({ error: "Expense not found" });
    return;
  }

  expense.status = status;
  res.json(expense);
};

export const getPaymentBreakdown: RequestHandler = (_req, res) => {
  const reports = generateSalesReports();
  const breakdown = {
    cash: 0,
    card: 0,
    upi: 0,
    other: 0,
  };

  reports.forEach((r) => {
    breakdown.cash += r.paymentBreakdown.cash;
    breakdown.card += r.paymentBreakdown.card;
    breakdown.upi += r.paymentBreakdown.upi;
    breakdown.other += r.paymentBreakdown.other;
  });

  res.json(breakdown);
};

export const getTaxReport: RequestHandler = (_req, res) => {
  const reports = generateSalesReports();
  const totalRevenue = reports.reduce((sum, r) => sum + r.totalRevenue, 0);
  const gstRate = 0.05; // 5% GST
  const gstAmount = Math.round(totalRevenue * gstRate);

  res.json({
    totalRevenue,
    gstRate: `${gstRate * 100}%`,
    gstAmount,
    netAmount: totalRevenue - gstAmount,
    period: "Last 7 days",
  });
};
