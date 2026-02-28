import { RequestHandler } from "express";
import prisma from "../lib/prisma";

export const getAssets: RequestHandler = async (_req, res) => {
    try {
        const assets = await prisma.asset.findMany({
            orderBy: { createdAt: "desc" },
        });
        res.json(assets);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch assets" });
    }
};

export const createAsset: RequestHandler = async (req, res) => {
    try {
        const { name, category, value, status, purchaseDate } = req.body;

        if (!name || !category || value === undefined) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }

        const newAsset = await prisma.asset.create({
            data: {
                name,
                category,
                value: parseFloat(value),
                status: status || "active",
                purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
            },
        });

        res.status(201).json(newAsset);
    } catch (error) {
        res.status(500).json({ error: "Failed to create asset" });
    }
};

export const updateAsset: RequestHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const updated = await prisma.asset.update({
            where: { id: parseInt(id) },
            data: {
                ...data,
                value: data.value ? parseFloat(data.value) : undefined,
                purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
            },
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: "Failed to update asset" });
    }
};

export const deleteAsset: RequestHandler = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.asset.delete({
            where: { id: parseInt(id) },
        });
        res.json({ message: "Asset deleted" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete asset" });
    }
};
