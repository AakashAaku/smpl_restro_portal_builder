import { RequestHandler } from "express";

export interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  prepTime: number;
  description: string;
  status: "available" | "unavailable";
}

// Mock data - replace with database queries
let menuItems: MenuItem[] = [
  {
    id: 1,
    name: "Butter Chicken",
    category: "Main Course",
    price: 320,
    prepTime: 25,
    description: "Tender chicken in creamy tomato-based sauce",
    status: "available",
  },
  {
    id: 2,
    name: "Paneer Tikka Masala",
    category: "Main Course",
    price: 280,
    prepTime: 20,
    description: "Grilled paneer in spiced tomato cream sauce",
    status: "available",
  },
  {
    id: 3,
    name: "Garlic Naan",
    category: "Breads",
    price: 60,
    prepTime: 8,
    description: "Soft naan bread topped with garlic and butter",
    status: "available",
  },
];

export const getMenuItems: RequestHandler = (_req, res) => {
  res.json(menuItems);
};

export const getMenuItemById: RequestHandler = (req, res) => {
  const { id } = req.params;
  const item = menuItems.find((item) => item.id === parseInt(id));

  if (!item) {
    res.status(404).json({ error: "Menu item not found" });
    return;
  }

  res.json(item);
};

export const createMenuItem: RequestHandler = (req, res) => {
  const { name, category, price, prepTime, description, status } = req.body;

  // Validation
  if (!name || !category || !price || !prepTime) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const newItem: MenuItem = {
    id: Math.max(...menuItems.map((i) => i.id)) + 1,
    name,
    category,
    price: parseFloat(price),
    prepTime: parseInt(prepTime),
    description: description || "",
    status: status || "available",
  };

  menuItems.push(newItem);
  res.status(201).json(newItem);
};

export const updateMenuItem: RequestHandler = (req, res) => {
  const { id } = req.params;
  const { name, category, price, prepTime, description, status } = req.body;

  const itemIndex = menuItems.findIndex((item) => item.id === parseInt(id));

  if (itemIndex === -1) {
    res.status(404).json({ error: "Menu item not found" });
    return;
  }

  menuItems[itemIndex] = {
    ...menuItems[itemIndex],
    name: name || menuItems[itemIndex].name,
    category: category || menuItems[itemIndex].category,
    price: price !== undefined ? parseFloat(price) : menuItems[itemIndex].price,
    prepTime:
      prepTime !== undefined ? parseInt(prepTime) : menuItems[itemIndex].prepTime,
    description: description || menuItems[itemIndex].description,
    status: status || menuItems[itemIndex].status,
  };

  res.json(menuItems[itemIndex]);
};

export const deleteMenuItem: RequestHandler = (req, res) => {
  const { id } = req.params;

  const itemIndex = menuItems.findIndex((item) => item.id === parseInt(id));

  if (itemIndex === -1) {
    res.status(404).json({ error: "Menu item not found" });
    return;
  }

  const deletedItem = menuItems.splice(itemIndex, 1);
  res.json(deletedItem[0]);
};

export const getMenuCategories: RequestHandler = (_req, res) => {
  const categories = [...new Set(menuItems.map((item) => item.category))];
  res.json(categories);
};
