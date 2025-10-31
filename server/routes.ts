import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./localAuth";
import type { PublicUser } from "@shared/schema";
import { 
  insertCategorySchema,
  insertSupplierSchema,
  insertInventoryItemSchema,
  insertCustomerSchema,
  insertBillSchema,
  insertBillItemSchema,
  insertPaymentSchema,
  type InsertBill,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return public user data without password hash
      const { passwordHash, ...publicUser } = user;
      res.json(publicUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/dashboard/recent-transactions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const limit = parseInt(req.query.limit as string) || 10;
      const transactions = await storage.getRecentTransactions(userId, limit);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching recent transactions:", error);
      res.status(500).json({ message: "Failed to fetch recent transactions" });
    }
  });

  app.get("/api/dashboard/low-stock", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const lowStockItems = await storage.getLowStockItems(userId);
      res.json(lowStockItems);
    } catch (error) {
      console.error("Error fetching low stock items:", error);
      res.status(500).json({ message: "Failed to fetch low stock items" });
    }
  });

  // Category routes
  app.get("/api/categories", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const categories = await storage.getCategories(userId);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const categoryData = insertCategorySchema.parse({ ...req.body, userId });
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid category data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create category" });
      }
    }
  });

  app.put("/api/categories/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { id } = req.params;
      const categoryData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(id, userId, categoryData);
      if (!category) {
        res.status(404).json({ message: "Category not found" });
        return;
      }
      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid category data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update category" });
      }
    }
  });

  app.delete("/api/categories/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { id } = req.params;
      const success = await storage.deleteCategory(id, userId);
      if (!success) {
        res.status(404).json({ message: "Category not found" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Supplier routes
  app.get("/api/suppliers", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const suppliers = await storage.getSuppliers(userId);
      res.json(suppliers);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  app.post("/api/suppliers", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const supplierData = insertSupplierSchema.parse({ ...req.body, userId });
      const supplier = await storage.createSupplier(supplierData);
      res.status(201).json(supplier);
    } catch (error) {
      console.error("Error creating supplier:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid supplier data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create supplier" });
      }
    }
  });

  app.put("/api/suppliers/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { id } = req.params;
      const supplierData = insertSupplierSchema.partial().parse(req.body);
      const supplier = await storage.updateSupplier(id, userId, supplierData);
      if (!supplier) {
        res.status(404).json({ message: "Supplier not found" });
        return;
      }
      res.json(supplier);
    } catch (error) {
      console.error("Error updating supplier:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid supplier data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update supplier" });
      }
    }
  });

  app.delete("/api/suppliers/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { id } = req.params;
      const success = await storage.deleteSupplier(id, userId);
      if (!success) {
        res.status(404).json({ message: "Supplier not found" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting supplier:", error);
      res.status(500).json({ message: "Failed to delete supplier" });
    }
  });

  // Inventory routes
  app.get("/api/inventory", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const items = await storage.getInventoryItems(userId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });

  app.get("/api/inventory/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { id } = req.params;
      const item = await storage.getInventoryItem(id, userId);
      if (!item) {
        res.status(404).json({ message: "Inventory item not found" });
        return;
      }
      res.json(item);
    } catch (error) {
      console.error("Error fetching inventory item:", error);
      res.status(500).json({ message: "Failed to fetch inventory item" });
    }
  });

  app.post("/api/inventory", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const itemData = insertInventoryItemSchema.parse({ ...req.body, userId });
      const item = await storage.createInventoryItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating inventory item:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid inventory item data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create inventory item" });
      }
    }
  });

  app.put("/api/inventory/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { id } = req.params;
      const itemData = insertInventoryItemSchema.partial().parse(req.body);
      const item = await storage.updateInventoryItem(id, userId, itemData);
      if (!item) {
        res.status(404).json({ message: "Inventory item not found" });
        return;
      }
      res.json(item);
    } catch (error) {
      console.error("Error updating inventory item:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid inventory item data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update inventory item" });
      }
    }
  });

  app.put("/api/inventory/:id/quantity", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { id } = req.params;
      const { quantity } = req.body;
      
      if (typeof quantity !== 'number' || quantity < 0) {
        res.status(400).json({ message: "Invalid quantity" });
        return;
      }

      const item = await storage.updateInventoryQuantity(id, userId, quantity);
      if (!item) {
        res.status(404).json({ message: "Inventory item not found" });
        return;
      }
      res.json(item);
    } catch (error) {
      console.error("Error updating inventory quantity:", error);
      res.status(500).json({ message: "Failed to update inventory quantity" });
    }
  });

  app.delete("/api/inventory/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { id } = req.params;
      const success = await storage.deleteInventoryItem(id, userId);
      if (!success) {
        res.status(404).json({ message: "Inventory item not found" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting inventory item:", error);
      res.status(500).json({ message: "Failed to delete inventory item" });
    }
  });

  // Customer routes
  app.get("/api/customers", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const withStats = req.query.withStats === 'true';
      const customers = withStats 
        ? await storage.getCustomersWithStats(userId)
        : await storage.getCustomers(userId);
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { id } = req.params;
      const customer = await storage.getCustomer(id, userId);
      if (!customer) {
        res.status(404).json({ message: "Customer not found" });
        return;
      }
      res.json(customer);
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  app.post("/api/customers", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const customerData = insertCustomerSchema.parse({ ...req.body, userId });
      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      console.error("Error creating customer:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create customer" });
      }
    }
  });

  app.put("/api/customers/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { id } = req.params;
      const customerData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(id, userId, customerData);
      if (!customer) {
        res.status(404).json({ message: "Customer not found" });
        return;
      }
      res.json(customer);
    } catch (error) {
      console.error("Error updating customer:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update customer" });
      }
    }
  });

  app.delete("/api/customers/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { id } = req.params;
      const success = await storage.deleteCustomer(id, userId);
      if (!success) {
        res.status(404).json({ message: "Customer not found" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting customer:", error);
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });

  // Customer Purchase History routes
  app.get("/api/customers/:id/purchase-history", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { id } = req.params;
      const { startDate, endDate } = req.query;

      // Verify customer exists and belongs to user
      const customer = await storage.getCustomer(id, userId);
      if (!customer) {
        res.status(404).json({ message: "Customer not found" });
        return;
      }

      let start: Date | undefined;
      let end: Date | undefined;

      if (startDate) {
        start = new Date(startDate as string);
        if (isNaN(start.getTime())) {
          res.status(400).json({ message: "Invalid start date format" });
          return;
        }
      }

      if (endDate) {
        end = new Date(endDate as string);
        if (isNaN(end.getTime())) {
          res.status(400).json({ message: "Invalid end date format" });
          return;
        }
      }

      const purchaseHistory = await storage.getCustomerPurchaseHistory(id, userId, start, end);
      res.json(purchaseHistory);
    } catch (error) {
      console.error("Error fetching customer purchase history:", error);
      res.status(500).json({ message: "Failed to fetch customer purchase history" });
    }
  });

  app.post("/api/customers/:id/bills", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { id } = req.params;
      
      // Create a schema specifically for customer bills
      // customerId comes from URL param (:id), userId comes from session  
      // We need to omit userId and customerId from validation since they come from elsewhere
      const billSchemaForCustomer = insertBillSchema.omit({ 
        customerId: true, 
        userId: true 
      });
      
      const createBillForCustomerSchema = z.object({
        bill: billSchemaForCustomer,
        items: z.array(insertBillItemSchema.omit({ billId: true })),
      });
      
      const { bill: billData, items } = createBillForCustomerSchema.parse(req.body);

      // Add customerId from URL and userId from session to complete the bill data
      const bill: InsertBill = {
        ...billData,
        customerId: id,
        userId: userId,
      };

      const createdBill = await storage.createBillForCustomer(bill, items, id);
      res.status(201).json(createdBill);
    } catch (error) {
      console.error("Error creating bill for customer:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid bill data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create bill" });
      }
    }
  });

  // Date-wise Purchase History routes
  app.get("/api/purchase-history/daily", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { date } = req.query;

      if (!date) {
        res.status(400).json({ message: "Date parameter is required" });
        return;
      }

      const selectedDate = new Date(date as string);
      if (isNaN(selectedDate.getTime())) {
        res.status(400).json({ message: "Invalid date format" });
        return;
      }

      const dailyHistory = await storage.getDailyPurchaseHistory(userId, selectedDate);
      res.json(dailyHistory);
    } catch (error) {
      console.error("Error fetching daily purchase history:", error);
      res.status(500).json({ message: "Failed to fetch daily purchase history" });
    }
  });

  app.get("/api/purchase-history/date-range", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({ message: "Start date and end date parameters are required" });
        return;
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        res.status(400).json({ message: "Invalid date format" });
        return;
      }

      const rangeHistory = await storage.getDateRangePurchaseHistory(userId, start, end);
      res.json(rangeHistory);
    } catch (error) {
      console.error("Error fetching date range purchase history:", error);
      res.status(500).json({ message: "Failed to fetch date range purchase history" });
    }
  });

  // Payment routes
  app.get("/api/bills/:id/payments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { id } = req.params;
      const billPayments = await storage.getBillPayments(id, userId);
      res.json(billPayments);
    } catch (error) {
      console.error("Error fetching bill payments:", error);
      res.status(500).json({ message: "Failed to fetch bill payments" });
    }
  });

  app.post("/api/bills/:id/payments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { id } = req.params;
      // Accept flexible client payload and convert to InsertPayment
      const paymentInput = z.object({
        amount: z.string().or(z.number()).transform((v) => String(v)),
        paymentDate: z.string().optional(),
        paymentMethod: z.string().optional(),
        notes: z.string().optional(),
      }).parse(req.body);

      const payment = await storage.recordPayment({
        billId: id,
        userId,
        amount: paymentInput.amount,
        paymentDate: paymentInput.paymentDate ? new Date(paymentInput.paymentDate) : undefined,
        paymentMethod: paymentInput.paymentMethod,
        notes: paymentInput.notes,
      } as any);
      
      // Invalidate related queries
      res.status(201).json(payment);
    } catch (error) {
      console.error("Error recording payment:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid payment data", errors: error.errors });
      } else if (error instanceof Error && error.message === "Bill not found") {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to record payment" });
      }
    }
  });

  // Bill routes
  app.get("/api/bills", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const bills = await storage.getBills(userId);
      res.json(bills);
    } catch (error) {
      console.error("Error fetching bills:", error);
      res.status(500).json({ message: "Failed to fetch bills" });
    }
  });

  app.get("/api/bills/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { id } = req.params;
      const bill = await storage.getBill(id, userId);
      if (!bill) {
        res.status(404).json({ message: "Bill not found" });
        return;
      }
      res.json(bill);
    } catch (error) {
      console.error("Error fetching bill:", error);
      res.status(500).json({ message: "Failed to fetch bill" });
    }
  });

  const createBillSchema = z.object({
    bill: insertBillSchema,
    items: z.array(insertBillItemSchema.omit({ billId: true })),
  });

  app.post("/api/bills", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { bill: billData, items } = createBillSchema.parse(req.body);
      const bill = await storage.createBill({ ...billData, userId }, items);
      res.status(201).json(bill);
    } catch (error) {
      console.error("Error creating bill:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid bill data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create bill" });
      }
    }
  });

  app.put("/api/bills/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status || !['pending', 'paid', 'cancelled'].includes(status)) {
        res.status(400).json({ message: "Invalid status" });
        return;
      }

      const bill = await storage.updateBillStatus(id, userId, status);
      if (!bill) {
        res.status(404).json({ message: "Bill not found" });
        return;
      }
      res.json(bill);
    } catch (error) {
      console.error("Error updating bill status:", error);
      res.status(500).json({ message: "Failed to update bill status" });
    }
  });

  app.delete("/api/bills/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { id } = req.params;
      const success = await storage.deleteBill(id, userId);
      if (!success) {
        res.status(404).json({ message: "Bill not found" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting bill:", error);
      res.status(500).json({ message: "Failed to delete bill" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
