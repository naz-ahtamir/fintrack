# FinTrack - Personal Finance Management System

A production-ready, full-stack personal finance management application built with NestJS and Next.js. Comprehensive solution for tracking income, expenses, budgets, and financial goals with real-time analytics and modern UI.

## Features

### Core Functionality
- **Authentication & Authorization** - JWT-based authentication with bcrypt password hashing
- **Transaction Management** - Comprehensive tracking of income, expenses, and transfers
- **Financial Dashboard** - Real-time analytics and data visualizations
- **Goal Tracking** - Set and monitor financial savings goals with progress tracking
- **Budget Management** - Category-based budgets with threshold alerts
- **Multi-Account Support** - Manage cash, bank accounts, credit cards, and investment accounts
- **Reports & Analytics** - Monthly financial reports with detailed charts and insights
- **Notification System** - Customizable notification preferences for all activities
- **User Profile Management** - Complete profile and settings management
- **Dark Theme UI** - Professional dark theme with responsive design

### Technical Capabilities
- Production-ready codebase with enterprise-level quality standards
- Enterprise-grade security with rate limiting and password policies
- Performance optimized with efficient database queries and caching
- Fully responsive design for desktop and mobile devices
- Clean, intuitive interface built with Tailwind CSS
- Real-time data updates across all modules
- Complete API documentation with Swagger/OpenAPI
- Full TypeScript type safety throughout the application

## Technology Stack

### Backend Technologies
- **Framework:** NestJS 10.x - Progressive Node.js framework for scalable server-side applications
- **Database:** PostgreSQL 15.x - Advanced open-source relational database
- **ORM:** Prisma 5.x - Next-generation Node.js and TypeScript ORM
- **Authentication:** JWT (jsonwebtoken) with bcrypt for secure password hashing
- **Validation:** class-validator and class-transformer for request validation
- **Security:** Helmet.js for HTTP headers, throttler for rate limiting
- **Documentation:** Swagger/OpenAPI for automated API documentation

### Frontend Technologies
- **Framework:** Next.js 14.x with App Router - React framework for production
- **UI Library:** React 18.x - JavaScript library for building user interfaces
- **Styling:** Tailwind CSS 3.x - Utility-first CSS framework
- **Animations:** Framer Motion - Production-ready motion library for React
- **Data Visualization:** Recharts - Composable charting library built on React components
- **State Management:** Zustand - Small, fast state management solution
- **HTTP Client:** Axios - Promise-based HTTP client
- **Form Handling:** Custom validators with real-time validation

### Development Tools
- **Package Manager:** npm/pnpm for dependency management
- **Database Migrations:** Prisma Migrate for version-controlled schema changes
- **Code Quality:** ESLint for code linting, Prettier for code formatting
- **Version Control:** Git with comprehensive .gitignore configuration
- **Type Safety:** TypeScript for both frontend and backend

## Getting Started

### System Requirements

- Node.js 18.x or higher
- PostgreSQL 15.x or higher
- npm or pnpm package manager
- Git version control system

### Installation Steps

**1. Clone the repository**
```bash
git clone <repository-url>
cd milestone-4-naz-ahtamir
```

**2. Install backend dependencies**
```bash
cd Backend
npm install
```

**3. Install frontend dependencies**
```bash
cd ../Frontend
npm install
```

### Database Configuration

**1. Create PostgreSQL database**
```bash
createdb fintrack
```

**2. Configure environment variables**
```bash
cd Backend
cp .env.example .env
# Edit .env with your database credentials
```

**3. Run database migrations**
```bash
npx prisma migrate deploy
```

**4. Seed database with demo data (optional)**
```bash
npx prisma db seed
```

This creates the following demo accounts:
- Demo User: demo@fintrack.com / demo123
- Admin User: admin@fintrack.com / admin123

### Running the Application

**1. Start backend server (Port 3000)**
```bash
cd Backend
npm run start:dev
```

**2. Start frontend development server (Port 3001)**
```bash
cd Frontend
npm run dev
```

**3. Access the application**
- Frontend Application: http://localhost:3001
- Backend API: http://localhost:3000
- API Documentation: http://localhost:3000/api/docs

## Project Structure

```
milestone-4-naz-ahtamir/
├── Backend/                        # NestJS Backend Application
│   ├── src/
│   │   ├── auth/                   # Authentication module (JWT, guards)
│   │   ├── users/                  # User management module
│   │   ├── transactions/           # Transaction management module
│   │   ├── accounts/               # Financial accounts module
│   │   ├── categories/             # Transaction categories module
│   │   ├── budgets/                # Budget management module
│   │   ├── goals/                  # Financial goals module
│   │   └── prisma/                 # Prisma ORM service
│   ├── prisma/
│   │   ├── schema.prisma           # Database schema definition
│   │   ├── migrations/             # Database migration files
│   │   └── seed.ts                 # Database seed script
│   └── .env                        # Backend environment variables
│
├── Frontend/                       # Next.js Frontend Application
│   ├── app/                        # Next.js App Router pages
│   │   ├── dashboard/              # Dashboard page with analytics
│   │   ├── transactions/           # Transaction management page
│   │   ├── goals/                  # Financial goals page
│   │   ├── budgets/                # Budget management page
│   │   ├── categories/             # Category management page
│   │   ├── profile/                # User profile page
│   │   └── settings/               # Application settings page
│   ├── components/                 # React components
│   │   ├── ui/                     # Reusable UI components
│   │   ├── layout/                 # Layout components (Sidebar, Header)
│   │   └── dashboard/              # Dashboard-specific components
│   ├── lib/                        # Utility functions and helpers
│   │   ├── api-client.ts           # Axios API client with interceptors
│   │   ├── hooks/                  # Custom React hooks
│   │   └── store/                  # Zustand state management stores
│   └── .env.local                  # Frontend environment variables
│
├── database/                       # Database documentation and backups
│   ├── schema.sql                  # PostgreSQL schema DDL
│   ├── ER_DIAGRAM.md               # Entity relationship diagram
│   └── README.md                   # Database documentation
│
├── .gitignore                      # Git ignore configuration
├── README.md                       # Project documentation (this file)
└── DEMO_ACCOUNTS.md                # Demo account credentials
```

## API Documentation

### Authentication Endpoints

```
POST   /api/auth/register              Create new user account
POST   /api/auth/login                 Authenticate user and get JWT token
GET    /api/auth/profile               Get authenticated user profile
```

### User Management Endpoints

```
GET    /api/users/profile              Get current user profile
GET    /api/users/statistics           Get user statistics (transactions, accounts, etc.)
GET    /api/users/settings             Get user settings and preferences
PATCH  /api/users/settings             Update user settings
POST   /api/users/change-password      Change user password
```

### Transaction Endpoints

```
GET    /api/transactions               List all transactions (with pagination and filters)
POST   /api/transactions               Create new transaction
GET    /api/transactions/:id           Get transaction by ID
PATCH  /api/transactions/:id           Update transaction
DELETE /api/transactions/:id           Delete transaction
GET    /api/transactions/stats         Get transaction statistics
```

### Account Management Endpoints

```
GET    /api/accounts                   List all user accounts
POST   /api/accounts                   Create new account
GET    /api/accounts/:id               Get account by ID
PATCH  /api/accounts/:id               Update account
DELETE /api/accounts/:id               Delete account
```

### Category Endpoints

```
GET    /api/categories                 List all categories
POST   /api/categories                 Create new category
PATCH  /api/categories/:id             Update category
DELETE /api/categories/:id             Delete category
```

### Budget Management Endpoints

```
GET    /api/budgets                    List all budgets
POST   /api/budgets                    Create new budget
GET    /api/budgets/:id                Get budget by ID
PATCH  /api/budgets/:id                Update budget
DELETE /api/budgets/:id                Delete budget
```

### Financial Goals Endpoints

```
GET    /api/goals                      List all financial goals
POST   /api/goals                      Create new goal
GET    /api/goals/:id                  Get goal by ID
PATCH  /api/goals/:id                  Update goal
DELETE /api/goals/:id                  Delete goal
POST   /api/goals/:id/contributions    Add contribution to goal
```

**Complete API Documentation:** http://localhost:3000/api/docs (Swagger UI)

## Environment Configuration

### Backend Environment Variables (.env)

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/fintrack"

# JWT Configuration
JWT_SECRET="your-strong-256-bit-secret-key-here"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=3000
NODE_ENV="development"

# CORS Configuration (production)
CORS_ORIGIN="http://localhost:3001"
```

### Frontend Environment Variables (.env.local)

```env
# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:3000"

# Environment
NODE_ENV="development"
```

**Security Warning:** Never commit .env files to version control. All sensitive credentials should be stored securely.

## Database Schema

### Core Tables

**Users**
- User authentication and profile information
- Fields: id, email, password (hashed), name, role, emailVerified, timestamps

**Accounts**
- Financial accounts (bank, cash, credit card, investment)
- Fields: id, userId, name, type, balance, currency, isActive, timestamps

**Categories**
- Transaction categories for organization
- Fields: id, userId, name, type, color, icon, timestamps

**Transactions**
- All financial transactions (income, expense, transfer)
- Fields: id, userId, accountId, categoryId, type, amount, description, date, timestamps

**Budgets**
- Monthly budgets by category
- Fields: id, userId, categoryId, amount, period, startDate, endDate, timestamps

**Goals**
- Financial savings goals
- Fields: id, userId, name, targetAmount, currentAmount, targetDate, status, timestamps

**UserSettings**
- User preferences and notification settings
- Fields: id, userId, currency, language, timeZone, theme, notifications, timestamps

**Complete Schema:** See `Backend/prisma/schema.prisma`

**Visual Diagram:** See `database/ER_DIAGRAM.md`

## Security Implementation

### Authentication & Authorization
- JWT token-based authentication with 7-day expiration
- Bcrypt password hashing with 10 salt rounds
- Protected routes using NestJS guards
- Automatic token refresh handling

### Rate Limiting
- Login endpoint: 5 attempts per minute per IP
- Registration endpoint: 3 attempts per minute per IP
- Global rate limit: 100 requests per minute per IP

### Password Policy
- Minimum length: 8 characters
- Required complexity: uppercase, lowercase, number, special character
- Validation regex: `^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])`
- Enforced on registration and password change

### HTTP Security
- Helmet.js middleware for security headers
- CORS configuration with origin whitelist
- Input validation using class-validator
- SQL injection prevention through Prisma parameterized queries
- XSS protection through React's built-in escaping

### Production Security
- Environment-based configuration
- No debug information in production
- Comprehensive error handling
- Secure session management
- Zero information disclosure on errors

## Performance Metrics

- Average API response time: <500ms
- Page load time: <2 seconds
- Database query optimization with indexes
- Efficient bundle size through code splitting
- Optimized asset delivery
- Lazy loading for components

## Testing

### Backend Tests
```bash
cd Backend
npm test
```

### Frontend Tests
```bash
cd Frontend
npm test
```

Test coverage includes:
- Unit tests for services and controllers
- Integration tests for API endpoints
- E2E tests for critical user flows

### Development Standards

- Maintain TypeScript type safety throughout
- Follow existing ESLint and Prettier configurations
- Write clear, descriptive commit messages
- Document complex logic with comments
- Update relevant documentation
- Ensure all tests pass before submitting PR

## Acknowledgments

This project utilizes the following open-source technologies:
- NestJS - Progressive Node.js framework
- Next.js - React framework for production
- Prisma - Next-generation ORM
- PostgreSQL - Advanced open-source database
- Tailwind CSS - Utility-first CSS framework
- TypeScript - Typed JavaScript for application-scale development