import { RequestHandler } from "express";

export interface RecipeItem {
    ingredientId: number;
    name: string;
    quantity: number;
    unit: string;
}

export interface FinishedGood {
    id: number;
    name: string;
    category: string;
    price: number;
    cost: number;
    stock: number;
    recipe: RecipeItem[];
}

let finishedGoods: FinishedGood[] = [];

export const getFinishedGoods: RequestHandler = (_req, res) => {
    res.json(finishedGoods);
};

export const createFinishedGood: RequestHandler = (req, res) => {
    const { name, category, price, cost, recipe } = req.body;

    if (!name || !category || price === undefined || !recipe) {
        res.status(400).json({ error: "Missing required fields" });
        return;
    }

    const newGood: FinishedGood = {
        id: Math.max(...finishedGoods.map((g) => g.id), 0) + 1,
        name,
        category,
        price: parseFloat(price),
        cost: parseFloat(cost || 0),
        stock: 0,
        recipe: recipe || [],
    };

    finishedGoods.push(newGood);
    res.status(201).json(newGood);
};

export const updateFinishedGood: RequestHandler = (req, res) => {
    const { id } = req.params;
    const { name, category, price, cost, recipe } = req.body;

    const index = finishedGoods.findIndex((g) => g.id === parseInt(id as string));
    if (index === -1) {
        res.status(404).json({ error: "Finished good not found" });
        return;
    }

    finishedGoods[index] = {
        ...finishedGoods[index],
        name: name || finishedGoods[index].name,
        category: category || finishedGoods[index].category,
        price: price !== undefined ? parseFloat(price) : finishedGoods[index].price,
        cost: cost !== undefined ? parseFloat(cost) : finishedGoods[index].cost,
        recipe: recipe || finishedGoods[index].recipe,
    };

    res.json(finishedGoods[index]);
};

export const produceFinishedGood: RequestHandler = (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;

    const good = finishedGoods.find((g) => g.id === parseInt(id as string));
    if (!good) {
        res.status(404).json({ error: "Finished good not found" });
        return;
    }

    // In a real app, we would deduct raw materials here.
    // For now, satisfy the user's need for functional flow.
    good.stock += parseFloat(quantity || 1);

    res.json({ message: "Production recorded", good });
};
