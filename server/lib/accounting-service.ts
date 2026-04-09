import prisma from "./prisma";
import pkg from "../generated/client";
const { AccountType, EntryType } = pkg;
import type { AccountType as AccountTypeType, EntryType as EntryTypeType } from "../generated/client";

export const CHART_OF_ACCOUNTS = [
  { code: "1001", name: "Cash on Hand", type: AccountType.ASSET },
  { code: "1002", name: "Cash at Bank", type: AccountType.ASSET },
  { code: "1200", name: "Inventory", type: AccountType.ASSET },
  { code: "2000", name: "Accounts Payable", type: AccountType.LIABILITY },
  { code: "2100", name: "VAT Payable", type: AccountType.LIABILITY },
  { code: "3000", name: "Owner's Equity", type: AccountType.EQUITY },
  { code: "4000", name: "Sales Revenue", type: AccountType.REVENUE },
  { code: "5000", name: "Cost of Goods Sold", type: AccountType.EXPENSE },
  { code: "5100", name: "Operating Expenses", type: AccountType.EXPENSE },
];

export async function ensureAccounts() {
  for (const account of CHART_OF_ACCOUNTS) {
    await prisma.account.upsert({
      where: { code: account.code },
      update: { name: account.name, type: account.type },
      create: account,
    });
  }
}

export async function createJournalEntry(tx: any, data: {
  description: string;
  reference?: string;
  orderId?: string;
  entries: { accountCode: string; amount: number; type: EntryTypeType }[];
}) {
  // Validate balance: Sum (Debits) should equal Sum (Credits)
  const debits = data.entries.filter(e => e.type === EntryType.DEBIT).reduce((sum, e) => sum + e.amount, 0);
  const credits = data.entries.filter(e => e.type === EntryType.CREDIT).reduce((sum, e) => sum + e.amount, 0);

  if (Math.abs(debits - credits) > 0.01) {
    throw new Error(`Unbalanced journal entry: Debits(${debits}) != Credits(${credits})`);
  }

  const journalEntry = await tx.journalEntry.create({
    data: {
      description: data.description,
      reference: data.reference,
      orderId: data.orderId,
      ledgerEntries: {
        create: await Promise.all(data.entries.map(async (entry) => {
          const account = await tx.account.findUnique({ where: { code: entry.accountCode } });
          if (!account) throw new Error(`Account not found: ${entry.accountCode}`);
          
          // Update account balance
          const balanceChange = entry.type === EntryType.DEBIT 
            ? (account.type === AccountType.ASSET || account.type === AccountType.EXPENSE ? entry.amount : -entry.amount)
            : (account.type === AccountType.LIABILITY || account.type === AccountType.EQUITY || account.type === AccountType.REVENUE ? entry.amount : -entry.amount);

          await tx.account.update({
            where: { id: account.id },
            data: { balance: { increment: balanceChange } }
          });

          return {
            accountId: account.id,
            amount: entry.amount,
            type: entry.type
          };
        }))
      }
    }
  });

  return journalEntry;
}

export async function recordOrderSale(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: {
        include: {
          menuItem: {
            include: {
              recipes: {
                include: {
                  ingredient: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!order) return;

  // Calculate COGS based on recipe costs
  let totalCogs = 0;
  for (const item of order.orderItems) {
    const itemCogs = item.menuItem.recipes.reduce((sum, r) => sum + (r.quantity * (r.ingredient.unitPrice || 0)), 0);
    totalCogs += itemCogs * item.quantity;
  }

  await prisma.$transaction(async (tx) => {
    // 1. Sales Entry
    await createJournalEntry(tx, {
      description: `Sales Revenue from Order ${order.orderNumber}`,
      reference: order.orderNumber,
      orderId: order.id,
      entries: [
        { accountCode: "1001", amount: order.totalAmount, type: EntryType.DEBIT }, // Cash
        { accountCode: "4000", amount: order.totalAmount, type: EntryType.CREDIT }, // Revenue
      ]
    });

    // 2. COGS & Inventory Adjustment Entry
    if (totalCogs > 0) {
      await createJournalEntry(tx, {
        description: `COGS adjustment for Order ${order.orderNumber}`,
        reference: order.orderNumber,
        orderId: order.id,
        entries: [
          { accountCode: "5000", amount: totalCogs, type: EntryType.DEBIT }, // COGS
          { accountCode: "1200", amount: totalCogs, type: EntryType.CREDIT }, // Inventory
        ]
      });
    }
  });
}

export async function recordPurchaseStock(purchaseId: number) {
  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId },
    include: { supplier: true }
  });

  if (!purchase) return;

  await prisma.$transaction(async (tx) => {
    await createJournalEntry(tx, {
      description: `Stock purchase from ${purchase.supplier.name} (Invoice: ${purchase.invoiceNo || 'N/A'})`,
      reference: `PUR-${purchase.id}`,
      entries: [
        { accountCode: "1200", amount: purchase.totalAmount, type: EntryType.DEBIT }, // Inventory
        { accountCode: "1001", amount: purchase.totalAmount, type: EntryType.CREDIT }, // Cash
      ]
    });
  });
}

export async function recordExpense(expenseId: number) {
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId }
  });

  if (!expense) return;

  await prisma.$transaction(async (tx) => {
    await createJournalEntry(tx, {
      description: `Operating Expense: ${expense.description} (${expense.category})`,
      reference: `EXP-${expense.id}`,
      entries: [
        { accountCode: "5100", amount: expense.amount, type: EntryType.DEBIT }, // Expense
        { accountCode: "1001", amount: expense.amount, type: EntryType.CREDIT }, // Cash
      ]
    });
  });
}
