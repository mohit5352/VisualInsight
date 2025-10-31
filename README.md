# VisualInsight

## 🏗️ Building Materials Shop Management System

VisualInsight is a comprehensive business management solution designed specifically for building materials shop owners. It provides complete inventory management, customer relationship management, professional billing, and real-time business analytics.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd VisualInsight

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Set up the database
npm run db:push

# Start the development server
npm run dev
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **API Documentation**: See `docs/api/` directory

## 📚 Documentation

### 📁 Complete Documentation Structure
```
docs/
├── README.md                           # Documentation overview
├── FEATURES_AND_IMPLEMENTATION_PLAN.md # Project roadmap
├── client/                             # Frontend documentation
├── server/                             # Backend documentation
├── api/                                # API documentation
└── testing/                            # Testing documentation
```

### 🎯 **Quick Links**
- **[📖 Documentation Overview](docs/README.md)** - Complete documentation guide
- **[🔌 API Reference](docs/api/API_SPECIFICATION.md)** - Complete API documentation
- **[🧪 Test Results](docs/testing/API_TEST_RESULTS.md)** - Comprehensive test results
- **[📋 Project Plan](docs/FEATURES_AND_IMPLEMENTATION_PLAN.md)** - Feature roadmap
- **[🚀 Postman Collection](docs/api/postman/VisualInsight_API.postman_collection.json)** - Ready-to-use API testing

## 🏗️ Architecture

### **Technology Stack**
- **Frontend**: React 18, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Express.js, TypeScript, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with HTTP-only cookies
- **API**: RESTful design with OpenAPI 3.0 specification

### **Project Structure**
```
VisualInsight/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── utils/          # Utility functions
├── server/                 # Express.js backend
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Database operations
│   └── index.ts           # Server entry point
├── docs/                  # Comprehensive documentation
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## ✨ Features

### ✅ **Implemented Features**
- **🔐 Authentication**: User registration, login, session management
- **📦 Inventory Management**: Complete CRUD with categories and suppliers
- **👥 Customer Management**: Full customer profiles with purchase statistics
- **🧾 Professional Billing**: Automated invoice generation with tax calculations
- **📊 Dashboard Analytics**: Real-time business statistics and insights
- **🔔 Low Stock Alerts**: Proactive inventory management
- **📈 Customer Analytics**: Purchase history and customer insights

### 🚧 **In Development**
- **🖥️ Frontend UI**: React components and user interface
- **📱 Mobile App**: React Native implementation
- **📄 Reporting**: Advanced business reports and analytics

### 📋 **Planned Features**
- **📁 File Management**: Document and image uploads
- **📧 Email Integration**: Automated invoice delivery
- **🔄 Inventory Tracking**: Advanced stock movement tracking
- **📊 Advanced Analytics**: Business intelligence and reporting

## 🔌 API Overview

### **31 Endpoints Across 7 Categories**
- **Authentication**: 4 endpoints (register, login, logout, user info)
- **Categories**: 4 endpoints (CRUD operations)
- **Suppliers**: 4 endpoints (CRUD operations)
- **Inventory**: 6 endpoints (CRUD + quantity management)
- **Customers**: 5 endpoints (CRUD + statistics)
- **Bills**: 5 endpoints (CRUD + status management)
- **Dashboard**: 3 endpoints (stats, transactions, low stock)

### **Key API Features**
- **🔢 Automatic Bill Numbering**: INV-000001, INV-000002, etc.
- **📦 Smart Inventory Management**: Quantities automatically adjust
- **💰 Tax Calculations**: Configurable tax rates and calculations
- **📊 Real-time Analytics**: Live business statistics
- **🔒 Secure Authentication**: Session-based security

## 🧪 Testing

### **Test Results**
- **✅ Success Rate**: 100% for core functionality
- **⚡ Performance**: All responses under 500ms
- **🔗 Data Integrity**: Perfect foreign key relationships
- **🛡️ Security**: Proper authentication and authorization

### **Testing Tools**
- **📋 Postman Collection**: Ready-to-use API testing
- **🧪 Manual Testing Guide**: Step-by-step validation
- **📊 Test Results**: Comprehensive validation report

## 🚀 Development

### **Available Scripts**
```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:push      # Push schema changes to database

# Type checking
npm run check        # Run TypeScript compiler
```

### **Environment Variables**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/visualinsight
SESSION_SECRET=your-session-secret
NODE_ENV=development
```

## 📊 Project Status

### **Backend Development**: ✅ Complete
- All 31 API endpoints implemented and tested
- Database schema designed and implemented
- Authentication and security implemented
- Business logic and automation features working

### **Frontend Development**: 🚧 In Progress
- React components being developed
- UI/UX design in progress
- API integration ongoing

### **Testing**: ✅ Complete
- API testing completed with 100% success rate
- Manual testing guides created
- Automated testing collection available

## 🤝 Contributing

### **Development Workflow**
1. **Read Documentation**: Start with `docs/README.md`
2. **Set Up Environment**: Follow installation guide
3. **Review API**: Check `docs/api/API_SPECIFICATION.md`
4. **Run Tests**: Use Postman collection for validation
5. **Develop Features**: Follow project architecture

### **Code Standards**
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Git**: Conventional commit messages

## 📞 Support

### **Documentation**
- **📖 Complete Guide**: `docs/README.md`
- **🔌 API Reference**: `docs/api/API_SPECIFICATION.md`
- **🧪 Testing Guide**: `docs/testing/MANUAL_TESTING_GUIDE.md`
- **📋 Project Plan**: `docs/FEATURES_AND_IMPLEMENTATION_PLAN.md`

### **Quick Help**
- **API Issues**: Check test results in `docs/testing/API_TEST_RESULTS.md`
- **Development**: Review `docs/client/README.md` and `docs/server/README.md`
- **Testing**: Use Postman collection in `docs/api/postman/`

## 📄 License

MIT License - see LICENSE file for details.

## 🎯 Roadmap

### **Phase 1**: Core Backend ✅ Complete
- API development and testing
- Database design and implementation
- Authentication and security

### **Phase 2**: Frontend Development 🚧 Current
- React component development
- UI/UX implementation
- API integration

### **Phase 3**: Advanced Features 📋 Planned
- Mobile app development
- Advanced reporting
- Third-party integrations

---

**VisualInsight v1.0.0** - Complete business management solution for building materials shop owners.

Built with ❤️ using React, Express.js, PostgreSQL, and TypeScript.


