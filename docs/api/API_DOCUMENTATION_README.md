# VisualInsight API Documentation

## 📚 Documentation Overview

This directory contains comprehensive API documentation for the VisualInsight business management system. The documentation follows industry best practices and provides multiple formats for different use cases.

## 📁 Documentation Files

### 1. **API_SPECIFICATION.md** - Complete API Reference
- **Purpose**: Human-readable API documentation
- **Format**: Markdown
- **Content**: 
  - Complete endpoint documentation
  - Request/response examples
  - Data models and schemas
  - Authentication details
  - Error handling
  - SDK examples in multiple languages (JavaScript, Python, PHP)

### 2. **openapi.yaml** - OpenAPI 3.0 Specification
- **Purpose**: Machine-readable API specification
- **Format**: YAML (OpenAPI 3.0.3)
- **Content**:
  - Complete API schema definition
  - Request/response schemas
  - Authentication schemes
  - Error definitions
  - Data validation rules
- **Usage**: Import into Swagger UI, Postman, or other API tools

### 3. **VisualInsight_API.postman_collection.json** - Postman Collection
- **Purpose**: Ready-to-use API testing collection
- **Format**: JSON (Postman Collection v2.1)
- **Content**:
  - Pre-configured requests for all endpoints
  - Environment variables for easy testing
  - Test scripts for automatic variable extraction
  - Organized folder structure
- **Usage**: Import directly into Postman

### 4. **API_TEST_RESULTS.md** - Test Results Summary
- **Purpose**: Comprehensive test results and validation
- **Content**:
  - Detailed test results for all endpoints
  - Success/failure analysis
  - Performance metrics
  - Business logic validation
  - Error scenario testing

## 🚀 Quick Start Guide

### For Developers
1. **Read the API Specification**: Start with `API_SPECIFICATION.md` for complete understanding
2. **Use Postman Collection**: Import `VisualInsight_API.postman_collection.json` for testing
3. **Reference OpenAPI Spec**: Use `openapi.yaml` for code generation or API tooling

### For API Testing
1. **Import Postman Collection**: Load the collection into Postman
2. **Set Environment Variables**: Configure base URL and credentials
3. **Run Tests**: Execute requests in order (Authentication → Categories → Suppliers → etc.)

### For Integration
1. **Review Data Models**: Understand the schema in `API_SPECIFICATION.md`
2. **Check SDK Examples**: Use provided code examples in your preferred language
3. **Validate Responses**: Use the test results as reference for expected responses

## 🔧 API Tools Integration

### Swagger UI
```bash
# Serve the OpenAPI spec with Swagger UI
npx swagger-ui-serve openapi.yaml
```

### Postman
1. Open Postman
2. Click "Import"
3. Select `VisualInsight_API.postman_collection.json`
4. Set environment variables:
   - `baseUrl`: `http://localhost:5000/api`
   - `userId`: (auto-populated after login)
   - `categoryId`: (auto-populated after creating category)
   - etc.

### Insomnia
1. Open Insomnia
2. Click "Create" → "Import From" → "File"
3. Select `openapi.yaml`

### VS Code REST Client
Create a `.http` file with requests:
```http
### Login
POST http://localhost:5000/api/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}

### Get Categories
GET http://localhost:5000/api/categories
Cookie: connect.sid=...
```

## 📊 API Endpoints Summary

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

## 🔐 Authentication Flow

1. **Register** a new user account
2. **Login** with credentials to receive session cookie
3. **Include session cookie** in all subsequent requests
4. **Logout** to destroy session

```javascript
// Example authentication flow
const api = new VisualInsightAPI();

// 1. Register
await api.register({
  email: 'shop@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe'
});

// 2. Login
await api.login({
  email: 'shop@example.com',
  password: 'password123'
});

// 3. Make authenticated requests
const categories = await api.getCategories();
```

## 📈 Business Logic Features

### Automatic Features
- **Bill Numbering**: Auto-generated invoice numbers (INV-000001, INV-000002, etc.)
- **Inventory Management**: Quantities automatically reduce when bills are created
- **Status Tracking**: Paid dates automatically set when bill status changes to "paid"
- **Data Relationships**: Foreign key relationships maintained across all entities

### Dashboard Analytics
- **Real-time Statistics**: Total inventory, customers, monthly revenue
- **Low Stock Alerts**: Items below minimum stock level
- **Recent Transactions**: Latest bill activity
- **Customer Statistics**: Total bills, amounts, last order dates

## 🛠️ Development Tools

### Code Generation
```bash
# Generate TypeScript client from OpenAPI spec
npx @openapitools/openapi-generator-cli generate \
  -i openapi.yaml \
  -g typescript-fetch \
  -o ./generated-client
```

### API Validation
```bash
# Validate OpenAPI specification
npx swagger-codegen validate -i openapi.yaml
```

### Mock Server
```bash
# Create mock server from OpenAPI spec
npx @stoplight/prism mock openapi.yaml
```

## 📋 Testing Checklist

### ✅ Completed Tests
- [x] Authentication (register, login, logout, user info)
- [x] Categories CRUD (create, read, update, delete)
- [x] Suppliers CRUD (create, read, update, delete)
- [x] Inventory CRUD (create, read, update, delete, quantity update)
- [x] Customers CRUD (create, read, update, delete, with stats)
- [x] Bills CRUD (create, read, update status, delete)
- [x] Dashboard APIs (stats, recent transactions, low stock)
- [x] Error scenarios (404, 401, validation errors)

### 🎯 Test Results
- **Success Rate**: 100% for core functionality
- **Response Times**: All under 500ms
- **Data Integrity**: Perfect foreign key relationships
- **Error Handling**: Proper HTTP status codes and messages

## 🔄 API Versioning

- **Current Version**: 1.0.0
- **Versioning Strategy**: URL path versioning (`/api/v1/`)
- **Backward Compatibility**: Maintained for minor versions
- **Deprecation Policy**: 6-month notice for breaking changes

## 📞 Support & Resources

### Documentation Resources
- **API Specification**: `API_SPECIFICATION.md`
- **Test Results**: `API_TEST_RESULTS.md`
- **OpenAPI Spec**: `openapi.yaml`
- **Postman Collection**: `VisualInsight_API.postman_collection.json`

### Additional Resources
- **Implementation Plan**: `../FEATURES_AND_IMPLEMENTATION_PLAN.md`
- **Manual Testing Guide**: `../MANUAL_TESTING_GUIDE.md`
- **Client Documentation**: `../client/README.md`
- **Server Documentation**: `../server/README.md`

## 🚀 Next Steps

1. **Frontend Integration**: Use the API specification to build the React frontend
2. **Mobile App**: Create mobile app using the same API endpoints
3. **Third-party Integration**: Share API documentation with partners
4. **API Gateway**: Implement rate limiting and monitoring
5. **Documentation Updates**: Keep documentation synchronized with code changes

## 📝 Contributing

When updating the API:
1. Update `openapi.yaml` first
2. Regenerate `API_SPECIFICATION.md` if needed
3. Update Postman collection
4. Run tests and update `API_TEST_RESULTS.md`
5. Update this README

---

**VisualInsight API Documentation v1.0.0** - Complete business management solution for building materials shop owners.
