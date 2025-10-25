# VisualInsight API Specification

## Overview

The VisualInsight API provides comprehensive business management functionality for building materials shop owners. This RESTful API enables inventory management, customer relationship management, billing, and business analytics.

**Base URL**: `http://localhost:5000/api`  
**Version**: 1.0.0  
**Authentication**: Session-based with HTTP-only cookies  
**Content Type**: `application/json`

## Table of Contents

- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Data Models](#data-models)
- [Endpoints](#endpoints)
  - [Authentication Endpoints](#authentication-endpoints)
  - [Categories Endpoints](#categories-endpoints)
  - [Suppliers Endpoints](#suppliers-endpoints)
  - [Inventory Endpoints](#inventory-endpoints)
  - [Customers Endpoints](#customers-endpoints)
  - [Bills Endpoints](#bills-endpoints)
  - [Dashboard Endpoints](#dashboard-endpoints)
- [Examples](#examples)
- [SDK Examples](#sdk-examples)

## Authentication

The API uses session-based authentication with HTTP-only cookies.

### Authentication Flow

1. **Register** a new user account
2. **Login** with credentials to receive session cookie
3. **Include session cookie** in all subsequent requests
4. **Logout** to destroy session

### Session Management

- Sessions expire after 7 days
- Cookies are HTTP-only and secure in production
- All protected endpoints require valid session

## Error Handling

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (successful deletion) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (authentication required) |
| 404 | Not Found |
| 500 | Internal Server Error |

### Error Response Format

```json
{
  "message": "Error description",
  "errors": [
    {
      "code": "validation_error",
      "path": ["fieldName"],
      "message": "Detailed error message"
    }
  ]
}
```

## Data Models

### User
```json
{
  "id": "string (UUID)",
  "email": "string (email)",
  "firstName": "string (optional)",
  "lastName": "string (optional)",
  "profileImageUrl": "string (optional)",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

### Category
```json
{
  "id": "string (UUID)",
  "name": "string (required)",
  "description": "string (optional)",
  "userId": "string (UUID)",
  "createdAt": "string (ISO 8601)"
}
```

### Supplier
```json
{
  "id": "string (UUID)",
  "name": "string (required)",
  "email": "string (optional, email format)",
  "phone": "string (optional)",
  "address": "string (optional)",
  "userId": "string (UUID)",
  "createdAt": "string (ISO 8601)"
}
```

### Inventory Item
```json
{
  "id": "string (UUID)",
  "name": "string (required)",
  "description": "string (optional)",
  "categoryId": "string (UUID, optional)",
  "supplierId": "string (UUID, optional)",
  "quantity": "number (required, default: 0)",
  "minStockLevel": "number (optional, default: 10)",
  "unitPrice": "string (required, decimal)",
  "sku": "string (optional)",
  "userId": "string (UUID)",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)",
  "category": "Category (optional, populated in responses)",
  "supplier": "Supplier (optional, populated in responses)"
}
```

### Customer
```json
{
  "id": "string (UUID)",
  "name": "string (required)",
  "email": "string (optional, email format)",
  "phone": "string (optional)",
  "address": "string (optional)",
  "city": "string (optional)",
  "state": "string (optional)", v
  "zipCode": "string (optional)",
  "taxId": "string (optional)",
  "userId": "string (UUID)",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

### Customer with Stats
```json
{
  "id": "string (UUID)",
  "name": "string (required)",
  "email": "string (optional)",
  "phone": "string (optional)",
  "address": "string (optional)",
  "city": "string (optional)",
  "state": "string (optional)",
  "zipCode": "string (optional)",
  "taxId": "string (optional)",
  "userId": "string (UUID)",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)",
  "totalBills": "number",
  "totalAmount": "string (decimal)",
  "lastOrderDate": "string (ISO 8601, optional)"
}
```

### Bill
```json
{
  "id": "string (UUID)",
  "billNumber": "string (auto-generated)",
  "customerId": "string (UUID)",
  "userId": "string (UUID)",
  "subtotal": "string (decimal)",
  "taxRate": "string (decimal, default: 0.00)",
  "taxAmount": "string (decimal, default: 0.00)",
  "total": "string (decimal)",
  "status": "string (pending|paid|cancelled, default: pending)",
  "notes": "string (optional)",
  "dueDate": "string (ISO 8601, optional)",
  "paidDate": "string (ISO 8601, optional)",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)",
  "customer": "Customer (populated in responses)",
  "billItems": "BillItem[] (populated in responses)"
}
```

### Bill Item
```json
{
  "id": "string (UUID)",
  "billId": "string (UUID)",
  "inventoryItemId": "string (UUID)",
  "quantity": "number (required)",
  "unitPrice": "string (decimal)",
  "total": "string (decimal)",
  "createdAt": "string (ISO 8601)",
  "inventoryItem": "InventoryItem (populated in responses)"
}
```

### Dashboard Stats
```json
{
  "totalInventory": "number",
  "lowStockItems": "number",
  "totalCustomers": "number",
  "monthlyRevenue": "string (decimal)"
}
```

## Endpoints

### Authentication Endpoints

#### Register User
**POST** `/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "string (required, email format)",
  "password": "string (required, min 8 characters)",
  "firstName": "string (optional)",
  "lastName": "string (optional)"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": "string (UUID)",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "profileImageUrl": "string",
    "createdAt": "string (ISO 8601)",
    "updatedAt": "string (ISO 8601)"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid input data
- `409 Conflict`: Email already exists

---

#### Login User
**POST** `/login`

Authenticate user and create session.

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "string (UUID)",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "profileImageUrl": "string",
    "createdAt": "string (ISO 8601)",
    "updatedAt": "string (ISO 8601)"
  }
}
```

**Headers:** Sets `Set-Cookie` header with session cookie

**Error Responses:**
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Invalid credentials

---

#### Logout User
**POST** `/logout`

Destroy user session and log out.

**Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

---

#### Get Current User
**GET** `/auth/user`

Get current authenticated user information.

**Headers:** Requires session cookie

**Response:** `200 OK`
```json
{
  "id": "string (UUID)",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "profileImageUrl": "string",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

**Error Responses:**
- `401 Unauthorized`: Not authenticated

### Categories Endpoints

#### List Categories
**GET** `/categories`

Get all categories for the authenticated user.

**Headers:** Requires session cookie

**Response:** `200 OK`
```json
[
  {
    "id": "string (UUID)",
    "name": "string",
    "description": "string",
    "userId": "string (UUID)",
    "createdAt": "string (ISO 8601)"
  }
]
```

---

#### Create Category
**POST** `/categories`

Create a new category.

**Headers:** Requires session cookie

**Request Body:**
```json
{
  "name": "string (required)",
  "description": "string (optional)"
}
```

**Response:** `201 Created`
```json
{
  "id": "string (UUID)",
  "name": "string",
  "description": "string",
  "userId": "string (UUID)",
  "createdAt": "string (ISO 8601)"
}
```

---

#### Update Category
**PUT** `/categories/{id}`

Update an existing category.

**Headers:** Requires session cookie

**Path Parameters:**
- `id`: Category UUID

**Request Body:**
```json
{
  "name": "string (optional)",
  "description": "string (optional)"
}
```

**Response:** `200 OK`
```json
{
  "id": "string (UUID)",
  "name": "string",
  "description": "string",
  "userId": "string (UUID)",
  "createdAt": "string (ISO 8601)"
}
```

**Error Responses:**
- `404 Not Found`: Category not found

---

#### Delete Category
**DELETE** `/categories/{id}`

Delete a category.

**Headers:** Requires session cookie

**Path Parameters:**
- `id`: Category UUID

**Response:** `204 No Content`

**Error Responses:**
- `404 Not Found`: Category not found

### Suppliers Endpoints

#### List Suppliers
**GET** `/suppliers`

Get all suppliers for the authenticated user.

**Headers:** Requires session cookie

**Response:** `200 OK`
```json
[
  {
    "id": "string (UUID)",
    "name": "string",
    "email": "string",
    "phone": "string",
    "address": "string",
    "userId": "string (UUID)",
    "createdAt": "string (ISO 8601)"
  }
]
```

---

#### Create Supplier
**POST** `/suppliers`

Create a new supplier.

**Headers:** Requires session cookie

**Request Body:**
```json
{
  "name": "string (required)",
  "email": "string (optional, email format)",
  "phone": "string (optional)",
  "address": "string (optional)"
}
```

**Response:** `201 Created`
```json
{
  "id": "string (UUID)",
  "name": "string",
  "email": "string",
  "phone": "string",
  "address": "string",
  "userId": "string (UUID)",
  "createdAt": "string (ISO 8601)"
}
```

---

#### Update Supplier
**PUT** `/suppliers/{id}`

Update an existing supplier.

**Headers:** Requires session cookie

**Path Parameters:**
- `id`: Supplier UUID

**Request Body:**
```json
{
  "name": "string (optional)",
  "email": "string (optional)",
  "phone": "string (optional)",
  "address": "string (optional)"
}
```

**Response:** `200 OK`
```json
{
  "id": "string (UUID)",
  "name": "string",
  "email": "string",
  "phone": "string",
  "address": "string",
  "userId": "string (UUID)",
  "createdAt": "string (ISO 8601)"
}
```

**Error Responses:**
- `404 Not Found`: Supplier not found

---

#### Delete Supplier
**DELETE** `/suppliers/{id}`

Delete a supplier.

**Headers:** Requires session cookie

**Path Parameters:**
- `id`: Supplier UUID

**Response:** `204 No Content`

**Error Responses:**
- `404 Not Found`: Supplier not found

### Inventory Endpoints

#### List Inventory Items
**GET** `/inventory`

Get all inventory items with category and supplier relations.

**Headers:** Requires session cookie

**Response:** `200 OK`
```json
[
  {
    "id": "string (UUID)",
    "name": "string",
    "description": "string",
    "categoryId": "string (UUID)",
    "supplierId": "string (UUID)",
    "quantity": "number",
    "minStockLevel": "number",
    "unitPrice": "string (decimal)",
    "sku": "string",
    "userId": "string (UUID)",
    "createdAt": "string (ISO 8601)",
    "updatedAt": "string (ISO 8601)",
    "category": {
      "id": "string (UUID)",
      "name": "string",
      "description": "string"
    },
    "supplier": {
      "id": "string (UUID)",
      "name": "string",
      "email": "string",
      "phone": "string"
    }
  }
]
```

---

#### Get Inventory Item
**GET** `/inventory/{id}`

Get a specific inventory item with relations.

**Headers:** Requires session cookie

**Path Parameters:**
- `id`: Inventory item UUID

**Response:** `200 OK`
```json
{
  "id": "string (UUID)",
  "name": "string",
  "description": "string",
  "categoryId": "string (UUID)",
  "supplierId": "string (UUID)",
  "quantity": "number",
  "minStockLevel": "number",
  "unitPrice": "string (decimal)",
  "sku": "string",
  "userId": "string (UUID)",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)",
  "category": {
    "id": "string (UUID)",
    "name": "string",
    "description": "string"
  },
  "supplier": {
    "id": "string (UUID)",
    "name": "string",
    "email": "string",
    "phone": "string"
  }
}
```

**Error Responses:**
- `404 Not Found`: Inventory item not found

---

#### Create Inventory Item
**POST** `/inventory`

Create a new inventory item.

**Headers:** Requires session cookie

**Request Body:**
```json
{
  "name": "string (required)",
  "description": "string (optional)",
  "categoryId": "string (UUID, optional)",
  "supplierId": "string (UUID, optional)",
  "quantity": "number (required, default: 0)",
  "minStockLevel": "number (optional, default: 10)",
  "unitPrice": "string (required, decimal)",
  "sku": "string (optional)"
}
```

**Response:** `201 Created`
```json
{
  "id": "string (UUID)",
  "name": "string",
  "description": "string",
  "categoryId": "string (UUID)",
  "supplierId": "string (UUID)",
  "quantity": "number",
  "minStockLevel": "number",
  "unitPrice": "string (decimal)",
  "sku": "string",
  "userId": "string (UUID)",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

---

#### Update Inventory Item
**PUT** `/inventory/{id}`

Update an existing inventory item.

**Headers:** Requires session cookie

**Path Parameters:**
- `id`: Inventory item UUID

**Request Body:**
```json
{
  "name": "string (optional)",
  "description": "string (optional)",
  "categoryId": "string (UUID, optional)",
  "supplierId": "string (UUID, optional)",
  "quantity": "number (optional)",
  "minStockLevel": "number (optional)",
  "unitPrice": "string (optional, decimal)",
  "sku": "string (optional)"
}
```

**Response:** `200 OK`
```json
{
  "id": "string (UUID)",
  "name": "string",
  "description": "string",
  "categoryId": "string (UUID)",
  "supplierId": "string (UUID)",
  "quantity": "number",
  "minStockLevel": "number",
  "unitPrice": "string (decimal)",
  "sku": "string",
  "userId": "string (UUID)",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

**Error Responses:**
- `404 Not Found`: Inventory item not found

---

#### Update Inventory Quantity
**PUT** `/inventory/{id}/quantity`

Update only the quantity of an inventory item.

**Headers:** Requires session cookie

**Path Parameters:**
- `id`: Inventory item UUID

**Request Body:**
```json
{
  "quantity": "number (required, >= 0)"
}
```

**Response:** `200 OK`
```json
{
  "id": "string (UUID)",
  "name": "string",
  "description": "string",
  "categoryId": "string (UUID)",
  "supplierId": "string (UUID)",
  "quantity": "number",
  "minStockLevel": "number",
  "unitPrice": "string (decimal)",
  "sku": "string",
  "userId": "string (UUID)",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid quantity
- `404 Not Found`: Inventory item not found

---

#### Delete Inventory Item
**DELETE** `/inventory/{id}`

Delete an inventory item.

**Headers:** Requires session cookie

**Path Parameters:**
- `id`: Inventory item UUID

**Response:** `204 No Content`

**Error Responses:**
- `404 Not Found`: Inventory item not found

### Customers Endpoints

#### List Customers
**GET** `/customers`

Get all customers for the authenticated user.

**Headers:** Requires session cookie

**Query Parameters:**
- `withStats` (optional): `true` to include customer statistics

**Response:** `200 OK`
```json
[
  {
    "id": "string (UUID)",
    "name": "string",
    "email": "string",
    "phone": "string",
    "address": "string",
    "city": "string",
    "state": "string",
    "zipCode": "string",
    "taxId": "string",
    "userId": "string (UUID)",
    "createdAt": "string (ISO 8601)",
    "updatedAt": "string (ISO 8601)",
    "totalBills": "number (if withStats=true)",
    "totalAmount": "string (if withStats=true)",
    "lastOrderDate": "string (if withStats=true)"
  }
]
```

---

#### Get Customer
**GET** `/customers/{id}`

Get a specific customer.

**Headers:** Requires session cookie

**Path Parameters:**
- `id`: Customer UUID

**Response:** `200 OK`
```json
{
  "id": "string (UUID)",
  "name": "string",
  "email": "string",
  "phone": "string",
  "address": "string",
  "city": "string",
  "state": "string",
  "zipCode": "string",
  "taxId": "string",
  "userId": "string (UUID)",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

**Error Responses:**
- `404 Not Found`: Customer not found

---

#### Create Customer
**POST** `/customers`

Create a new customer.

**Headers:** Requires session cookie

**Request Body:**
```json
{
  "name": "string (required)",
  "email": "string (optional, email format)",
  "phone": "string (optional)",
  "address": "string (optional)",
  "city": "string (optional)",
  "state": "string (optional)",
  "zipCode": "string (optional)",
  "taxId": "string (optional)"
}
```

**Response:** `201 Created`
```json
{
  "id": "string (UUID)",
  "name": "string",
  "email": "string",
  "phone": "string",
  "address": "string",
  "city": "string",
  "state": "string",
  "zipCode": "string",
  "taxId": "string",
  "userId": "string (UUID)",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

---

#### Update Customer
**PUT** `/customers/{id}`

Update an existing customer.

**Headers:** Requires session cookie

**Path Parameters:**
- `id`: Customer UUID

**Request Body:**
```json
{
  "name": "string (optional)",
  "email": "string (optional)",
  "phone": "string (optional)",
  "address": "string (optional)",
  "city": "string (optional)",
  "state": "string (optional)",
  "zipCode": "string (optional)",
  "taxId": "string (optional)"
}
```

**Response:** `200 OK`
```json
{
  "id": "string (UUID)",
  "name": "string",
  "email": "string",
  "phone": "string",
  "address": "string",
  "city": "string",
  "state": "string",
  "zipCode": "string",
  "taxId": "string",
  "userId": "string (UUID)",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

**Error Responses:**
- `404 Not Found`: Customer not found

---

#### Delete Customer
**DELETE** `/customers/{id}`

Delete a customer.

**Headers:** Requires session cookie

**Path Parameters:**
- `id`: Customer UUID

**Response:** `204 No Content`

**Error Responses:**
- `404 Not Found`: Customer not found

### Bills Endpoints

#### List Bills
**GET** `/bills`

Get all bills with customer and item relations.

**Headers:** Requires session cookie

**Response:** `200 OK`
```json
[
  {
    "id": "string (UUID)",
    "billNumber": "string",
    "customerId": "string (UUID)",
    "userId": "string (UUID)",
    "subtotal": "string (decimal)",
    "taxRate": "string (decimal)",
    "taxAmount": "string (decimal)",
    "total": "string (decimal)",
    "status": "string",
    "notes": "string",
    "dueDate": "string (ISO 8601)",
    "paidDate": "string (ISO 8601)",
    "createdAt": "string (ISO 8601)",
    "updatedAt": "string (ISO 8601)",
    "customer": {
      "id": "string (UUID)",
      "name": "string",
      "email": "string",
      "phone": "string"
    },
    "billItems": [
      {
        "id": "string (UUID)",
        "billId": "string (UUID)",
        "inventoryItemId": "string (UUID)",
        "quantity": "number",
        "unitPrice": "string (decimal)",
        "total": "string (decimal)",
        "createdAt": "string (ISO 8601)",
        "inventoryItem": {
          "id": "string (UUID)",
          "name": "string",
          "description": "string",
          "unitPrice": "string (decimal)"
        }
      }
    ]
  }
]
```

---

#### Get Bill
**GET** `/bills/{id}`

Get a specific bill with full details.

**Headers:** Requires session cookie

**Path Parameters:**
- `id`: Bill UUID

**Response:** `200 OK`
```json
{
  "id": "string (UUID)",
  "billNumber": "string",
  "customerId": "string (UUID)",
  "userId": "string (UUID)",
  "subtotal": "string (decimal)",
  "taxRate": "string (decimal)",
  "taxAmount": "string (decimal)",
  "total": "string (decimal)",
  "status": "string",
  "notes": "string",
  "dueDate": "string (ISO 8601)",
  "paidDate": "string (ISO 8601)",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)",
  "customer": {
    "id": "string (UUID)",
    "name": "string",
    "email": "string",
    "phone": "string",
    "address": "string",
    "city": "string",
    "state": "string",
    "zipCode": "string",
    "taxId": "string"
  },
  "billItems": [
    {
      "id": "string (UUID)",
      "billId": "string (UUID)",
      "inventoryItemId": "string (UUID)",
      "quantity": "number",
      "unitPrice": "string (decimal)",
      "total": "string (decimal)",
      "createdAt": "string (ISO 8601)",
      "inventoryItem": {
        "id": "string (UUID)",
        "name": "string",
        "description": "string",
        "unitPrice": "string (decimal)",
        "sku": "string"
      }
    }
  ]
}
```

**Error Responses:**
- `404 Not Found`: Bill not found

---

#### Create Bill
**POST** `/bills`

Create a new bill with items.

**Headers:** Requires session cookie

**Request Body:**
```json
{
  "bill": {
    "customerId": "string (UUID, required)",
    "subtotal": "string (decimal, required)",
    "taxRate": "string (decimal, optional, default: 0.00)",
    "taxAmount": "string (decimal, optional, default: 0.00)",
    "total": "string (decimal, required)",
    "notes": "string (optional)",
    "status": "string (optional, default: pending)",
    "userId": "string (UUID, required)"
  },
  "items": [
    {
      "inventoryItemId": "string (UUID, required)",
      "quantity": "number (required, > 0)",
      "unitPrice": "string (decimal, required)",
      "total": "string (decimal, required)"
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "id": "string (UUID)",
  "billNumber": "string (auto-generated)",
  "customerId": "string (UUID)",
  "userId": "string (UUID)",
  "subtotal": "string (decimal)",
  "taxRate": "string (decimal)",
  "taxAmount": "string (decimal)",
  "total": "string (decimal)",
  "status": "string",
  "notes": "string",
  "dueDate": "string (ISO 8601)",
  "paidDate": "string (ISO 8601)",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)",
  "customer": {
    "id": "string (UUID)",
    "name": "string",
    "email": "string",
    "phone": "string"
  },
  "billItems": [
    {
      "id": "string (UUID)",
      "billId": "string (UUID)",
      "inventoryItemId": "string (UUID)",
      "quantity": "number",
      "unitPrice": "string (decimal)",
      "total": "string (decimal)",
      "createdAt": "string (ISO 8601)",
      "inventoryItem": {
        "id": "string (UUID)",
        "name": "string",
        "description": "string",
        "unitPrice": "string (decimal)"
      }
    }
  ]
}
```

**Business Logic:**
- Automatically generates bill number (INV-000001, INV-000002, etc.)
- Reduces inventory quantities for each item
- Updates inventory `updatedAt` timestamp

**Error Responses:**
- `400 Bad Request`: Invalid bill data or validation errors
- `404 Not Found`: Customer or inventory item not found

---

#### Update Bill Status
**PUT** `/bills/{id}/status`

Update the status of a bill.

**Headers:** Requires session cookie

**Path Parameters:**
- `id`: Bill UUID

**Request Body:**
```json
{
  "status": "string (required, one of: pending, paid, cancelled)"
}
```

**Response:** `200 OK`
```json
{
  "id": "string (UUID)",
  "billNumber": "string",
  "customerId": "string (UUID)",
  "userId": "string (UUID)",
  "subtotal": "string (decimal)",
  "taxRate": "string (decimal)",
  "taxAmount": "string (decimal)",
  "total": "string (decimal)",
  "status": "string",
  "notes": "string",
  "dueDate": "string (ISO 8601)",
  "paidDate": "string (ISO 8601, auto-set when status=paid)",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

**Business Logic:**
- Automatically sets `paidDate` when status changes to "paid"
- Updates `updatedAt` timestamp

**Error Responses:**
- `400 Bad Request`: Invalid status value
- `404 Not Found`: Bill not found

---

#### Delete Bill
**DELETE** `/bills/{id}`

Delete a bill and restore inventory quantities.

**Headers:** Requires session cookie

**Path Parameters:**
- `id`: Bill UUID

**Response:** `204 No Content`

**Business Logic:**
- Restores inventory quantities for all bill items
- Updates inventory `updatedAt` timestamps
- Deletes bill items and bill records

**Error Responses:**
- `404 Not Found`: Bill not found

### Dashboard Endpoints

#### Get Dashboard Statistics
**GET** `/dashboard/stats`

Get business statistics for the dashboard.

**Headers:** Requires session cookie

**Response:** `200 OK`
```json
{
  "totalInventory": "number",
  "lowStockItems": "number",
  "totalCustomers": "number",
  "monthlyRevenue": "string (decimal)"
}
```

**Business Logic:**
- `totalInventory`: Count of all inventory items
- `lowStockItems`: Count of items where quantity <= minStockLevel
- `totalCustomers`: Count of all customers
- `monthlyRevenue`: Sum of all paid bills for current month

---

#### Get Recent Transactions
**GET** `/dashboard/recent-transactions`

Get recent bill transactions.

**Headers:** Requires session cookie

**Query Parameters:**
- `limit` (optional): Number of transactions to return (default: 10)

**Response:** `200 OK`
```json
[
  {
    "id": "string (UUID)",
    "billNumber": "string",
    "customerId": "string (UUID)",
    "userId": "string (UUID)",
    "subtotal": "string (decimal)",
    "taxRate": "string (decimal)",
    "taxAmount": "string (decimal)",
    "total": "string (decimal)",
    "status": "string",
    "notes": "string",
    "dueDate": "string (ISO 8601)",
    "paidDate": "string (ISO 8601)",
    "createdAt": "string (ISO 8601)",
    "updatedAt": "string (ISO 8601)",
    "customer": {
      "id": "string (UUID)",
      "name": "string",
      "email": "string"
    },
    "billItems": [
      {
        "id": "string (UUID)",
        "quantity": "number",
        "total": "string (decimal)",
        "inventoryItem": {
          "id": "string (UUID)",
          "name": "string"
        }
      }
    ]
  }
]
```

---

#### Get Low Stock Items
**GET** `/dashboard/low-stock`

Get inventory items with low stock levels.

**Headers:** Requires session cookie

**Response:** `200 OK`
```json
[
  {
    "id": "string (UUID)",
    "name": "string",
    "description": "string",
    "categoryId": "string (UUID)",
    "supplierId": "string (UUID)",
    "quantity": "number",
    "minStockLevel": "number",
    "unitPrice": "string (decimal)",
    "sku": "string",
    "userId": "string (UUID)",
    "createdAt": "string (ISO 8601)",
    "updatedAt": "string (ISO 8601)",
    "category": {
      "id": "string (UUID)",
      "name": "string"
    },
    "supplier": {
      "id": "string (UUID)",
      "name": "string",
      "email": "string",
      "phone": "string"
    }
  }
]
```

## Examples

### Complete Workflow Example

#### 1. Register and Login
```bash
# Register
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"shop@example.com","password":"password123","firstName":"John","lastName":"Doe"}'

# Login
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"shop@example.com","password":"password123"}' \
  -c cookies.txt
```

#### 2. Create Category and Supplier
```bash
# Create category
curl -X POST http://localhost:5000/api/categories \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name":"Building Materials","description":"Construction materials"}'

# Create supplier
curl -X POST http://localhost:5000/api/suppliers \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name":"ABC Supply","email":"contact@abc.com","phone":"+1-555-0123"}'
```

#### 3. Create Inventory Item
```bash
curl -X POST http://localhost:5000/api/inventory \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name":"Concrete Blocks",
    "description":"Standard building blocks",
    "categoryId":"CATEGORY_ID",
    "supplierId":"SUPPLIER_ID",
    "quantity":100,
    "minStockLevel":20,
    "unitPrice":"2.50",
    "sku":"CB-001"
  }'
```

#### 4. Create Customer
```bash
curl -X POST http://localhost:5000/api/customers \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name":"John Smith Construction",
    "email":"john@smith.com",
    "phone":"+1-555-0456",
    "address":"123 Builder St",
    "city":"Construction City",
    "state":"CA",
    "zipCode":"90210"
  }'
```

#### 5. Create Bill
```bash
curl -X POST http://localhost:5000/api/bills \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "bill":{
      "customerId":"CUSTOMER_ID",
      "subtotal":"250.00",
      "taxRate":"8.00",
      "taxAmount":"20.00",
      "total":"270.00",
      "notes":"Rush order",
      "userId":"USER_ID"
    },
    "items":[{
      "inventoryItemId":"INVENTORY_ID",
      "quantity":10,
      "unitPrice":"25.00",
      "total":"250.00"
    }]
  }'
```

#### 6. Get Dashboard Stats
```bash
curl -X GET http://localhost:5000/api/dashboard/stats \
  -b cookies.txt
```

## SDK Examples

### JavaScript/Node.js
```javascript
class VisualInsightAPI {
  constructor(baseURL = 'http://localhost:5000/api') {
    this.baseURL = baseURL;
    this.cookies = '';
  }

  async request(method, endpoint, data = null) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': this.cookies
      },
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined
    });

    if (response.headers.get('set-cookie')) {
      this.cookies = response.headers.get('set-cookie');
    }

    return response.json();
  }

  // Authentication
  async register(userData) {
    return this.request('POST', '/register', userData);
  }

  async login(credentials) {
    return this.request('POST', '/login', credentials);
  }

  async logout() {
    return this.request('POST', '/logout');
  }

  // Categories
  async getCategories() {
    return this.request('GET', '/categories');
  }

  async createCategory(categoryData) {
    return this.request('POST', '/categories', categoryData);
  }

  async updateCategory(id, categoryData) {
    return this.request('PUT', `/categories/${id}`, categoryData);
  }

  async deleteCategory(id) {
    return this.request('DELETE', `/categories/${id}`);
  }

  // Suppliers
  async getSuppliers() {
    return this.request('GET', '/suppliers');
  }

  async createSupplier(supplierData) {
    return this.request('POST', '/suppliers', supplierData);
  }

  async updateSupplier(id, supplierData) {
    return this.request('PUT', `/suppliers/${id}`, supplierData);
  }

  async deleteSupplier(id) {
    return this.request('DELETE', `/suppliers/${id}`);
  }

  // Inventory
  async getInventory() {
    return this.request('GET', '/inventory');
  }

  async getInventoryItem(id) {
    return this.request('GET', `/inventory/${id}`);
  }

  async createInventoryItem(itemData) {
    return this.request('POST', '/inventory', itemData);
  }

  async updateInventoryItem(id, itemData) {
    return this.request('PUT', `/inventory/${id}`, itemData);
  }

  async updateInventoryQuantity(id, quantity) {
    return this.request('PUT', `/inventory/${id}/quantity`, { quantity });
  }

  async deleteInventoryItem(id) {
    return this.request('DELETE', `/inventory/${id}`);
  }

  // Customers
  async getCustomers(withStats = false) {
    const endpoint = withStats ? '/customers?withStats=true' : '/customers';
    return this.request('GET', endpoint);
  }

  async getCustomer(id) {
    return this.request('GET', `/customers/${id}`);
  }

  async createCustomer(customerData) {
    return this.request('POST', '/customers', customerData);
  }

  async updateCustomer(id, customerData) {
    return this.request('PUT', `/customers/${id}`, customerData);
  }

  async deleteCustomer(id) {
    return this.request('DELETE', `/customers/${id}`);
  }

  // Bills
  async getBills() {
    return this.request('GET', '/bills');
  }

  async getBill(id) {
    return this.request('GET', `/bills/${id}`);
  }

  async createBill(billData) {
    return this.request('POST', '/bills', billData);
  }

  async updateBillStatus(id, status) {
    return this.request('PUT', `/bills/${id}/status`, { status });
  }

  async deleteBill(id) {
    return this.request('DELETE', `/bills/${id}`);
  }

  // Dashboard
  async getDashboardStats() {
    return this.request('GET', '/dashboard/stats');
  }

  async getRecentTransactions(limit = 10) {
    return this.request('GET', `/dashboard/recent-transactions?limit=${limit}`);
  }

  async getLowStockItems() {
    return this.request('GET', '/dashboard/low-stock');
  }
}

// Usage example
const api = new VisualInsightAPI();

// Login
await api.login({ email: 'test@example.com', password: 'password123' });

// Get dashboard stats
const stats = await api.getDashboardStats();
console.log(stats);

// Create a category
const category = await api.createCategory({
  name: 'Building Materials',
  description: 'Construction materials and supplies'
});

// Create inventory item
const inventoryItem = await api.createInventoryItem({
  name: 'Concrete Blocks',
  description: 'Standard building blocks',
  categoryId: category.id,
  quantity: 100,
  minStockLevel: 20,
  unitPrice: '2.50',
  sku: 'CB-001'
});
```

### Python
```python
import requests
import json

class VisualInsightAPI:
    def __init__(self, base_url='http://localhost:5000/api'):
        self.base_url = base_url
        self.session = requests.Session()
    
    def request(self, method, endpoint, data=None):
        url = f"{self.base_url}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        response = self.session.request(
            method=method,
            url=url,
            headers=headers,
            json=data
        )
        
        return response.json()
    
    # Authentication
    def register(self, user_data):
        return self.request('POST', '/register', user_data)
    
    def login(self, credentials):
        return self.request('POST', '/login', credentials)
    
    def logout(self):
        return self.request('POST', '/logout')
    
    # Categories
    def get_categories(self):
        return self.request('GET', '/categories')
    
    def create_category(self, category_data):
        return self.request('POST', '/categories', category_data)
    
    def update_category(self, category_id, category_data):
        return self.request('PUT', f'/categories/{category_id}', category_data)
    
    def delete_category(self, category_id):
        return self.request('DELETE', f'/categories/{category_id}')
    
    # Dashboard
    def get_dashboard_stats(self):
        return self.request('GET', '/dashboard/stats')

# Usage example
api = VisualInsightAPI()

# Login
api.login({'email': 'test@example.com', 'password': 'password123'})

# Get dashboard stats
stats = api.get_dashboard_stats()
print(stats)
```

### PHP
```php
<?php
class VisualInsightAPI {
    private $baseUrl;
    private $cookies;
    
    public function __construct($baseUrl = 'http://localhost:5000/api') {
        $this->baseUrl = $baseUrl;
        $this->cookies = '';
    }
    
    private function request($method, $endpoint, $data = null) {
        $url = $this->baseUrl . $endpoint;
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        curl_setopt($ch, CURLOPT_COOKIE, $this->cookies);
        
        if ($data) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json'
            ]);
        }
        
        $response = curl_exec($ch);
        curl_close($ch);
        
        return json_decode($response, true);
    }
    
    // Authentication
    public function register($userData) {
        return $this->request('POST', '/register', $userData);
    }
    
    public function login($credentials) {
        return $this->request('POST', '/login', $credentials);
    }
    
    public function logout() {
        return $this->request('POST', '/logout');
    }
    
    // Dashboard
    public function getDashboardStats() {
        return $this->request('GET', '/dashboard/stats');
    }
}

// Usage example
$api = new VisualInsightAPI();

// Login
$api->login(['email' => 'test@example.com', 'password' => 'password123']);

// Get dashboard stats
$stats = $api->getDashboardStats();
print_r($stats);
?>
```

## Rate Limiting

Currently, no rate limiting is implemented. Consider implementing rate limiting for production use.

## Changelog

### Version 1.0.0 (Current)
- Initial API release
- Complete CRUD operations for all entities
- Session-based authentication
- Dashboard analytics
- Business logic automation

## Support

For API support and questions:
- Check the test results in `API_TEST_RESULTS.md`
- Review the implementation plan in `FEATURES_AND_IMPLEMENTATION_PLAN.md`
- Use the manual testing guide in `MANUAL_TESTING_GUIDE.md`

---

**VisualInsight API v1.0.0** - Complete business management solution for building materials shop owners.
