import { RequestHandler } from "express";
import prisma from "../lib/prisma";

export const getTables: RequestHandler = async (_req, res) => {
    try {
        const tables = await prisma.table.findMany({
            orderBy: { number: "asc" },
        });
        res.json(tables);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch tables" });
    }
};

export const getTableById: RequestHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const table = await prisma.table.findUnique({
            where: { id: parseInt(id) },
        });
        if (!table) {
            res.status(404).json({ error: "Table not found" });
            return;
        }
        res.json(table);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch table" });
    }
};

export const createTable: RequestHandler = async (req, res) => {
    try {
        const { number, capacity, customerName, customerPhone, partySize, notes } = req.body;
        const table = await prisma.table.create({
            data: {
                number,
                capacity: parseInt(capacity),
                status: "available",
                customerName,
                customerPhone,
                partySize: partySize ? parseInt(partySize) : undefined,
                notes,
            },
        });
        res.status(201).json(table);
    } catch (error: any) {
        if (error.code === "P2002") {
            res.status(400).json({ error: "Table number already exists" });
        } else {
            res.status(500).json({ error: "Failed to create table" });
        }
    }
};

export const updateTable: RequestHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const { number, capacity, status, customerName, customerPhone, partySize, notes } = req.body;

        const data: any = {
            number,
            capacity: capacity ? parseInt(capacity) : undefined,
            status,
            customerName,
            customerPhone,
            partySize: partySize ? parseInt(partySize) : undefined,
            notes,
        };

        if (status === "occupied" && !req.body.checkedInTime) {
            data.checkedInTime = new Date();
        } else if (status === "available") {
            data.customerName = null;
            data.customerPhone = null;
            data.partySize = null;
            data.checkedInTime = null;
            data.notes = null;
        }

        const table = await prisma.table.update({
            where: { id: parseInt(id) },
            data,
        });
        res.json(table);
    } catch (error) {
        res.status(500).json({ error: "Failed to update table" });
    }
};

export const deleteTable: RequestHandler = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.table.delete({
            where: { id: parseInt(id) },
        });
        res.json({ message: "Table deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete table" });
    }
};

export const updateTableStatus: RequestHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const table = await prisma.table.update({
            where: { id: parseInt(id) },
            data: { status },
        });
        res.json(table);
    } catch (error) {
        res.status(500).json({ error: "Failed to update table status" });
    }
};
