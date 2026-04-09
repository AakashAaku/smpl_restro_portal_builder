import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// Get all promotions
router.get("/", async (req, res) => {
    try {
        const promotions = await prisma.promotion.findMany();
        res.json(promotions);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch promotions" });
    }
});

// Create promotion
router.post("/", async (req, res) => {
    try {
        const promotion = await prisma.promotion.create({
            data: req.body,
        });
        res.json(promotion);
    } catch (error) {
        res.status(500).json({ error: "Failed to create promotion" });
    }
});

// Update promotion
router.put("/:id", async (req, res) => {
    try {
        const promotion = await prisma.promotion.update({
            where: { id: parseInt(req.params.id) },
            data: req.body,
        });
        res.json(promotion);
    } catch (error) {
        res.status(500).json({ error: "Failed to update promotion" });
    }
});

// Delete promotion
router.delete("/:id", async (req, res) => {
    try {
        await prisma.promotion.delete({
            where: { id: parseInt(req.params.id) },
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete promotion" });
    }
});

// --- Coupons ---

// Get all coupons
router.get("/coupons", async (req, res) => {
    try {
        const coupons = await prisma.coupon.findMany();
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch coupons" });
    }
});

// Create coupon
router.post("/coupons", async (req, res) => {
    try {
        const coupon = await prisma.coupon.create({
            data: req.body,
        });
        res.json(coupon);
    } catch (error) {
        res.status(500).json({ error: "Failed to create coupon" });
    }
});

// Update coupon
router.put("/coupons/:id", async (req, res) => {
    try {
        const coupon = await prisma.coupon.update({
            where: { id: parseInt(req.params.id) },
            data: req.body,
        });
        res.json(coupon);
    } catch (error) {
        res.status(500).json({ error: "Failed to update coupon" });
    }
});

// Delete coupon
router.delete("/coupons/:id", async (req, res) => {
    try {
        await prisma.coupon.delete({
            where: { id: parseInt(req.params.id) },
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete coupon" });
    }
});

export default router;
