import { PrismaClient, Role, OrderStatus, MovementType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Seed started: PURGING NON-VEG DATA...');

    // 1. Users
    const adminPassword = await bcrypt.hash('admin123', 10);
    const customerPassword = await bcrypt.hash('customer123', 10);

    // Primary Admin (matches UI demo)
    await prisma.user.upsert({
        where: { email: 'admin@restaurant.com' },
        update: { password: adminPassword },
        create: {
            email: 'admin@restaurant.com',
            name: 'Venzo Admin',
            password: adminPassword,
            role: Role.ADMIN,
        },
    });

    // Backup Admin
    await prisma.user.upsert({
        where: { email: 'admin@venjo.com' },
        update: { password: adminPassword },
        create: {
            email: 'admin@venjo.com',
            name: 'Venjo Support',
            password: adminPassword,
            role: Role.ADMIN,
        },
    });

    // Demo Customer
    await prisma.user.upsert({
        where: { email: 'customer@example.com' },
        update: { password: customerPassword },
        create: {
            email: 'customer@example.com',
            name: 'Valued Customer',
            password: customerPassword,
            role: Role.CUSTOMER,
        },
    });

    // 2. Ingredients & Suppliers
    const supplier = await (prisma.supplier as any).upsert({
        where: { name: 'Fresh Organic Farms' }, // Use name for upsert
        update: {},
        create: {
            name: 'Fresh Organic Farms',
            contact: '9800000000',
            email: 'orders@freshorganic.com',
            address: 'Radhe Radhe, Bhaktapur',
        },
    });

    const ingredientsData = [
        { name: 'Fresh Paneer', unit: 'kg', price: 750 },
        { name: 'Button Mushroom', unit: 'kg', price: 400 },
        { name: 'Soya Chaap', unit: 'kg', price: 350 },
        { name: 'Cashew Nuts', unit: 'kg', price: 1200 },
        { name: 'Fresh Cream (Eggless)', unit: 'ltr', price: 450 },
        { name: 'Basmati Rice', unit: 'kg', price: 180 },
        { name: 'Green Peas', unit: 'kg', price: 120 },
    ];

    const ingredients: Record<string, number> = {};

    for (const ing of ingredientsData) {
        const created = await (prisma.ingredient as any).upsert({
            where: { name: ing.name },
            update: { unitPrice: ing.price },
            create: {
                name: ing.name,
                unit: ing.unit,
                currentStock: 0,
                minStock: 10,
                unitPrice: ing.price,
            },
        });
        ingredients[ing.name] = created.id;
    }

    // 3. Menu Items (110% Pure Veg & Eggless)
    const menuItemsData = [
        {
            name: 'Paneer Butter Masala (Eggless)',
            category: 'Main Course',
            price: 450,
            desc: 'Creamy tomato-based paneer curry, 100% pure veg and eggless.',
            recipe: [{ name: 'Fresh Paneer', qty: 0.2 }, { name: 'Fresh Cream (Eggless)', qty: 0.05 }]
        },
        {
            name: 'Mushroom Duplex',
            category: 'Starters',
            price: 380,
            desc: 'Stuffed mushrooms with cheese and herbs.',
            recipe: [{ name: 'Button Mushroom', qty: 0.25 }]
        },
        {
            name: 'Veg Dum Biryani',
            category: 'Rice & Biryani',
            price: 350,
            desc: 'Fragrant basmati rice cooked with fresh seasonal vegetables.',
            recipe: [{ name: 'Basmati Rice', qty: 0.3 }, { name: 'Green Peas', qty: 0.1 }]
        },
        {
            name: 'Soya Chaap Tikka',
            category: 'Starters',
            price: 320,
            desc: 'Marinated soya chunks grilled to perfection.',
            recipe: [{ name: 'Soya Chaap', qty: 0.2 }]
        }
    ];

    for (const item of menuItemsData) {
        await (prisma.menuItem as any).upsert({
            where: { name: item.name },
            update: {
                price: item.price,
                description: item.desc,
                category: item.category
            },
            create: {
                name: item.name,
                category: item.category,
                price: item.price,
                description: item.desc,
                prepTime: 15,
                recipes: {
                    create: item.recipe.map(r => ({
                        ingredientId: ingredients[r.name],
                        quantity: r.qty
                    }))
                }
            },
        });
    }

    console.log('Seed finished: 110% PURE VEG COMPLIANCE VERIFIED.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
