import { RequestHandler } from "express";
import prisma from "../lib/prisma";

export const getRequisitions: RequestHandler = async (_req, res) => {
    try {
        const requisitions = await prisma.requisition.findMany({
            include: {
                items: {
                    include: { ingredient: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        res.json(requisitions);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch requisitions" });
    }
};

export const createRequisition: RequestHandler = async (req, res) => {
    try {
        const { staffId, items, notes } = req.body;

        if (!staffId || !items || items.length === 0) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }

        const requisitionNo = `REQ-${Date.now()}`;

        const requisition = await prisma.requisition.create({
            data: {
                requisitionNo,
                staffId: parseInt(staffId),
                notes,
                items: {
                    create: items.map((item: any) => ({
                        ingredientId: parseInt(item.ingredientId),
                        quantity: parseFloat(item.quantity),
                    })),
                },
            },
            include: {
                items: true,
            },
        });

        res.status(201).json(requisition);
    } catch (error) {
        console.error("Create requisition error:", error);
        res.status(500).json({ error: "Failed to create requisition" });
    }
};

export const updateRequisitionStatus: RequestHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updated = await prisma.requisition.update({
            where: { id: parseInt(id) },
            data: { status },
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: "Failed to update requisition" });
    }
};
