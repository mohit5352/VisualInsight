# VisualInsight API Documentation

## 🔌 API Overview

This directory contains comprehensive API documentation for the VisualInsight business management system. The API provides complete CRUD operations for inventory management, customer relationships, billing, and business analytics.

## 📁 Files in this Directory

### **API_SPECIFICATION.md**
- **Purpose**: Complete human-readable API reference
- **Content**: All 31 endpoints with examples, data models, and SDKs
- **Usage**: Primary reference for developers integrating with the API

### **openapi.yaml**
- **Purpose**: Machine-readable OpenAPI 3.0 specification
- **Content**: Complete API schema for code generation and tooling
- **Usage**: Import into Swagger UI, Postman, or generate SDKs

### **API_DOCUMENTATION_README.md**
- **Purpose**: Guide for using API documentation
- **Content**: Integration instructions and tool usage
- **Usage**: Quick start guide for API consumers

### **postman/**
- **Purpose**: Ready-to-use API testing collection
- **Content**: Pre-configured requests for all endpoints
- **Usage**: Import into Postman for immediate testing

## 🚀 Quick Start

### **For Developers**
1. **Read**: `API_SPECIFICATION.md` for complete understanding
2. **Test**: Import `postman/VisualInsight_API.postman_collection.json`
3. **Integrate**: Use provided SDK examples

### **For API Tools**
1. **Swagger UI**: Import `openapi.yaml`
2. **Postman**: Import the collection file
3. **Code Generation**: Use `openapi.yaml` with generators

## 📊 API Summary

| Category | Endpoints | Status | Description |
|----------|-----------|--------|-------------|
| **Authentication** | 4 | ✅ Complete | User registration, login, logout, user info |
| **Categories** | 4 | ✅ Complete | CRUD operations for inventory categories |
| **Suppliers** | 4 | ✅ Complete | CRUD operations for suppliers |
| **Inventory** | 6 | ✅ Complete | CRUD operations + quantity management |
| **Customers** | 5 | ✅ Complete | CRUD operations + statistics |
| **Bills** | 5 | ✅ Complete | CRUD operations + status management |
| **Dashboard** | 3 | ✅ Complete | Statistics, transactions, low stock alerts |

**Total**: 31 endpoints across 7 categories

## 🔐 Authentication

The API uses session-based authentication with HTTP-only cookies:

1. **Register** a new user account
2. **Login** with credentials to receive session cookie
3. **Include session cookie** in all subsequent requests
4. **Logout** to destroy session

## 🎯 Key Features

### **Business Logic**
- **Automatic Bill Numbering**: INV-000001, INV-000002, etc.
- **Inventory Management**: Quantities automatically reduce on bill creation
- **Status Tracking**: Paid dates automatically set when bill status changes
- **Data Relationships**: Foreign key relationships maintained

### **Dashboard Analytics**
- **Real-time Statistics**: Total inventory, customers, monthly revenue
- **Low Stock Alerts**: Items below minimum stock level
- **Recent Transactions**: Latest bill activity
- **Customer Statistics**: Total bills, amounts, last order dates

## 🛠️ Development Tools

### **Code Generation**
```bash
# Generate TypeScript client
npx @openapitools/openapi-generator-cli generate \
  -i openapi.yaml \
  -g typescript-fetch \
  -o ./generated-client
```

### **API Validation**
```bash
# Validate OpenAPI specification
npx swagger-codegen validate -i openapi.yaml
```

### **Mock Server**
```bash
# Create mock server
npx @stoplight/prism mock openapi.yaml
```

## 📞 Support

For API questions and support:
- **Test Results**: See `../testing/API_TEST_RESULTS.md`
- **Testing Guide**: See `../testing/MANUAL_TESTING_GUIDE.md`
- **Implementation Plan**: See `../FEATURES_AND_IMPLEMENTATION_PLAN.md`

---

**VisualInsight API Documentation v1.0.0** - Complete business management API.

