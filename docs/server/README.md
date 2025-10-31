# VisualInsight Server

A robust Node.js backend API for building materials shop management, built with Express.js, TypeScript, and PostgreSQL. Provides comprehensive business management functionality including inventory tracking, customer management, billing, and analytics.

## 🏗️ Architecture Overview

The server follows a layered architecture pattern with clear separation of concerns, ensuring maintainability, scalability, and security.

### Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js 4.21.2
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with bcrypt password hashing
- **Validation**: Zod schema validation
- **Session Store**: PostgreSQL (production) / Memory (development)
- **Build Tool**: ESBuild for production builds
- **Package Manager**: npm

## 📁 Project Structure

```
server/
├── index.ts              # Main server entry point
├── routes.ts             # API route definitions
├── storage.ts            # Database operations layer
├── localAuth.ts          # Authentication middleware
├── replitAuth.ts         # Replit-specific auth (optional)
├── db.ts                 # Database connection setup
└── vite.ts               # Vite integration for development
```

## 🗄️ Database Schema

### Core Entities

#### Users Table
```sql
users (
  id: varchar (UUID, Primary Key)
  email: varchar (Unique, Not Null)
  password_hash: varchar
  first_name: varchar
  last_name: varchar
  profile_image_url: varchar
  created_at: timestamp
  updated_at: timestamp
)
```

#### Categories Table
```sql
categories (
  id: varchar (UUID, Primary Key)
  name: varchar (Not Null)
  description: text
  user_id: varchar (Foreign Key → users.id)
  created_at: timestamp
)
```

#### Suppliers Table
```sql
suppliers (
  id: varchar (UUID, Primary Key)
  name: varchar (Not Null)
  email: varchar
  phone: varchar
  address: text
  user_id: varchar (Foreign Key → users.id)
  created_at: timestamp
)
```

#### Inventory Items Table
```sql
inventory_items (
  id: varchar (UUID, Primary Key)
  name: varchar (Not Null)
  description: text
  category_id: varchar (Foreign Key → categories.id)
  supplier_id: varchar (Foreign Key → suppliers.id)
  quantity: integer (Not Null, Default: 0)
  min_stock_level: integer (Default: 10)
  unit_price: decimal(10,2) (Not Null)
  sku: varchar
  user_id: varchar (Foreign Key → users.id)
  created_at: timestamp
  updated_at: timestamp
)
```

#### Customers Table
```sql
customers (
  id: varchar (UUID, Primary Key)
  name: varchar (Not Null)
  email: varchar
  phone: varchar
  address: text
  city: varchar
  state: varchar
  zip_code: varchar
  tax_id: varchar
  user_id: varchar (Foreign Key → users.id)
  created_at: timestamp
  updated_at: timestamp
)
```

#### Bills Table
```sql
bills (
  id: varchar (UUID, Primary Key)
  bill_number: varchar (Not Null, Auto-generated)
  customer_id: varchar (Foreign Key → customers.id)
  user_id: varchar (Foreign Key → users.id)
  subtotal: decimal(12,2) (Not Null)
  tax_rate: decimal(5,2) (Default: 0.00)
  tax_amount: decimal(12,2) (Default: 0.00)
  total: decimal(12,2) (Not Null)
  status: varchar (Default: 'pending', Values: 'pending'|'partial'|'paid'|'cancelled')
  notes: text
  due_date: timestamp
  paid_date: timestamp
  created_at: timestamp
  updated_at: timestamp
)
```

#### Bill Items Table
```sql
bill_items (
  id: varchar (UUID, Primary Key)
  bill_id: varchar (Foreign Key → bills.id)
  inventory_item_id: varchar (Foreign Key → inventory_items.id)
  quantity: integer (Not Null)
  unit_price: decimal(10,2) (Not Null)
  total: decimal(12,2) (Not Null)
  created_at: timestamp
)
```

#### Payments Table
```sql
payments (
  id: varchar (UUID, Primary Key)
  bill_id: varchar (Foreign Key → bills.id, Not Null)
  amount: decimal(12,2) (Not Null)
  payment_date: timestamp (Default: now())
  payment_method: varchar(50) (Optional: 'cash'|'card'|'bank_transfer'|'cheque'|'upi'|'other')
  notes: text
  user_id: varchar (Foreign Key → users.id, Not Null)
  created_at: timestamp (Default: now())
)
```

**Business Logic:**
- Supports multiple partial payments per bill
- Automatically calculates paid and outstanding amounts
- Updates bill status based on cumulative payments:
  - If total payments >= bill total → status = 'paid'
  - If partial payments made → status = 'partial'
  - Otherwise → status = 'pending'

#### Sessions Table
```sql
sessions (
  sid: varchar (Primary Key)
  sess: jsonb (Not Null)
  expire: timestamp (Not Null)
)
```

## 🔧 API Endpoints

### Authentication Routes

#### POST `/api/register`
Register a new user account.
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### POST `/api/login`
Authenticate user and create session.
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

#### POST `/api/logout`
Destroy user session and log out.

#### GET `/api/auth/user`
Get current authenticated user information.

### Dashboard Routes

#### GET `/api/dashboard/stats`
Get dashboard statistics:
```json
{
  "totalInventory": 150,
  "lowStockItems": 5,
  "totalCustomers": 45,
  "monthlyRevenue": "12500.00"
}
```

#### GET `/api/dashboard/recent-transactions?limit=10`
Get recent bill transactions.

#### GET `/api/dashboard/low-stock`
Get inventory items with low stock levels.

### Category Management

#### GET `/api/categories`
Get all categories for the authenticated user.

#### POST `/api/categories`
Create a new category:
```json
{
  "name": "Building Materials",
  "description": "Construction materials and supplies"
}
```

#### PUT `/api/categories/:id`
Update an existing category.

#### DELETE `/api/categories/:id`
Delete a category.

### Supplier Management

#### GET `/api/suppliers`
Get all suppliers for the authenticated user.

#### POST `/api/suppliers`
Create a new supplier:
```json
{
  "name": "ABC Construction Supply",
  "email": "contact@abc.com",
  "phone": "+1-555-0123",
  "address": "123 Supply Street, City, State"
}
```

#### PUT `/api/suppliers/:id`
Update an existing supplier.

#### DELETE `/api/suppliers/:id`
Delete a supplier.

### Inventory Management

#### GET `/api/inventory`
Get all inventory items with category and supplier relations.

#### GET `/api/inventory/:id`
Get a specific inventory item.

#### POST `/api/inventory`
Create a new inventory item:
```json
{
  "name": "Concrete Blocks",
  "description": "Standard concrete building blocks",
  "categoryId": "category-uuid",
  "supplierId": "supplier-uuid",
  "quantity": 100,
  "minStockLevel": 20,
  "unitPrice": "2.50",
  "sku": "CB-001"
}
```

#### PUT `/api/inventory/:id`
Update an existing inventory item.

#### PUT `/api/inventory/:id/quantity`
Update inventory quantity:
```json
{
  "quantity": 150
}
```

#### DELETE `/api/inventory/:id`
Delete an inventory item.

### Customer Management

#### GET `/api/customers?withStats=true`
Get customers with optional statistics.

#### GET `/api/customers/:id`
Get a specific customer.

#### POST `/api/customers`
Create a new customer:
```json
{
  "name": "John Smith Construction",
  "email": "john@smithconstruction.com",
  "phone": "+1-555-0456",
  "address": "456 Builder Ave",
  "city": "Construction City",
  "state": "CA",
  "zipCode": "90210",
  "taxId": "TAX123456789"
}
```

#### PUT `/api/customers/:id`
Update an existing customer.

#### DELETE `/api/customers/:id`
Delete a customer.

#### GET `/api/customers/:id/purchase-history?startDate=2024-01-01&endDate=2024-01-31`
Get customer purchase history with optional date filtering. Returns bills with payment details, paid amounts, and outstanding amounts.

#### POST `/api/customers/:id/bills`
Create a new bill for a specific customer:
```json
{
  "bill": {
    "subtotal": "250.00",
    "taxRate": "8.00",
    "taxAmount": "20.00",
    "total": "270.00",
    "notes": "Customer requested delivery",
    "status": "pending"
  },
  "items": [
    {
      "inventoryItemId": "item-uuid",
      "quantity": 10,
      "unitPrice": "25.00",
      "total": "250.00"
    }
  ]
}
```
Note: `customerId` and `userId` are automatically set from URL and session.

### Billing Management

#### GET `/api/bills`
Get all bills with customer and item relations.

#### GET `/api/bills/:id`
Get a specific bill with full details.

#### POST `/api/bills`
Create a new bill:
```json
{
  "bill": {
    "customerId": "customer-uuid",
    "subtotal": "250.00",
    "taxRate": "8.00",
    "taxAmount": "20.00",
    "total": "270.00",
    "notes": "Rush order",
    "status": "pending"
  },
  "items": [
    {
      "inventoryItemId": "item-uuid",
      "quantity": 10,
      "unitPrice": "25.00",
      "total": "250.00"
    }
  ]
}
```

#### PUT `/api/bills/:id/status`
Update bill status:
```json
{
  "status": "paid"
}
```

#### DELETE `/api/bills/:id`
Delete a bill (restores inventory quantities).

### Purchase History & Payments

#### GET `/api/purchase-history/daily?date=2024-01-15`
Get all purchases (bills) for a specific date - like a daily purchase register. Returns bills grouped by customer with payment and outstanding information.

#### GET `/api/purchase-history/date-range?startDate=2024-01-01&endDate=2024-01-31`
Get all purchases within a date range. Useful for monthly/quarterly reports.

#### GET `/api/bills/:id/payments`
Get all payment records for a specific bill. Returns payments in reverse chronological order.

#### POST `/api/bills/:id/payments`
Record a payment (full or partial) for a bill:
```json
{
  "amount": "150.00",
  "paymentDate": "2024-01-15T10:30:00Z",
  "paymentMethod": "cash",
  "notes": "Partial payment received"
}
```
Automatically updates bill status:
- If payment >= bill total → status = 'paid'
- If partial payment → status = 'partial'
- Validates that payment doesn't exceed outstanding amount

## 🔒 Security Features

### Authentication & Authorization
- **Session-based Authentication**: Secure HTTP-only cookies
- **Password Hashing**: bcrypt with 12 salt rounds
- **Route Protection**: Middleware-based authentication guards
- **User Isolation**: All data scoped to authenticated user

### Input Validation
- **Schema Validation**: Zod schemas for all inputs
- **Type Safety**: TypeScript for compile-time safety
- **SQL Injection Prevention**: Parameterized queries via Drizzle ORM
- **XSS Protection**: Input sanitization and output encoding

### Session Management
- **Secure Cookies**: HTTP-only, secure in production
- **Session Expiry**: 7-day TTL with automatic cleanup
- **Store Options**: PostgreSQL for production, memory for development
- **CSRF Protection**: Same-origin policy enforcement

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- npm package manager

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Create a `.env` file in the project root:
   ```env
   # Database
   DATABASE_URL=postgresql://username:password@localhost:5432/visualinsight
   
   # Session
   SESSION_SECRET=your-super-secret-session-key
   
   # Environment
   NODE_ENV=development
   PORT=5000
   ```

3. **Database Setup**
   ```bash
   # Push schema to database
   npm run db:push
   ```

4. **Development Server**
   ```bash
   npm run dev
   ```
   The server will be available at `http://localhost:5000`

### Production Deployment

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Start Production Server**
   ```bash
   npm start
   ```

## 🗄️ Database Operations

### Storage Layer Architecture

The `storage.ts` file implements the `IStorage` interface, providing a clean abstraction over database operations:

```typescript
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  createUserWithPassword(userData: UserData): Promise<User>;
  
  // Category operations
  getCategories(userId: string): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Inventory operations
  getInventoryItems(userId: string): Promise<InventoryItemWithRelations[]>;
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  
  // Customer operations
  getCustomers(userId: string): Promise<Customer[]>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  
  // Bill operations
  getBills(userId: string): Promise<BillWithRelations[]>;
  createBill(bill: InsertBill, items: BillItem[]): Promise<BillWithRelations>;
}
```

### Query Patterns

#### Basic CRUD Operations
```typescript
// Create
const [created] = await db.insert(table).values(data).returning();

// Read
const results = await db.select().from(table).where(condition);

// Update
const [updated] = await db.update(table).set(data).where(condition).returning();

// Delete
const result = await db.delete(table).where(condition);
```

#### Complex Queries with Relations
```typescript
const results = await db
  .select({
    id: inventoryItems.id,
    name: inventoryItems.name,
    category: categories,
    supplier: suppliers,
  })
  .from(inventoryItems)
  .leftJoin(categories, eq(inventoryItems.categoryId, categories.id))
  .leftJoin(suppliers, eq(inventoryItems.supplierId, suppliers.id))
  .where(eq(inventoryItems.userId, userId));
```

## 🔧 Middleware & Utilities

### Authentication Middleware
```typescript
export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};
```

### Error Handling
```typescript
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});
```

### Request Logging
```typescript
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });
  
  next();
});
```

## 📊 Business Logic

### Inventory Management
- **Stock Tracking**: Real-time quantity updates
- **Low Stock Alerts**: Automatic detection based on minimum levels
- **Category Organization**: Hierarchical item classification
- **Supplier Relations**: Track item sources and suppliers

### Billing System
- **Automatic Calculations**: Subtotal, tax, and total computation
- **Inventory Deduction**: Automatic stock reduction on bill creation
- **Status Tracking**: Pending, paid, cancelled states
- **Bill Numbering**: Auto-generated sequential invoice numbers

### Customer Management
- **Contact Information**: Complete customer profiles
- **Purchase History**: Track customer transaction patterns
- **Statistics**: Total purchases and order frequency

### Dashboard Analytics
- **Key Metrics**: Inventory count, low stock items, customer count
- **Revenue Tracking**: Monthly revenue calculations
- **Recent Activity**: Latest transactions and updates

## 🧪 Testing Strategy

### Unit Testing
- **Storage Layer**: Test database operations in isolation
- **Authentication**: Test login/logout flows
- **Validation**: Test input validation schemas

### Integration Testing
- **API Endpoints**: Test complete request/response cycles
- **Database**: Test with real database connections
- **Authentication**: Test protected route access

### Test Structure
```
tests/
├── unit/
│   ├── storage.test.ts
│   ├── auth.test.ts
│   └── validation.test.ts
├── integration/
│   ├── api.test.ts
│   └── auth-flow.test.ts
└── fixtures/
    ├── test-data.sql
    └── mock-users.json
```

## 🚀 Performance Optimizations

### Database Optimizations
- **Indexes**: Strategic indexing on frequently queried columns
- **Query Optimization**: Efficient joins and filtering
- **Connection Pooling**: Managed database connections
- **Prepared Statements**: Parameterized queries for security

### Caching Strategy
- **Session Caching**: In-memory session store for development
- **Query Caching**: Application-level caching for expensive queries
- **Static Assets**: CDN integration for client assets

### Monitoring
- **Request Logging**: Detailed API request/response logging
- **Error Tracking**: Comprehensive error logging and monitoring
- **Performance Metrics**: Response time and throughput monitoring

## 🔧 Configuration

### Environment Variables
```env
# Database Configuration
DATABASE_URL=postgresql://user:pass@host:port/db

# Session Configuration
SESSION_SECRET=your-secret-key-here

# Server Configuration
NODE_ENV=development|production
PORT=5000

# Optional: Replit Integration
REPL_ID=your-replit-id
```

### Database Configuration
```typescript
// drizzle.config.ts
export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
```

## 📦 Dependencies

### Core Dependencies
- `express`: Web framework
- `drizzle-orm`: Type-safe ORM
- `@neondatabase/serverless`: PostgreSQL driver
- `bcrypt`: Password hashing
- `express-session`: Session management
- `zod`: Schema validation

### Development Dependencies
- `@types/express`: TypeScript types
- `@types/bcrypt`: TypeScript types
- `tsx`: TypeScript execution
- `esbuild`: Production bundling
- `drizzle-kit`: Database migrations

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify `DATABASE_URL` is correct
   - Check PostgreSQL server is running
   - Ensure database exists and is accessible

2. **Session Issues**
   - Verify `SESSION_SECRET` is set
   - Check cookie settings for domain/path
   - Ensure session store is properly configured

3. **Authentication Problems**
   - Check password hashing is working
   - Verify session creation and destruction
   - Ensure middleware is properly applied

### Debug Mode
Enable detailed logging by setting `NODE_ENV=development` and check console output for detailed error information.

## 📈 Scalability Considerations

### Horizontal Scaling
- **Stateless Design**: No server-side state dependencies
- **Database Scaling**: Read replicas for query distribution
- **Load Balancing**: Multiple server instances
- **Session Store**: External session storage (Redis)

### Performance Monitoring
- **Response Times**: Track API endpoint performance
- **Database Queries**: Monitor query execution times
- **Memory Usage**: Track server memory consumption
- **Error Rates**: Monitor application error frequency

## 🔮 Future Enhancements

### Planned Features
- **Real-time Updates**: WebSocket integration for live data
- **Advanced Reporting**: Complex analytics and reporting
- **File Uploads**: Document and image management
- **Email Integration**: Automated notifications and invoices
- **Multi-tenancy**: Support for multiple businesses
- **API Rate Limiting**: Prevent abuse and ensure fair usage

### Technical Improvements
- **GraphQL API**: More flexible query interface
- **Microservices**: Split into focused services
- **Event Sourcing**: Audit trail and event replay
- **Caching Layer**: Redis integration for performance
- **Message Queue**: Background job processing

## 📞 Support

For technical support or questions:
- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs via GitHub issues
- **Discussions**: Use GitHub discussions for questions

---

Built with ❤️ for building materials shop owners who want to streamline their business operations.
