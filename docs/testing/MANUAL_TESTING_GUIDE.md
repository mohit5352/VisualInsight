# Manual API Testing Guide

## 🎯 Quick Start Testing

This guide provides step-by-step instructions for manually testing all CRUD operations using your browser's developer tools or a tool like Postman.

## 🔧 Prerequisites

1. **Server Running**: Make sure VisualInsight server is running on `http://localhost:5000`
2. **Browser**: Chrome/Firefox with developer tools
3. **Postman** (optional): For more advanced testing

## 🔐 Step 1: Authentication Setup

### Register a Test User
```javascript
// Open browser console and run:
fetch('http://localhost:5000/api/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'testpassword123',
    firstName: 'Test',
    lastName: 'User'
  })
})
.then(r => r.json())
.then(console.log);
```

### Login
```javascript
fetch('http://localhost:5000/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'testpassword123'
  })
})
.then(r => r.json())
.then(console.log);
```

## 📁 Step 2: Categories CRUD Testing

### Create Category
```javascript
fetch('http://localhost:5000/api/categories', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    name: 'Building Materials',
    description: 'Construction materials and supplies'
  })
})
.then(r => r.json())
.then(console.log);
```

### Read Categories
```javascript
fetch('http://localhost:5000/api/categories', {
  credentials: 'include'
})
.then(r => r.json())
.then(console.log);
```

### Update Category (replace CATEGORY_ID with actual ID)
```javascript
fetch('http://localhost:5000/api/categories/CATEGORY_ID', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    description: 'Updated description'
  })
})
.then(r => r.json())
.then(console.log);
```

### Delete Category (replace CATEGORY_ID with actual ID)
```javascript
fetch('http://localhost:5000/api/categories/CATEGORY_ID', {
  method: 'DELETE',
  credentials: 'include'
})
.then(r => {
  console.log('Status:', r.status);
  return r.text();
})
.then(console.log);
```

## 🏢 Step 3: Suppliers CRUD Testing

### Create Supplier
```javascript
fetch('http://localhost:5000/api/suppliers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    name: 'ABC Construction Supply',
    email: 'contact@abc.com',
    phone: '+1-555-0123',
    address: '123 Supply Street, City, State'
  })
})
.then(r => r.json())
.then(console.log);
```

### Read Suppliers
```javascript
fetch('http://localhost:5000/api/suppliers', {
  credentials: 'include'
})
.then(r => r.json())
.then(console.log);
```

### Update Supplier (replace SUPPLIER_ID with actual ID)
```javascript
fetch('http://localhost:5000/api/suppliers/SUPPLIER_ID', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    phone: '+1-555-9999'
  })
})
.then(r => r.json())
.then(console.log);
```

### Delete Supplier (replace SUPPLIER_ID with actual ID)
```javascript
fetch('http://localhost:5000/api/suppliers/SUPPLIER_ID', {
  method: 'DELETE',
  credentials: 'include'
})
.then(r => {
  console.log('Status:', r.status);
  return r.text();
})
.then(console.log);
```

## 👥 Step 4: Customers CRUD Testing

### Create Customer
```javascript
fetch('http://localhost:5000/api/customers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    name: 'John Smith Construction',
    email: 'john@smithconstruction.com',
    phone: '+1-555-0456',
    address: '456 Builder Ave',
    city: 'Construction City',
    state: 'CA',
    zipCode: '90210',
    taxId: 'TAX123456789'
  })
})
.then(r => r.json())
.then(console.log);
```

### Read Customers
```javascript
fetch('http://localhost:5000/api/customers', {
  credentials: 'include'
})
.then(r => r.json())
.then(console.log);
```

### Read Customers with Stats
```javascript
fetch('http://localhost:5000/api/customers?withStats=true', {
  credentials: 'include'
})
.then(r => r.json())
.then(console.log);
```

### Read Specific Customer (replace CUSTOMER_ID with actual ID)
```javascript
fetch('http://localhost:5000/api/customers/CUSTOMER_ID', {
  credentials: 'include'
})
.then(r => r.json())
.then(console.log);
```

### Update Customer (replace CUSTOMER_ID with actual ID)
```javascript
fetch('http://localhost:5000/api/customers/CUSTOMER_ID', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    phone: '+1-555-8888'
  })
})
.then(r => r.json())
.then(console.log);
```

### Delete Customer (replace CUSTOMER_ID with actual ID)
```javascript
fetch('http://localhost:5000/api/customers/CUSTOMER_ID', {
  method: 'DELETE',
  credentials: 'include'
})
.then(r => {
  console.log('Status:', r.status);
  return r.text();
})
.then(console.log);
```

## 📦 Step 5: Additional Inventory Testing

### Create Inventory Item (you'll need category and supplier IDs)
```javascript
fetch('http://localhost:5000/api/inventory', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    name: 'Concrete Blocks',
    description: 'Standard concrete building blocks',
    categoryId: 'CATEGORY_ID_HERE',
    supplierId: 'SUPPLIER_ID_HERE',
    quantity: 100,
    minStockLevel: 20,
    unitPrice: '2.50',
    sku: 'CB-001'
  })
})
.then(r => r.json())
.then(console.log);
```

### Read Specific Inventory Item (replace ITEM_ID with actual ID)
```javascript
fetch('http://localhost:5000/api/inventory/ITEM_ID', {
  credentials: 'include'
})
.then(r => r.json())
.then(console.log);
```

### Update Inventory Quantity (replace ITEM_ID with actual ID)
```javascript
fetch('http://localhost:5000/api/inventory/ITEM_ID/quantity', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    quantity: 150
  })
})
.then(r => r.json())
.then(console.log);
```

## 🧾 Step 6: Bills CRUD Testing

### Create Bill (you'll need customer and inventory item IDs)
```javascript
fetch('http://localhost:5000/api/bills', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    bill: {
      customerId: 'CUSTOMER_ID_HERE',
      subtotal: '250.00',
      taxRate: '8.00',
      taxAmount: '20.00',
      total: '270.00',
      notes: 'Rush order',
      status: 'pending'
    },
    items: [
      {
        inventoryItemId: 'ITEM_ID_HERE',
        quantity: 10,
        unitPrice: '25.00',
        total: '250.00'
      }
    ]
  })
})
.then(r => r.json())
.then(console.log);
```

### Read Bills
```javascript
fetch('http://localhost:5000/api/bills', {
  credentials: 'include'
})
.then(r => r.json())
.then(console.log);
```

### Read Specific Bill (replace BILL_ID with actual ID)
```javascript
fetch('http://localhost:5000/api/bills/BILL_ID', {
  credentials: 'include'
})
.then(r => r.json())
.then(console.log);
```

### Update Bill Status (replace BILL_ID with actual ID)
```javascript
fetch('http://localhost:5000/api/bills/BILL_ID/status', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    status: 'paid'
  })
})
.then(r => r.json())
.then(console.log);
```

### Delete Bill (replace BILL_ID with actual ID)
```javascript
fetch('http://localhost:5000/api/bills/BILL_ID', {
  method: 'DELETE',
  credentials: 'include'
})
.then(r => {
  console.log('Status:', r.status);
  return r.text();
})
.then(console.log);
```

## 📊 Step 7: Dashboard APIs Testing

### Dashboard Stats
```javascript
fetch('http://localhost:5000/api/dashboard/stats', {
  credentials: 'include'
})
.then(r => r.json())
.then(console.log);
```

### Recent Transactions
```javascript
fetch('http://localhost:5000/api/dashboard/recent-transactions', {
  credentials: 'include'
})
.then(r => r.json())
.then(console.log);
```

### Low Stock Items
```javascript
fetch('http://localhost:5000/api/dashboard/low-stock', {
  credentials: 'include'
})
.then(r => r.json())
.then(console.log);
```

## 👤 Step 8: User Info Testing

### Get Current User
```javascript
fetch('http://localhost:5000/api/auth/user', {
  credentials: 'include'
})
.then(r => r.json())
.then(console.log);
```

## ❌ Step 9: Error Testing

### Test 404 Error
```javascript
fetch('http://localhost:5000/api/customers/non-existent-id', {
  credentials: 'include'
})
.then(r => {
  console.log('Status:', r.status);
  return r.json();
})
.then(console.log);
```

### Test Validation Error
```javascript
fetch('http://localhost:5000/api/customers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    name: '' // Empty name should fail validation
  })
})
.then(r => {
  console.log('Status:', r.status);
  return r.json();
})
.then(console.log);
```

### Test Unauthorized Access
```javascript
fetch('http://localhost:5000/api/customers', {
  // No credentials: 'include'
})
.then(r => {
  console.log('Status:', r.status);
  return r.json();
})
.then(console.log);
```

## 🎯 Testing Checklist

### Categories
- [ ] Create category with valid data
- [ ] Create category with missing required fields
- [ ] Read all categories
- [ ] Update category
- [ ] Delete category
- [ ] Test non-existent category operations

### Suppliers
- [ ] Create supplier with valid data
- [ ] Create supplier with invalid email
- [ ] Read all suppliers
- [ ] Update supplier
- [ ] Delete supplier
- [ ] Test non-existent supplier operations

### Customers
- [ ] Create customer with complete data
- [ ] Create customer with minimal data
- [ ] Read all customers
- [ ] Read customers with stats
- [ ] Read specific customer
- [ ] Update customer
- [ ] Delete customer
- [ ] Test non-existent customer operations

### Inventory
- [ ] Create inventory item with valid data
- [ ] Create inventory item with invalid references
- [ ] Read specific inventory item
- [ ] Update inventory quantity
- [ ] Update inventory item
- [ ] Delete inventory item
- [ ] Test non-existent item operations

### Bills
- [ ] Create bill with valid data
- [ ] Create bill with invalid customer/item references
- [ ] Read all bills
- [ ] Read specific bill
- [ ] Update bill status
- [ ] Delete bill
- [ ] Test non-existent bill operations

### Dashboard
- [ ] Get dashboard stats
- [ ] Get recent transactions
- [ ] Get low stock items

### User Management
- [ ] Get current user info
- [ ] Test authentication requirements

### Error Handling
- [ ] Test 404 errors
- [ ] Test validation errors
- [ ] Test unauthorized access
- [ ] Test server errors

## 📝 Notes

1. **Replace IDs**: When testing update/delete operations, replace placeholder IDs with actual IDs from create operations
2. **Order Matters**: Some operations depend on others (bills need customers and inventory items)
3. **Clean Up**: Delete test data after testing to keep database clean
4. **Check Responses**: Always check the response status and data structure
5. **Error Cases**: Test both success and error scenarios

## 🚀 Next Steps

After completing API testing:
1. Test UI components individually
2. Test complete user workflows
3. Test cross-browser compatibility
4. Test responsive design
5. Test accessibility features

---

This manual testing approach gives you hands-on experience with each API endpoint and helps you understand the data flow and error handling.
