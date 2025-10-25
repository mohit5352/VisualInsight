# VisualInsight API Testing Plan

## 🎯 Testing Strategy Overview

This document outlines a systematic approach to test all CRUD operations and important features of the VisualInsight API. Since authentication and inventory APIs have been tested, we'll focus on the remaining features.

## 📋 Testing Checklist Status

### ✅ Already Tested
- [x] Authentication APIs (login, register, logout)
- [x] Inventory APIs (add inventory, load inventory table)

### 🧪 To Test - CRUD Operations

#### 1. Categories Management
- [ ] **GET** `/api/categories` - List all categories
- [ ] **POST** `/api/categories` - Create new category
- [ ] **PUT** `/api/categories/:id` - Update category
- [ ] **DELETE** `/api/categories/:id` - Delete category

#### 2. Suppliers Management
- [ ] **GET** `/api/suppliers` - List all suppliers
- [ ] **POST** `/api/suppliers` - Create new supplier
- [ ] **PUT** `/api/suppliers/:id` - Update supplier
- [ ] **DELETE** `/api/suppliers/:id` - Delete supplier

#### 3. Customers Management
- [ ] **GET** `/api/customers` - List all customers
- [ ] **GET** `/api/customers?withStats=true` - List customers with statistics
- [ ] **GET** `/api/customers/:id` - Get specific customer
- [ ] **POST** `/api/customers` - Create new customer
- [ ] **PUT** `/api/customers/:id` - Update customer
- [ ] **DELETE** `/api/customers/:id` - Delete customer

#### 4. Bills Management
- [ ] **GET** `/api/bills` - List all bills
- [ ] **GET** `/api/bills/:id` - Get specific bill
- [ ] **POST** `/api/bills` - Create new bill
- [ ] **PUT** `/api/bills/:id/status` - Update bill status
- [ ] **DELETE** `/api/bills/:id` - Delete bill

### 🔍 Additional Important Features to Test

#### 5. Dashboard APIs
- [ ] **GET** `/api/dashboard/stats` - Dashboard statistics
- [ ] **GET** `/api/dashboard/recent-transactions` - Recent transactions
- [ ] **GET** `/api/dashboard/low-stock` - Low stock alerts

#### 6. User Management
- [ ] **GET** `/api/auth/user` - Get current user info

#### 7. Inventory Special Operations
- [ ] **PUT** `/api/inventory/:id/quantity` - Update inventory quantity
- [ ] **GET** `/api/inventory/:id` - Get specific inventory item

## 🧪 Detailed Testing Plan

### Phase 1: Categories CRUD Testing

#### Test Data for Categories
```json
{
  "name": "Building Materials",
  "description": "Construction materials and supplies"
}
```

#### Test Cases
1. **Create Category**
   - Test with valid data
   - Test with missing required fields
   - Test with invalid data types
   - Test duplicate category names

2. **Read Categories**
   - Test listing all categories
   - Test empty categories list
   - Test category with relations

3. **Update Category**
   - Test updating name
   - Test updating description
   - Test updating non-existent category
   - Test partial updates

4. **Delete Category**
   - Test deleting existing category
   - Test deleting non-existent category
   - Test deleting category with inventory items

### Phase 2: Suppliers CRUD Testing

#### Test Data for Suppliers
```json
{
  "name": "ABC Construction Supply",
  "email": "contact@abc.com",
  "phone": "+1-555-0123",
  "address": "123 Supply Street, City, State"
}
```

#### Test Cases
1. **Create Supplier**
   - Test with complete data
   - Test with minimal required data
   - Test with invalid email format
   - Test duplicate supplier names

2. **Read Suppliers**
   - Test listing all suppliers
   - Test empty suppliers list
   - Test supplier with inventory relations

3. **Update Supplier**
   - Test updating contact information
   - Test updating address
   - Test updating non-existent supplier
   - Test partial updates

4. **Delete Supplier**
   - Test deleting existing supplier
   - Test deleting non-existent supplier
   - Test deleting supplier with inventory items

### Phase 3: Customers CRUD Testing

#### Test Data for Customers
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

#### Test Cases
1. **Create Customer**
   - Test with complete customer data
   - Test with minimal required data
   - Test with invalid email format
   - Test with invalid phone format
   - Test duplicate customer emails

2. **Read Customers**
   - Test listing all customers
   - Test listing customers with stats
   - Test getting specific customer
   - Test non-existent customer

3. **Update Customer**
   - Test updating contact information
   - Test updating address details
   - Test updating non-existent customer
   - Test partial updates

4. **Delete Customer**
   - Test deleting existing customer
   - Test deleting non-existent customer
   - Test deleting customer with bills

### Phase 4: Bills CRUD Testing

#### Test Data for Bills
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

#### Test Cases
1. **Create Bill**
   - Test with valid bill and items
   - Test with invalid customer ID
   - Test with invalid inventory item ID
   - Test with zero quantity
   - Test with negative quantities
   - Test calculation accuracy

2. **Read Bills**
   - Test listing all bills
   - Test getting specific bill
   - Test bill with customer and item relations
   - Test non-existent bill

3. **Update Bill Status**
   - Test updating to "paid"
   - Test updating to "cancelled"
   - Test updating to "pending"
   - Test invalid status values
   - Test non-existent bill

4. **Delete Bill**
   - Test deleting existing bill
   - Test deleting non-existent bill
   - Test inventory quantity restoration

### Phase 5: Dashboard APIs Testing

#### Test Cases
1. **Dashboard Stats**
   - Test with empty data
   - Test with populated data
   - Test calculation accuracy
   - Test monthly revenue calculation

2. **Recent Transactions**
   - Test with no transactions
   - Test with multiple transactions
   - Test limit parameter
   - Test ordering by date

3. **Low Stock Alerts**
   - Test with no low stock items
   - Test with low stock items
   - Test threshold calculations

### Phase 6: Special Operations Testing

#### Inventory Quantity Updates
- Test updating quantity to positive number
- Test updating quantity to zero
- Test updating quantity to negative (should fail)
- Test updating non-existent item

#### User Information
- Test getting current user data
- Test user data without password hash
- Test unauthenticated access

## 🛠️ Testing Tools & Methods

### Recommended Testing Tools

#### 1. Postman Collection
Create a Postman collection with all API endpoints:
- Environment variables for base URL and auth tokens
- Pre-request scripts for authentication
- Test scripts for response validation
- Collection runner for automated testing

#### 2. API Testing Scripts
Create Node.js scripts using libraries like:
- `axios` for HTTP requests
- `jest` for test assertions
- `supertest` for Express app testing

#### 3. Database Verification
- Check database state after each operation
- Verify foreign key constraints
- Test data isolation between users

### Testing Environment Setup

#### Prerequisites
1. **Database**: Clean PostgreSQL database
2. **Server**: Running VisualInsight server
3. **Authentication**: Valid user session
4. **Test Data**: Predefined test data sets

#### Environment Variables
```env
API_BASE_URL=http://localhost:5000/api
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=testpassword123
```

## 📊 Test Data Management

### Test Data Sets

#### Categories Test Data
```json
[
  {
    "name": "Building Materials",
    "description": "Construction materials and supplies"
  },
  {
    "name": "Tools & Equipment",
    "description": "Construction tools and equipment"
  },
  {
    "name": "Safety Equipment",
    "description": "Safety gear and protective equipment"
  }
]
```

#### Suppliers Test Data
```json
[
  {
    "name": "ABC Construction Supply",
    "email": "contact@abc.com",
    "phone": "+1-555-0123",
    "address": "123 Supply Street, City, State"
  },
  {
    "name": "XYZ Building Materials",
    "email": "sales@xyz.com",
    "phone": "+1-555-0456",
    "address": "456 Material Ave, City, State"
  }
]
```

#### Customers Test Data
```json
[
  {
    "name": "John Smith Construction",
    "email": "john@smithconstruction.com",
    "phone": "+1-555-0456",
    "address": "456 Builder Ave",
    "city": "Construction City",
    "state": "CA",
    "zipCode": "90210",
    "taxId": "TAX123456789"
  },
  {
    "name": "Jane Doe Builders",
    "email": "jane@doebuilders.com",
    "phone": "+1-555-0789",
    "address": "789 Builder Blvd",
    "city": "Building City",
    "state": "NY",
    "zipCode": "10001",
    "taxId": "TAX987654321"
  }
]
```

## 🔍 Error Testing Scenarios

### Authentication Errors
- [ ] Test without authentication token
- [ ] Test with invalid authentication token
- [ ] Test with expired session

### Validation Errors
- [ ] Test required field validation
- [ ] Test data type validation
- [ ] Test format validation (email, phone)
- [ ] Test length validation
- [ ] Test range validation

### Business Logic Errors
- [ ] Test foreign key constraints
- [ ] Test unique constraint violations
- [ ] Test cascade delete behavior
- [ ] Test inventory quantity constraints

### Server Errors
- [ ] Test database connection errors
- [ ] Test server timeout scenarios
- [ ] Test memory limit scenarios
- [ ] Test concurrent request handling

## 📈 Performance Testing

### Load Testing Scenarios
- [ ] Test with 100 concurrent users
- [ ] Test with large datasets (1000+ records)
- [ ] Test response times under load
- [ ] Test memory usage patterns

### Stress Testing Scenarios
- [ ] Test maximum concurrent connections
- [ ] Test with maximum data size
- [ ] Test error recovery mechanisms
- [ ] Test graceful degradation

## 🎯 Success Criteria

### Functional Testing
- [ ] All CRUD operations work correctly
- [ ] Data validation is properly enforced
- [ ] Error handling is comprehensive
- [ ] Business logic is correctly implemented

### Performance Testing
- [ ] Response times are acceptable (< 500ms)
- [ ] System handles expected load
- [ ] Memory usage is reasonable
- [ ] Database queries are optimized

### Security Testing
- [ ] Authentication is properly enforced
- [ ] Data isolation between users works
- [ ] Input validation prevents injection attacks
- [ ] Sensitive data is properly protected

## 📝 Testing Documentation

### Test Results Template
For each test case, document:
- Test case ID and description
- Input data used
- Expected result
- Actual result
- Pass/Fail status
- Notes and observations

### Bug Report Template
For any issues found:
- Bug ID and title
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details
- Severity level
- Suggested fix

## 🚀 Next Steps After API Testing

### UI Testing Plan
Once API testing is complete, focus on:
1. **Component Testing**: Test individual UI components
2. **Integration Testing**: Test component interactions
3. **User Flow Testing**: Test complete user workflows
4. **Cross-browser Testing**: Test in different browsers
5. **Mobile Testing**: Test responsive design
6. **Accessibility Testing**: Test WCAG compliance

### End-to-End Testing
1. **User Registration Flow**: Complete signup process
2. **Inventory Management Flow**: Add, edit, delete items
3. **Customer Management Flow**: Manage customer data
4. **Billing Flow**: Create and manage invoices
5. **Dashboard Flow**: View statistics and reports

---

This comprehensive testing plan ensures that all CRUD operations and important features are thoroughly tested before moving to UI testing. The systematic approach helps identify issues early and ensures the application is robust and reliable.
