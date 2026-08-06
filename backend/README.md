# 💰 FinTrack API - Personal Finance Management System

A comprehensive RESTful API for personal finance management built with NestJS, Prisma, and PostgreSQL.

## 📋 Table of Contents
- [Domain Overview](#domain-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [ERD (Entity Relationship Diagram)](#erd-entity-relationship-diagram)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Security Features](#security-features)
- [Database Schema](#database-schema)

---

## 🎯 Domain Overview

**FinTrack** is a personal finance management system that helps users track their financial activities, manage budgets, and achieve financial goals. The system provides:

- **Multi-account Management**: Support for cash, bank accounts, credit cards, and investments
- **Transaction Tracking**: Record income, expenses, and transfers between accounts
- **Budget Management**: Set monthly/yearly budgets with alerts
- **Financial Goals**: Track progress towards savings goals
- **Category System**: Organize transactions with customizable categories
- **Real-time Analytics**: View spending patterns and financial insights

### Key Business Rules:
1. Users can have multiple accounts with different types (cash, bank, credit card, investment)
2. Transactions must be associated with an account and can optionally have a category
3. Transfers involve two accounts (from and to)
4. Budgets are period-based (monthly/yearly) and track spending by category
5. Financial goals track cumulative progress with priority levels
6. All monetary values use Decimal(19,4) precision for accuracy

---

## ✨ Features

### Authentication & Authorization
- ✅ JWT-based authentication with bcrypt password hashing
- ✅ Role-based access control (USER, ADMIN, MODERATOR)
- ✅ Per-user resource ownership enforcement
- ✅ Rate limiting (100 requests/60 seconds)

### Core Functionality
- ✅ Full CRUD operations for all resources
- ✅ Account balance recalculation on transactions
- ✅ Budget tracking with spending alerts
- ✅ Financial goal progress tracking
- ✅ Transaction filtering by date range
- ✅ Statistical endpoints (income/expense summaries)

### Security
- ✅ Helmet.js for secure HTTP headers
- ✅ CORS configuration
- ✅ Global validation with class-validator
- ✅ Request logging middleware
- ✅ No password/hash leakage in responses

---

## 🛠️ Technology Stack

- **Framework**: NestJS 11.x
- **Database**: PostgreSQL with Prisma ORM 7.x
- **Authentication**: Passport JWT
- **Validation**: class-validator & class-transformer
- **Security**: Helmet.js, @nestjs/throttler
- **Documentation**: Swagger/OpenAPI
- **Language**: TypeScript 5.x

---

## 📊 ERD (Entity Relationship Diagram)

```
┌─────────────┐       ┌──────────────┐       ┌────────────────┐
│    User     │       │  AccountType │       │   Category     │
├─────────────┤       ├──────────────┤       ├────────────────┤
│ id (PK)     │       │ id (PK)      │       │ id (PK)        │
│ email       │◄─────┐│ name (ENUM)  │◄─────┐│ name           │
│ password    │      ││ description  │      ││ type (ENUM)    │
│ name        │      │└──────────────┘      ││ color          │
│ role (ENUM) │      │                      ││ icon           │
│ ...         │      │                      ││ userId (FK) ───┤
└─────────────┘      │                      │└────────────────┘
       │             │                      │        │
       │             │                      │        │
       ▼             │                      │        ▼
┌─────────────┐      │                      │ ┌────────────────┐
│   Account   │      │                      │ │  Transaction   │
├─────────────┤      │                      │ ├────────────────┤
│ id (PK)     │      │                      │ │ id (PK)        │
│ name        │      │                      │ │ type (ENUM)    │
│ balance     │      │                      │ │ amount         │
│ userId (FK) │──────┤                      │ │ description    │
│ accountTypeId├──────┘                      │ │ date           │
│ currency    │                              │ │ userId (FK) ───┤
│ ...         │◄────┐                        │ │ accountId (FK)─┤
└─────────────┘     │                        │ │ categoryId (FK)┤
       │            │                        │ │ fromAccountId  │
       │            │                        │ │ toAccountId    │
       ▼            │                        │ │ ...            │
┌─────────────┐     │                        │ └────────────────┘
│   Budget    │     │                        │         │
├─────────────┤     │                        │         │
│ id (PK)     │     │                        │         ▼
│ name        │     │                        │  (Many-to-One Relations)
│ amount      │     │                        │
│ spent       │     │                        │
│ period      │     │                        │
│ userId (FK) │─────┤                        │
│ categoryId  │     │                        │
│ ...         │     │                        │
└─────────────┘     │                        │
                    │                        │
┌─────────────┐     │                        │
│    Goal     │     │                        │
├─────────────┤     │                        │
│ id (PK)     │     │                        │
│ name        │     │                        │
│ targetAmount│     │                        │
│ currentAmount    │                        │
│ targetDate  │     │                        │
│ priority    │     │                        │
│ status (ENUM)    │                        │
│ userId (FK) │─────┘                        │
│ ...         │                              │
└─────────────┘                              │
       │                                     │
       ▼                                     │
┌──────────────────┐                        │
│ GoalTransaction  │                        │
├──────────────────┤                        │
│ id (PK)          │                        │
│ goalId (FK)      │                        │
│ userId (FK)      │                        │
│ amount           │                        │
│ notes            │                        │
│ ...              │                        │
└──────────────────┘                        │
```

### Key Relationships:
- **User** `1:N` **Account** - A user can have multiple accounts
- **User** `1:N` **Category** - A user can create custom categories
- **User** `1:N` **Transaction** - A user can have many transactions
- **User** `1:N` **Budget** - A user can set multiple budgets
- **User** `1:N` **Goal** - A user can have multiple financial goals
- **Account** `1:N` **Transaction** - An account can have many transactions
- **Category** `1:N` **Transaction** - A category can be used in many transactions
- **Category** `1:N` **Budget** - A category can have multiple budgets
- **Goal** `1:N` **GoalTransaction** - A goal can have multiple contributions
- **AccountType** `1:N` **Account** - An account type can be used by many accounts

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ and npm/yarn
- PostgreSQL 14+
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the Backend directory:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/fintrack_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRE="7d"

# Application
PORT=3000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3001"
```

### 4. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Create database and run migrations
npx prisma db push

# Seed the database with sample data
npm run seed
```

**Demo Credentials:**
- Email: `demo@fintrack.com` / Password: `demo123`
- Email: `admin@fintrack.com` / Password: `admin123`

---

## 🏃 Running the Application

### Development Mode
```bash
npm run start:dev
```

The API will be available at:
- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api/docs

### Production Mode
```bash
# Build the application
npm run build

# Run in production
npm run start:prod
```

### Other Commands
```bash
# Run tests
npm run test

# Run tests with coverage
npm run test:cov

# Lint code
npm run lint

# Format code
npm run format

# View database in browser
npx prisma studio
```

---

## 📚 API Documentation

### Swagger Documentation
Interactive API documentation is available at: **http://localhost:3000/api/docs**

### API Endpoints Overview

#### Authentication
```
POST   /api/auth/register    - Register new user
POST   /api/auth/login       - Login user
GET    /api/auth/me          - Get current user
```

#### Users
```
GET    /api/users            - Get all users (Admin only)
GET    /api/users/:id        - Get user by ID
PATCH  /api/users/:id        - Update user
DELETE /api/users/:id        - Delete user
```

#### Accounts
```
POST   /api/accounts         - Create account
GET    /api/accounts         - Get all user accounts
GET    /api/accounts/:id     - Get account by ID
PATCH  /api/accounts/:id     - Update account
DELETE /api/accounts/:id     - Delete account
```

#### Categories
```
POST   /api/categories       - Create category
GET    /api/categories       - Get all user categories
GET    /api/categories/:id   - Get category by ID
PATCH  /api/categories/:id   - Update category
DELETE /api/categories/:id   - Delete category
```

#### Transactions
```
POST   /api/transactions         - Create transaction
GET    /api/transactions         - Get all transactions (supports date filtering)
GET    /api/transactions/stats   - Get income/expense statistics
GET    /api/transactions/:id     - Get transaction by ID
PATCH  /api/transactions/:id     - Update transaction
DELETE /api/transactions/:id     - Delete transaction
```

Query Parameters:
- `startDate`: Filter transactions from date (ISO 8601)
- `endDate`: Filter transactions to date (ISO 8601)

#### Budgets
```
POST   /api/budgets          - Create budget
GET    /api/budgets          - Get all budgets (supports month/year filtering)
GET    /api/budgets/summary  - Get budget summary
GET    /api/budgets/:id      - Get budget by ID
PATCH  /api/budgets/:id      - Update budget
DELETE /api/budgets/:id      - Delete budget
```

Query Parameters:
- `month`: Filter by month (1-12)
- `year`: Filter by year (e.g., 2024)

#### Goals
```
POST   /api/goals                - Create goal
GET    /api/goals                - Get all goals
GET    /api/goals/statistics     - Get goal statistics
GET    /api/goals/:id            - Get goal by ID
GET    /api/goals/:id/progress   - Get goal progress
POST   /api/goals/:id/contribute - Add contribution to goal
PATCH  /api/goals/:id            - Update goal
PATCH  /api/goals/:id/complete   - Mark goal as complete
DELETE /api/goals/:id             - Delete goal
```

### Authentication
All endpoints (except `/api/auth/register` and `/api/auth/login`) require JWT authentication.

**Header:**
```
Authorization: Bearer <your-jwt-token>
```

---

## 🔒 Security Features

### Implemented Security Measures:
1. **JWT Authentication** - Secure token-based authentication
2. **Password Hashing** - bcrypt with 10 salt rounds
3. **Helmet.js** - Security headers (XSS, CSP, HSTS, etc.)
4. **Rate Limiting** - Max 100 requests per 60 seconds per IP
5. **CORS Protection** - Whitelist specific origins
6. **Input Validation** - Global validation pipe with class-validator
7. **SQL Injection Protection** - Prisma parameterized queries
8. **Request Logging** - All requests logged with IP and user agent
9. **Ownership Enforcement** - Users can only access their own resources
10. **Role-Based Access** - Admin-only endpoints protected

### Best Practices:
- No sensitive data in logs
- Passwords never returned in API responses
- Environment variables for secrets
- HTTP-only cookies (if implemented)
- Secure password requirements

---

## 🗄️ Database Schema

### Core Tables:
1. **User** - User accounts and authentication
2. **Account** - Financial accounts (cash, bank, credit card, investment)
3. **Category** - Transaction categories (income/expense)
4. **Transaction** - Financial transactions (income, expense, transfer)

### Supporting Tables:
5. **Budget** - Budget tracking with alerts
6. **Goal** - Financial goals with contributions
7. **AccountType** - Account type definitions
8. **GoalTransaction** - Goal contribution history
9. **BudgetAlert** - Budget threshold alerts
10. **UserSetting** - User preferences
11. **Attachment** - File attachments for transactions
12. **ActivityLog** - Audit trail
13. **Notification** - System notifications

### Enums:
- **UserRole**: USER, ADMIN, MODERATOR
- **AccountTypeName**: CASH, BANK, EWALLET, CREDIT_CARD, INVESTMENT
- **CategoryType**: INCOME, EXPENSE
- **TransactionType**: INCOME, EXPENSE, TRANSFER
- **GoalStatus**: ACTIVE, COMPLETED, CANCELLED
- **RecurrenceType**: ONCE, DAILY, WEEKLY, BIWEEKLY, MONTHLY, QUARTERLY, YEARLY
- **NotificationFrequency**: IMMEDIATE, DAILY, WEEKLY, NEVER

---

## 📝 Advanced SQL Queries

The application includes several advanced database queries:

### 1. Transaction Statistics with Aggregation
```sql
SELECT 
  SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END) as total_income,
  SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) as total_expenses,
  COUNT(*) as transaction_count
FROM "Transaction"
WHERE "userId" = $1 
  AND "transactionDate" BETWEEN $2 AND $3;
```

### 2. Budget Summary with 3-Table Join
```sql
SELECT 
  b.id, b.name, b.amount, b.spent,
  c.name as category_name, c.color, c.icon,
  u.name as user_name
FROM "Budget" b
INNER JOIN "Category" c ON b."categoryId" = c.id
INNER JOIN "User" u ON b."userId" = u.id
WHERE b."userId" = $1 
  AND b."startDate" <= $2 
  AND b."endDate" >= $2;
```

### 3. Account Balance with Zero-Result Left Join
```sql
SELECT 
  a.id, a.name, a.balance,
  t.id as transaction_id, t.amount, t.type
FROM "Account" a
LEFT JOIN "Transaction" t ON a.id = t."accountId" 
  AND t."transactionDate" >= $1
WHERE a."userId" = $2;
-- Returns accounts even if they have no transactions in date range
```

### 4. Goal Progress with Window Function
```sql
SELECT 
  id, name, "targetAmount", "currentAmount",
  ("currentAmount" / "targetAmount" * 100) as progress_percent,
  ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY priority DESC, "targetDate" ASC) as rank
FROM "Goal"
WHERE "userId" = $1 AND status = 'ACTIVE';
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the UNLICENSED License.

---

## 👨‍💻 Author

**Your Name**  
📧 Email: your.email@example.com  
🌐 GitHub: [@yourusername](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- NestJS team for the amazing framework
- Prisma team for the excellent ORM
- All contributors and supporters

---

**Happy Coding! 💻✨**
