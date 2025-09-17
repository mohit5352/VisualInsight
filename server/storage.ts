import {
  users,
  categories,
  suppliers,
  inventoryItems,
  customers,
  bills,
  billItems,
  type User,
  type UpsertUser,
  type Category,
  type InsertCategory,
  type Supplier,
  type InsertSupplier,
  type InventoryItem,
  type InsertInventoryItem,
  type InventoryItemWithRelations,
  type Customer,
  type InsertCustomer,
  type CustomerWithStats,
  type Bill,
  type InsertBill,
  type BillWithRelations,
  type BillItem,
  type InsertBillItem,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, count, sum } from "drizzle-orm";

export interface IStorage {
  // User operations (local auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUserWithPassword(userData: { email: string; passwordHash: string; firstName?: string; lastName?: string }): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Category operations
  getCategories(userId: string): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, userId: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string, userId: string): Promise<boolean>;

  // Supplier operations
  getSuppliers(userId: string): Promise<Supplier[]>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: string, userId: string, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined>;
  deleteSupplier(id: string, userId: string): Promise<boolean>;

  // Inventory operations
  getInventoryItems(userId: string): Promise<InventoryItemWithRelations[]>;
  getInventoryItem(id: string, userId: string): Promise<InventoryItemWithRelations | undefined>;
  getLowStockItems(userId: string): Promise<InventoryItemWithRelations[]>;
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  updateInventoryItem(id: string, userId: string, item: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined>;
  deleteInventoryItem(id: string, userId: string): Promise<boolean>;
  updateInventoryQuantity(id: string, userId: string, quantity: number): Promise<InventoryItem | undefined>;

  // Customer operations
  getCustomers(userId: string): Promise<Customer[]>;
  getCustomersWithStats(userId: string): Promise<CustomerWithStats[]>;
  getCustomer(id: string, userId: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, userId: string, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: string, userId: string): Promise<boolean>;

  // Bill operations
  getBills(userId: string): Promise<BillWithRelations[]>;
  getBill(id: string, userId: string): Promise<BillWithRelations | undefined>;
  getRecentTransactions(userId: string, limit?: number): Promise<BillWithRelations[]>;
  createBill(bill: InsertBill, items: Omit<InsertBillItem, 'billId'>[]): Promise<BillWithRelations>;
  updateBillStatus(id: string, userId: string, status: string): Promise<Bill | undefined>;
  deleteBill(id: string, userId: string): Promise<boolean>;

  // Dashboard statistics
  getDashboardStats(userId: string): Promise<{
    totalInventory: number;
    lowStockItems: number;
    totalCustomers: number;
    monthlyRevenue: string;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUserWithPassword(userData: { email: string; passwordHash: string; firstName?: string; lastName?: string }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Category operations
  async getCategories(userId: string): Promise<Category[]> {
    return db.select().from(categories).where(eq(categories.userId, userId));
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [created] = await db.insert(categories).values(category).returning();
    return created;
  }

  async updateCategory(id: string, userId: string, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const [updated] = await db
      .update(categories)
      .set(category)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .returning();
    return updated;
  }

  async deleteCategory(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  // Supplier operations
  async getSuppliers(userId: string): Promise<Supplier[]> {
    return db.select().from(suppliers).where(eq(suppliers.userId, userId));
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const [created] = await db.insert(suppliers).values(supplier).returning();
    return created;
  }

  async updateSupplier(id: string, userId: string, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const [updated] = await db
      .update(suppliers)
      .set(supplier)
      .where(and(eq(suppliers.id, id), eq(suppliers.userId, userId)))
      .returning();
    return updated;
  }

  async deleteSupplier(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(suppliers)
      .where(and(eq(suppliers.id, id), eq(suppliers.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  // Inventory operations
  async getInventoryItems(userId: string): Promise<InventoryItemWithRelations[]> {
    const results = await db
      .select({
        id: inventoryItems.id,
        name: inventoryItems.name,
        description: inventoryItems.description,
        categoryId: inventoryItems.categoryId,
        supplierId: inventoryItems.supplierId,
        quantity: inventoryItems.quantity,
        minStockLevel: inventoryItems.minStockLevel,
        unitPrice: inventoryItems.unitPrice,
        sku: inventoryItems.sku,
        userId: inventoryItems.userId,
        createdAt: inventoryItems.createdAt,
        updatedAt: inventoryItems.updatedAt,
        category: categories,
        supplier: suppliers,
      })
      .from(inventoryItems)
      .leftJoin(categories, eq(inventoryItems.categoryId, categories.id))
      .leftJoin(suppliers, eq(inventoryItems.supplierId, suppliers.id))
      .where(eq(inventoryItems.userId, userId))
      .orderBy(desc(inventoryItems.createdAt));

    return results.map(result => ({
      ...result,
      category: result.category || undefined,
      supplier: result.supplier || undefined,
    }));
  }

  async getInventoryItem(id: string, userId: string): Promise<InventoryItemWithRelations | undefined> {
    const [result] = await db
      .select({
        id: inventoryItems.id,
        name: inventoryItems.name,
        description: inventoryItems.description,
        categoryId: inventoryItems.categoryId,
        supplierId: inventoryItems.supplierId,
        quantity: inventoryItems.quantity,
        minStockLevel: inventoryItems.minStockLevel,
        unitPrice: inventoryItems.unitPrice,
        sku: inventoryItems.sku,
        userId: inventoryItems.userId,
        createdAt: inventoryItems.createdAt,
        updatedAt: inventoryItems.updatedAt,
        category: categories,
        supplier: suppliers,
      })
      .from(inventoryItems)
      .leftJoin(categories, eq(inventoryItems.categoryId, categories.id))
      .leftJoin(suppliers, eq(inventoryItems.supplierId, suppliers.id))
      .where(and(eq(inventoryItems.id, id), eq(inventoryItems.userId, userId)));
    
    if (!result) return undefined;
    
    return {
      ...result,
      category: result.category || undefined,
      supplier: result.supplier || undefined,
    };
  }

  async getLowStockItems(userId: string): Promise<InventoryItemWithRelations[]> {
    const results = await db
      .select({
        id: inventoryItems.id,
        name: inventoryItems.name,
        description: inventoryItems.description,
        categoryId: inventoryItems.categoryId,
        supplierId: inventoryItems.supplierId,
        quantity: inventoryItems.quantity,
        minStockLevel: inventoryItems.minStockLevel,
        unitPrice: inventoryItems.unitPrice,
        sku: inventoryItems.sku,
        userId: inventoryItems.userId,
        createdAt: inventoryItems.createdAt,
        updatedAt: inventoryItems.updatedAt,
        category: categories,
        supplier: suppliers,
      })
      .from(inventoryItems)
      .leftJoin(categories, eq(inventoryItems.categoryId, categories.id))
      .leftJoin(suppliers, eq(inventoryItems.supplierId, suppliers.id))
      .where(
        and(
          eq(inventoryItems.userId, userId),
          sql`${inventoryItems.quantity} <= ${inventoryItems.minStockLevel}`
        )
      );

    return results.map(result => ({
      ...result,
      category: result.category || undefined,
      supplier: result.supplier || undefined,
    }));
  }

  async createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem> {
    const [created] = await db.insert(inventoryItems).values(item).returning();
    return created;
  }

  async updateInventoryItem(id: string, userId: string, item: Partial<InsertInventoryItem>): Promise<InventoryItem | undefined> {
    const [updated] = await db
      .update(inventoryItems)
      .set({ ...item, updatedAt: new Date() })
      .where(and(eq(inventoryItems.id, id), eq(inventoryItems.userId, userId)))
      .returning();
    return updated;
  }

  async deleteInventoryItem(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(inventoryItems)
      .where(and(eq(inventoryItems.id, id), eq(inventoryItems.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  async updateInventoryQuantity(id: string, userId: string, quantity: number): Promise<InventoryItem | undefined> {
    const [updated] = await db
      .update(inventoryItems)
      .set({ quantity, updatedAt: new Date() })
      .where(and(eq(inventoryItems.id, id), eq(inventoryItems.userId, userId)))
      .returning();
    return updated;
  }

  // Customer operations
  async getCustomers(userId: string): Promise<Customer[]> {
    return db.select().from(customers).where(eq(customers.userId, userId)).orderBy(desc(customers.createdAt));
  }

  async getCustomersWithStats(userId: string): Promise<CustomerWithStats[]> {
    return db
      .select({
        id: customers.id,
        name: customers.name,
        email: customers.email,
        phone: customers.phone,
        address: customers.address,
        city: customers.city,
        state: customers.state,
        zipCode: customers.zipCode,
        taxId: customers.taxId,
        userId: customers.userId,
        createdAt: customers.createdAt,
        updatedAt: customers.updatedAt,
        totalBills: count(bills.id),
        totalAmount: sql<string>`COALESCE(SUM(${bills.total}), 0)`,
        lastOrderDate: sql<Date>`MAX(${bills.createdAt})`,
      })
      .from(customers)
      .leftJoin(bills, eq(customers.id, bills.customerId))
      .where(eq(customers.userId, userId))
      .groupBy(customers.id)
      .orderBy(desc(customers.createdAt));
  }

  async getCustomer(id: string, userId: string): Promise<Customer | undefined> {
    const [customer] = await db
      .select()
      .from(customers)
      .where(and(eq(customers.id, id), eq(customers.userId, userId)));
    return customer;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [created] = await db.insert(customers).values(customer).returning();
    return created;
  }

  async updateCustomer(id: string, userId: string, customer: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const [updated] = await db
      .update(customers)
      .set({ ...customer, updatedAt: new Date() })
      .where(and(eq(customers.id, id), eq(customers.userId, userId)))
      .returning();
    return updated;
  }

  async deleteCustomer(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(customers)
      .where(and(eq(customers.id, id), eq(customers.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  // Bill operations
  async getBills(userId: string): Promise<BillWithRelations[]> {
    const billsData = await db
      .select()
      .from(bills)
      .where(eq(bills.userId, userId))
      .orderBy(desc(bills.createdAt));

    const billsWithRelations: BillWithRelations[] = [];

    for (const bill of billsData) {
      const customer = await this.getCustomer(bill.customerId, userId);
      const items = await db
        .select({
          id: billItems.id,
          billId: billItems.billId,
          inventoryItemId: billItems.inventoryItemId,
          quantity: billItems.quantity,
          unitPrice: billItems.unitPrice,
          total: billItems.total,
          createdAt: billItems.createdAt,
          inventoryItem: inventoryItems,
        })
        .from(billItems)
        .innerJoin(inventoryItems, eq(billItems.inventoryItemId, inventoryItems.id))
        .where(eq(billItems.billId, bill.id));

      if (customer) {
        billsWithRelations.push({
          ...bill,
          customer,
          billItems: items,
        });
      }
    }

    return billsWithRelations;
  }

  async getBill(id: string, userId: string): Promise<BillWithRelations | undefined> {
    const [bill] = await db
      .select()
      .from(bills)
      .where(and(eq(bills.id, id), eq(bills.userId, userId)));

    if (!bill) return undefined;

    const customer = await this.getCustomer(bill.customerId, userId);
    if (!customer) return undefined;

    const items = await db
      .select({
        id: billItems.id,
        billId: billItems.billId,
        inventoryItemId: billItems.inventoryItemId,
        quantity: billItems.quantity,
        unitPrice: billItems.unitPrice,
        total: billItems.total,
        createdAt: billItems.createdAt,
        inventoryItem: inventoryItems,
      })
      .from(billItems)
      .innerJoin(inventoryItems, eq(billItems.inventoryItemId, inventoryItems.id))
      .where(eq(billItems.billId, bill.id));

    return {
      ...bill,
      customer,
      billItems: items,
    };
  }

  async getRecentTransactions(userId: string, limit = 10): Promise<BillWithRelations[]> {
    const recentBills = await this.getBills(userId);
    return recentBills.slice(0, limit);
  }

  async createBill(bill: InsertBill, items: Omit<InsertBillItem, 'billId'>[]): Promise<BillWithRelations> {
    // Generate bill number
    const billCount = await db.select({ count: count() }).from(bills).where(eq(bills.userId, bill.userId));
    const billNumber = `INV-${String(billCount[0].count + 1).padStart(6, '0')}`;

    const [createdBill] = await db
      .insert(bills)
      .values({ ...bill, billNumber })
      .returning();

    // Insert bill items
    const billItemsWithBillId = items.map(item => ({
      ...item,
      billId: createdBill.id,
    }));

    await db.insert(billItems).values(billItemsWithBillId);

    // Update inventory quantities
    for (const item of items) {
      await db
        .update(inventoryItems)
        .set({
          quantity: sql`${inventoryItems.quantity} - ${item.quantity}`,
          updatedAt: new Date(),
        })
        .where(eq(inventoryItems.id, item.inventoryItemId));
    }

    const fullBill = await this.getBill(createdBill.id, bill.userId);
    if (!fullBill) throw new Error("Failed to retrieve created bill");

    return fullBill;
  }

  async updateBillStatus(id: string, userId: string, status: string): Promise<Bill | undefined> {
    const [updated] = await db
      .update(bills)
      .set({ 
        status, 
        paidDate: status === 'paid' ? new Date() : null,
        updatedAt: new Date() 
      })
      .where(and(eq(bills.id, id), eq(bills.userId, userId)))
      .returning();
    return updated;
  }

  async deleteBill(id: string, userId: string): Promise<boolean> {
    // First, restore inventory quantities
    const billItemsData = await db
      .select()
      .from(billItems)
      .where(eq(billItems.billId, id));

    for (const item of billItemsData) {
      await db
        .update(inventoryItems)
        .set({
          quantity: sql`${inventoryItems.quantity} + ${item.quantity}`,
          updatedAt: new Date(),
        })
        .where(eq(inventoryItems.id, item.inventoryItemId));
    }

    // Delete bill items
    await db.delete(billItems).where(eq(billItems.billId, id));

    // Delete bill
    const result = await db
      .delete(bills)
      .where(and(eq(bills.id, id), eq(bills.userId, userId)));

    return (result.rowCount ?? 0) > 0;
  }

  // Dashboard statistics
  async getDashboardStats(userId: string): Promise<{
    totalInventory: number;
    lowStockItems: number;
    totalCustomers: number;
    monthlyRevenue: string;
  }> {
    const [inventoryCount] = await db
      .select({ count: count() })
      .from(inventoryItems)
      .where(eq(inventoryItems.userId, userId));

    const [lowStockCount] = await db
      .select({ count: count() })
      .from(inventoryItems)
      .where(
        and(
          eq(inventoryItems.userId, userId),
          sql`${inventoryItems.quantity} <= ${inventoryItems.minStockLevel}`
        )
      );

    const [customerCount] = await db
      .select({ count: count() })
      .from(customers)
      .where(eq(customers.userId, userId));

    const [monthlyRevenue] = await db
      .select({ 
        revenue: sql<string>`COALESCE(SUM(${bills.total}), 0)` 
      })
      .from(bills)
      .where(
        and(
          eq(bills.userId, userId),
          sql`EXTRACT(MONTH FROM ${bills.createdAt}) = EXTRACT(MONTH FROM CURRENT_DATE)`,
          sql`EXTRACT(YEAR FROM ${bills.createdAt}) = EXTRACT(YEAR FROM CURRENT_DATE)`
        )
      );

    return {
      totalInventory: inventoryCount.count,
      lowStockItems: lowStockCount.count,
      totalCustomers: customerCount.count,
      monthlyRevenue: monthlyRevenue.revenue || "0",
    };
  }
}

export const storage = new DatabaseStorage();
