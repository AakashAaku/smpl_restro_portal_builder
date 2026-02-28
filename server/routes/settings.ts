import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// Get settings
router.get("/", async (req, res) => {
    try {
        let setting = await prisma.setting.findUnique({
            where: { id: 1 },
        });

        if (!setting) {
            setting = await prisma.setting.create({
                data: {
                    id: 1,
                    restaurantName: "Venjo Restro",
                    taxPercentage: 5,
                },
            });
        }

        res.json(setting);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch settings" });
    }
});

// Update settings
router.put("/", async (req, res) => {
    try {
        const setting = await prisma.setting.upsert({
            where: { id: 1 },
            update: req.body,
            create: { ...req.body, id: 1 },
        });
        res.json(setting);
    } catch (error) {
        res.status(500).json({ error: "Failed to update settings" });
    }
});

export default router;
