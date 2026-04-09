import { Router } from "express";
import prisma from "../lib/prisma";

const router = Router();

// Get all staff
router.get("/", async (_req, res) => {
  try {
    const staff = await prisma.staff.findMany({
      orderBy: { name: "asc" },
    });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch staff" });
  }
});

// Get staff stats
router.get("/stats", async (_req, res) => {
  try {
    const totalStaff = await prisma.staff.count();
    const roleStats = await prisma.staff.groupBy({
      by: ["role"],
      _count: { _all: true },
    });

    const roleCounts: Record<string, number> = {};
    roleStats.forEach((stat) => {
      roleCounts[stat.role.toLowerCase()] = stat._count._all;
    });

    const averagePerformance = await prisma.staff.aggregate({
      _avg: { performanceRating: true },
    });

    res.json({
      totalStaff,
      activeStaff: totalStaff,
      roleCounts,
      averagePerformance: Math.round(averagePerformance._avg.performanceRating || 0),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch staff stats" });
  }
});

// Get staff by role
router.get("/role/:role", async (req, res) => {
  try {
    const { role } = req.params;
    const staff = await prisma.staff.findMany({
      where: { role: role as string },
    });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch staff by role" });
  }
});

// Get staff by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const member = await prisma.staff.findUnique({
      where: { id: parseInt(id as string) },
    });

    if (!member) {
      res.status(404).json({ error: "Staff member not found" });
      return;
    }

    res.json(member);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch staff member" });
  }
});

// Create staff member
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;

    if (!name || !email || !phone || !role) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const newMember = await prisma.staff.create({
      data: { name, email, phone, role },
    });

    res.status(201).json(newMember);
  } catch (error) {
    res.status(500).json({ error: "Failed to create staff member" });
  }
});

// Update staff member
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role } = req.body;

    const updatedMember = await prisma.staff.update({
      where: { id: parseInt(id as string) },
      data: { name, email, phone, role },
    });

    res.json(updatedMember);
  } catch (error) {
    if ((error as any).code === "P2025") {
      res.status(404).json({ error: "Staff member not found" });
    } else {
      res.status(500).json({ error: "Failed to update staff member" });
    }
  }
});

// Delete staff member
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.staff.delete({
      where: { id: parseInt(id as string) },
    });
    res.json({ message: "Staff member deleted" });
  } catch (error) {
    if ((error as any).code === "P2025") {
      res.status(404).json({ error: "Staff member not found" });
    } else {
      res.status(500).json({ error: "Failed to delete staff member" });
    }
  }
});

// Update performance
router.put("/:id/performance", async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    const updatedMember = await prisma.staff.update({
      where: { id: parseInt(id as string) },
      data: { performanceRating: parseFloat(rating) },
    });

    res.json(updatedMember);
  } catch (error) {
    res.status(500).json({ error: "Failed to update performance" });
  }
});

export default router;
