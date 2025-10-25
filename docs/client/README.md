# VisualInsight Client

A modern React-based frontend application for building materials shop management, built with TypeScript, Tailwind CSS, and modern UI components.

## 🏗️ Architecture Overview

The client is built as a Single Page Application (SPA) using React 18 with modern tooling and follows a component-based architecture with clear separation of concerns.

### Technology Stack

- **Framework**: React 18.3.1 with TypeScript
- **Routing**: Wouter (lightweight router)
- **State Management**: TanStack Query (React Query) for server state
- **UI Framework**: Radix UI primitives with custom styling
- **Styling**: Tailwind CSS with custom design system
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Package Manager**: npm

## 📁 Project Structure

```
client/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── auth/            # Authentication components
│   │   ├── billing/        # Billing and invoice components
│   │   ├── customers/      # Customer management components
│   │   ├── dashboard/      # Dashboard widgets
│   │   ├── inventory/      # Inventory management components
│   │   ├── layout/         # Layout components (header, sidebar)
│   │   └── ui/             # Base UI components (shadcn/ui)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries and configurations
│   ├── pages/              # Page components (route handlers)
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── index.html              # HTML template
└── README.md               # This file
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue tones for main actions and branding
- **Accent**: Complementary colors for highlights
- **Destructive**: Red tones for warnings and errors
- **Muted**: Gray tones for secondary content
- **Background**: Light/dark theme support

### Typography
- **Font Family**: System fonts with fallbacks
- **Scale**: Consistent sizing from text-xs to text-6xl
- **Weights**: Regular (400), Medium (500), Semibold (600), Bold (700)

### Components
Built on Radix UI primitives with custom styling:
- **Forms**: Input, Select, Checkbox, Radio, Textarea
- **Layout**: Card, Dialog, Sheet, Tabs, Accordion
- **Navigation**: Button, Dropdown, Navigation Menu
- **Feedback**: Toast, Alert, Progress, Skeleton
- **Data Display**: Table, Badge, Avatar, Tooltip

## 🔧 Key Features

### 1. Authentication System
- **Login/Register Forms**: Secure user authentication
- **Session Management**: Persistent login sessions
- **Protected Routes**: Route-level authentication guards
- **User Profile**: Basic user information display

### 2. Dashboard
- **Statistics Cards**: Key business metrics overview
- **Recent Transactions**: Latest bill/invoice activity
- **Low Stock Alerts**: Inventory management warnings
- **Quick Actions**: Fast access to common tasks

### 3. Inventory Management
- **Item Management**: Add, edit, delete inventory items
- **Category Organization**: Group items by categories
- **Supplier Tracking**: Link items to suppliers
- **Stock Monitoring**: Quantity tracking with low-stock alerts
- **Search & Filter**: Find items quickly
- **SKU Management**: Product identification system

### 4. Customer Management
- **Customer Database**: Store customer information
- **Contact Details**: Email, phone, address management
- **Order History**: Track customer purchase patterns
- **Customer Stats**: Purchase totals and frequency

### 5. Billing System
- **Invoice Generation**: Create professional invoices
- **Item Selection**: Choose from inventory items
- **Tax Calculation**: Automatic tax computation
- **Bill Management**: Track invoice status (pending/paid/cancelled)
- **PDF Export**: Generate printable invoices (planned)

### 6. Reports & Analytics
- **Sales Reports**: Revenue and transaction analysis (planned)
- **Inventory Reports**: Stock movement tracking (planned)
- **Performance Metrics**: Business KPIs (planned)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- Backend server running (see server README)

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Create a `.env` file in the project root:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

3. **Development Server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 🎯 Component Architecture

### Page Components
Each page follows a consistent structure:
- **Layout**: Sidebar + Header + Main content
- **Authentication**: Route protection and loading states
- **Data Fetching**: TanStack Query for server state
- **Error Handling**: Toast notifications and error boundaries

### Custom Hooks

#### `useAuth`
Manages authentication state and user information:
```typescript
const { isAuthenticated, isLoading, user } = useAuth();
```

#### `useToast`
Provides toast notification functionality:
```typescript
const { toast } = useToast();
toast({
  title: "Success",
  description: "Operation completed successfully"
});
```

#### `useTheme`
Handles dark/light theme switching:
```typescript
const { theme, setTheme } = useTheme();
```

### API Integration

The application uses TanStack Query for all API interactions:

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ["/api/inventory"],
  queryFn: () => apiRequest("GET", "/api/inventory")
});
```

## 🎨 UI/UX Features

### Responsive Design
- **Mobile First**: Optimized for mobile devices
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Flexible Layout**: Adapts to different screen sizes

### Accessibility
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: ARIA labels and semantic HTML
- **Color Contrast**: WCAG compliant color combinations
- **Focus Management**: Clear focus indicators

### Animations
- **Smooth Transitions**: Hover effects and state changes
- **Loading States**: Skeleton loaders and spinners
- **Micro-interactions**: Button hover effects and form feedback

## 🔒 Security Features

### Client-Side Security
- **Input Validation**: Zod schema validation
- **XSS Protection**: React's built-in XSS prevention
- **CSRF Protection**: Same-origin policy enforcement
- **Secure Storage**: No sensitive data in localStorage

### Authentication Flow
1. **Login**: Credentials sent to server
2. **Session**: Server sets HTTP-only cookie
3. **Protection**: All API calls include session cookie
4. **Logout**: Session destroyed on server

## 📱 Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## 🧪 Testing

### Test Structure
- **Unit Tests**: Component testing with React Testing Library
- **Integration Tests**: API integration testing
- **E2E Tests**: Full user flow testing (planned)

### Running Tests
```bash
npm run test
```

## 🚀 Performance Optimizations

### Code Splitting
- **Route-based**: Each page loads independently
- **Component-based**: Large components split into chunks
- **Lazy Loading**: Components loaded on demand

### Caching Strategy
- **API Caching**: TanStack Query handles server state caching
- **Static Assets**: Long-term caching for assets
- **Service Worker**: Offline support (planned)

### Bundle Optimization
- **Tree Shaking**: Unused code elimination
- **Minification**: Code and asset compression
- **Gzip**: Server-side compression

## 🔧 Development Guidelines

### Code Style
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Conventional Commits**: Standardized commit messages

### Component Guidelines
1. **Single Responsibility**: Each component has one purpose
2. **Props Interface**: Define clear prop types
3. **Error Boundaries**: Handle component errors gracefully
4. **Accessibility**: Include ARIA attributes where needed

### State Management
- **Server State**: Use TanStack Query
- **Local State**: React useState/useReducer
- **Form State**: React Hook Form
- **Global State**: Context API for theme/auth

## 📦 Dependencies

### Core Dependencies
- `react`: UI framework
- `react-dom`: DOM rendering
- `wouter`: Routing
- `@tanstack/react-query`: Server state management
- `react-hook-form`: Form handling
- `@hookform/resolvers`: Form validation
- `zod`: Schema validation

### UI Dependencies
- `@radix-ui/*`: UI primitives
- `lucide-react`: Icons
- `class-variance-authority`: Component variants
- `clsx`: Conditional classes
- `tailwind-merge`: Tailwind class merging

### Utility Dependencies
- `date-fns`: Date manipulation
- `nanoid`: ID generation
- `next-themes`: Theme management

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**
   - Check TypeScript errors: `npm run check`
   - Verify all imports are correct
   - Ensure environment variables are set

2. **Runtime Errors**
   - Check browser console for errors
   - Verify API endpoints are accessible
   - Check authentication status

3. **Styling Issues**
   - Verify Tailwind classes are correct
   - Check for CSS conflicts
   - Ensure proper component imports

### Debug Mode
Enable debug mode by setting `VITE_DEBUG=true` in your environment.

## 📈 Future Enhancements

### Planned Features
- **Real-time Updates**: WebSocket integration
- **Offline Support**: Service worker implementation
- **Advanced Reporting**: Charts and analytics
- **Multi-language**: Internationalization support
- **PWA**: Progressive Web App features
- **Advanced Search**: Full-text search capabilities

### Performance Improvements
- **Virtual Scrolling**: For large data sets
- **Image Optimization**: WebP format support
- **Bundle Analysis**: Regular bundle size monitoring
- **CDN Integration**: Static asset delivery optimization

## 📞 Support

For technical support or questions:
- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs via GitHub issues
- **Discussions**: Use GitHub discussions for questions

---

Built with ❤️ for building materials shop owners who want to streamline their business operations.
