import {
  users,
  categories,
  suppliers,
  inventoryItems,
  customers,
  bills,
  billItems,
  payments,
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
  type Payment,
  type InsertPayment,
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

  // Customer Purchase History operations
  getCustomerPurchaseHistory(customerId: string, userId: string, startDate?: Date, endDate?: Date): Promise<BillWithRelations[]>;
  createBillForCustomer(bill: InsertBill, items: Omit<InsertBillItem, 'billId'>[], customerId: string): Promise<BillWithRelations>;
  
  // Date-wise Purchase History operations
  getDailyPurchaseHistory(userId: string, date: Date): Promise<BillWithRelations[]>;
  getDateRangePurchaseHistory(userId: string, startDate: Date, endDate: Date): Promise<BillWithRelations[]>;
  
  // Payment operations
  getBillPayments(billId: string, userId: string): Promise<Payment[]>;
  recordPayment(payment: InsertPayment): Promise<Payment>;
  getBillWithPayments(billId: string, userId: string): Promise<BillWithRelations | undefined>;

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

  // Customer Purchase History operations
  async getCustomerPurchaseHistory(customerId: string, userId: string, startDate?: Date, endDate?: Date): Promise<BillWithRelations[]> {
    let whereConditions = [eq(bills.customerId, customerId), eq(bills.userId, userId)];

    if (startDate) {
      whereConditions.push(sql`DATE(${bills.createdAt}) >= DATE(${startDate})`);
    }
    if (endDate) {
      whereConditions.push(sql`DATE(${bills.createdAt}) <= DATE(${endDate})`);
    }

    const billsData = await db
      .select()
      .from(bills)
      .where(and(...whereConditions))
      .orderBy(desc(bills.createdAt));

    const billsWithRelations: BillWithRelations[] = [];

    for (const bill of billsData) {
      const customer = await this.getCustomer(bill.customerId, userId);
      if (!customer) continue;

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

      const enrichedBill = await this.enrichBillWithPayments(bill, customer, items);
      billsWithRelations.push(enrichedBill);
    }

    return billsWithRelations;
  }

  async createBillForCustomer(bill: InsertBill, items: Omit<InsertBillItem, 'billId'>[], customerId: string): Promise<BillWithRelations> {
    // Verify customer exists and belongs to user
    const customer = await this.getCustomer(customerId, bill.userId);
    if (!customer) {
      throw new Error("Customer not found");
    }

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

    const fullBill = await this.getBillWithPayments(createdBill.id, bill.userId);
    if (!fullBill) throw new Error("Failed to retrieve created bill");

    return fullBill;
  }

  // Helper method to get payments and calculate outstanding amounts
  private async enrichBillWithPayments(bill: Bill, customer: Customer, items: any[]): Promise<BillWithRelations> {
    const billPayments = await db
      .select()
      .from(payments)
      .where(eq(payments.billId, bill.id))
      .orderBy(desc(payments.paymentDate));

    const paidAmount = billPayments.reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0);
    const total = parseFloat(bill.total || "0");
    const outstandingAmount = Math.max(0, total - paidAmount);

    return {
      ...bill,
      customer,
      billItems: items,
      payments: billPayments,
      paidAmount: paidAmount.toFixed(2),
      outstandingAmount: outstandingAmount.toFixed(2),
    };
  }

  // Date-wise Purchase History operations
  async getDailyPurchaseHistory(userId: string, date: Date): Promise<BillWithRelations[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.getDateRangePurchaseHistory(userId, startOfDay, endOfDay);
  }

  async getDateRangePurchaseHistory(userId: string, startDate: Date, endDate: Date): Promise<BillWithRelations[]> {
    const billsData = await db
      .select()
      .from(bills)
      .where(
        and(
          eq(bills.userId, userId),
          sql`DATE(${bills.createdAt}) >= DATE(${startDate})`,
          sql`DATE(${bills.createdAt}) <= DATE(${endDate})`
        )
      )
      .orderBy(bills.createdAt);

    const billsWithRelations: BillWithRelations[] = [];

    for (const bill of billsData) {
      const customer = await this.getCustomer(bill.customerId, userId);
      if (!customer) continue;

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

      const enrichedBill = await this.enrichBillWithPayments(bill, customer, items);
      billsWithRelations.push(enrichedBill);
    }

    return billsWithRelations;
  }

  // Payment operations
  async getBillPayments(billId: string, userId: string): Promise<Payment[]> {
    // Verify bill belongs to user
    const [bill] = await db
      .select()
      .from(bills)
      .where(and(eq(bills.id, billId), eq(bills.userId, userId)));

    if (!bill) return [];

    return db
      .select()
      .from(payments)
      .where(eq(payments.billId, billId))
      .orderBy(desc(payments.paymentDate));
  }

  async recordPayment(payment: InsertPayment): Promise<Payment> {
    // Verify bill exists and belongs to user
    const [bill] = await db
      .select()
      .from(bills)
      .where(and(eq(bills.id, payment.billId), eq(bills.userId, payment.userId)));

    if (!bill) {
      throw new Error("Bill not found");
    }

    const [createdPayment] = await db.insert(payments).values(payment).returning();

    // Update bill status if fully paid
    const existingPayments = await this.getBillPayments(bill.id, payment.userId);
    const totalPaid = existingPayments.reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0) + parseFloat(payment.amount || "0");
    const billTotal = parseFloat(bill.total || "0");

    if (totalPaid >= billTotal) {
      await db
        .update(bills)
        .set({ status: "paid", paidDate: new Date(), updatedAt: new Date() })
        .where(eq(bills.id, bill.id));
    } else if (bill.status === "pending" && totalPaid > 0) {
      await db
        .update(bills)
        .set({ status: "partial", updatedAt: new Date() })
        .where(eq(bills.id, bill.id));
    }

    return createdPayment;
  }

  async getBillWithPayments(billId: string, userId: string): Promise<BillWithRelations | undefined> {
    const [bill] = await db
      .select()
      .from(bills)
      .where(and(eq(bills.id, billId), eq(bills.userId, userId)));

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

    return this.enrichBillWithPayments(bill, customer, items);
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
        const enrichedBill = await this.enrichBillWithPayments(bill, customer, items);
        billsWithRelations.push(enrichedBill);
      }
    }

    return billsWithRelations;
  }

  async getBill(id: string, userId: string): Promise<BillWithRelations | undefined> {
    return this.getBillWithPayments(id, userId);
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
