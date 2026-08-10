# FinTrack Database - Entity Relationship Diagram

## Database Schema Overview

This document provides a visual representation of the FinTrack database schema with all entities, relationships, and constraints.

## ERD Diagram (Text Representation)

```
┌─────────────────────┐
│       User          │
├─────────────────────┤
│ PK: id              │
│     email (UNIQUE)  │
│     password        │
│     name            │
│     role (ENUM)     │
│     emailVerified   │
│     createdAt       │
│     updatedAt       │
│     deletedAt       │
└─────────────────────┘
         │
         │ 1:N
         ├──────────────────────────────────┐
         │                                  │
         ▼                                  ▼
┌─────────────────────┐          ┌─────────────────────┐
│    UserSettings     │          │     Account         │
├─────────────────────┤          ├─────────────────────┤
│ PK: id              │          │ PK: id              │
│ FK: userId (UNIQUE) │          │ FK: userId          │
│     currency        │          │ FK: accountTypeId   │
│     language        │          │     name            │
│     timeZone        │          │     balance         │
│     theme           │          │     currency        │
│     notifications   │          │     description     │
│     createdAt       │          │     isActive        │
│     updatedAt       │          │     createdAt       │
└─────────────────────┘          │     updatedAt       │
                                 └─────────────────────┘
                                          │
                                          │ N:1
                                          ▼
                                 ┌─────────────────────┐
                                 │   AccountType       │
                                 ├─────────────────────┤
                                 │ PK: id              │
                                 │     name (UNIQUE)   │
                                 │     ENUM: CASH      │
                                 │           BANK      │
                                 │           CREDIT_CARD│
                                 │           INVESTMENT│
                                 └─────────────────────┘

┌─────────────────────┐
│       User          │
└─────────────────────┘
         │ 1:N
         ▼
┌─────────────────────┐
│     Category        │
├─────────────────────┤
│ PK: id              │
│ FK: userId          │
│     name            │
│     type (ENUM)     │
│     color           │
│     icon            │
│     isActive        │
│     createdAt       │
│     updatedAt       │
└─────────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────┐
│    Transaction      │
├─────────────────────┤
│ PK: id              │
│ FK: userId          │
│ FK: accountId       │
│ FK: categoryId      │
│ FK: fromAccountId   │◄────┐ (Self-referencing)
│ FK: toAccountId     │     │ (For TRANSFER type)
│     type (ENUM)     │     │
│     amount          │     │
│     description     │     │
│     transactionDate │     │
│     createdAt       │     │
│     updatedAt       │─────┘
└─────────────────────┘
         ▲
         │ N:1
         │
         └──────────────────────┐
                                │
┌─────────────────────┐         │
│      Account        │─────────┘
└─────────────────────┘
         │
         │ 1:N (via attachments)
         ▼
┌─────────────────────┐
│    Attachment       │
├─────────────────────┤
│ PK: id              │
│ FK: transactionId   │
│     fileName        │
│     fileUrl         │
│     fileType        │
│     fileSize        │
│     createdAt       │
└─────────────────────┘

┌─────────────────────┐
│       User          │
└─────────────────────┘
         │ 1:N
         ├──────────┬──────────┐
         │          │          │
         ▼          ▼          ▼
┌────────────┐ ┌────────────┐ ┌────────────┐
│   Budget   │ │    Goal    │ │ Activity   │
│            │ │            │ │    Log     │
├────────────┤ ├────────────┤ ├────────────┤
│ PK: id     │ │ PK: id     │ │ PK: id     │
│ FK: userId │ │ FK: userId │ │ FK: userId │
│ FK: catgId │ │     name   │ │     action │
│     amount │ │     target │ │     entity │
│     month  │ │     current│ │     entityId│
│     year   │ │     deadline│ │     details│
│     alert% │ │     priority│ │     createdAt│
│     isActiv│ │     status │ └────────────┘
│     createdAt│ │     compDt │
│     updatedAt│ │     createdAt│
└────────────┘ │     updatedAt│
               └────────────┘
                      │
                      │ 1:N
                      ▼
               ┌────────────┐
               │GoalTransact│
               ├────────────┤
               │ PK: id     │
               │ FK: userId │
               │ FK: goalId │
               │     amount │
               │     notes  │
               │     createdAt│
               └────────────┘

┌─────────────────────┐
│      Category       │
└─────────────────────┘
         │ 1:N
         ▼
┌─────────────────────┐
│    BudgetAlert      │
├─────────────────────┤
│ PK: id              │
│ FK: budgetId        │
│     threshold       │
│     isTriggered     │
│     triggeredAt     │
│     createdAt       │
└─────────────────────┘
```

## Key Relationships

### 1. User → Account (1:N)
- One user can have multiple accounts
- Each account belongs to exactly one user
- Cascade delete: When user is deleted, all accounts are deleted

### 2. User → Category (1:N)
- One user can create multiple custom categories
- Each category belongs to exactly one user
- Cascade delete: When user is deleted, all categories are deleted

### 3. User → Transaction (1:N)
- One user can have multiple transactions
- Each transaction belongs to exactly one user
- Cascade delete: When user is deleted, all transactions are deleted

### 4. Account → Transaction (1:N)
- One account can have multiple transactions
- Each transaction is associated with one primary account
- Nullable: Transactions can exist without an account (for transfers)

### 5. Transaction Self-Reference (TRANSFER type)
- fromAccountId → Account (where money comes from)
- toAccountId → Account (where money goes to)
- Used exclusively for TRANSFER type transactions
- Named relations: `fromTransactions` and `toTransactions`

### 6. Category → Transaction (1:N)
- One category can be used in multiple transactions
- Each transaction can be associated with one category (optional)

### 7. Category → Budget (1:N)
- One category can have multiple budgets (different months)
- Each budget is for exactly one category

### 8. User → Budget (1:N)
- One user can have multiple budgets
- Unique constraint: userId + categoryId + month + year

### 9. User → Goal (1:N)
- One user can have multiple financial goals
- Each goal belongs to exactly one user

### 10. Goal → GoalTransaction (1:N)
- One goal can have multiple contribution transactions
- Tracks progress towards goal completion

### 11. User → UserSettings (1:1)
- Each user has exactly one settings record
- Created automatically when user is created

### 12. AccountType → Account (1:N)
- Predefined account types (CASH, BANK, CREDIT_CARD, INVESTMENT)
- Seeded at application startup

## Constraints & Indexes

### Unique Constraints
- `User.email` - UNIQUE
- `UserSettings.userId` - UNIQUE (1:1 relationship)
- `Budget(userId, categoryId, month, year)` - UNIQUE COMPOSITE
- `AccountType.name` - UNIQUE

### Foreign Key Constraints
- All FK relationships enforce referential integrity
- Most use CASCADE delete for child records
- Some use SET NULL for optional relationships

### Check Constraints
- `Budget.amount` > 0
- `Budget.alertThreshold` BETWEEN 0 AND 100
- `Goal.targetAmount` > 0
- `Transaction.amount` > 0

### Enums
- `User.role`: USER, ADMIN
- `AccountType.name`: CASH, BANK, CREDIT_CARD, INVESTMENT
- `Category.type`: INCOME, EXPENSE
- `Transaction.type`: INCOME, EXPENSE, TRANSFER
- `Goal.priority`: LOW, MEDIUM, HIGH
- `Goal.status`: ACTIVE, COMPLETED, CANCELLED

## Database Features

### Timestamp Tracking
- All tables include `createdAt` and `updatedAt` (auto-managed by Prisma)
- Soft deletes supported via `deletedAt` field on User table

### Data Types
- `id`: Integer (auto-increment)
- `amount`, `balance`: Decimal(19,4) for precise financial calculations
- `email`: String (UNIQUE, indexed)
- `password`: String (hashed with bcrypt)
- Dates: DateTime (ISO 8601 format)

### Performance Optimizations
- Indexes on frequently queried columns (userId, email, transactionDate)
- Composite indexes for complex queries
- Foreign key indexes automatically created by PostgreSQL

## Notes

1. **Balance Recalculation**: Transaction creates/updates/deletes trigger automatic balance updates on associated accounts
2. **IDOR Protection**: All queries filter by userId to prevent unauthorized access
3. **RBAC**: User.role determines access level (USER or ADMIN)
4. **Named Relations**: Transaction has 3 different FK to Account, disambiguated with explicit relation names

---

**To generate visual ERD:**
1. Use Prisma Studio: `npx prisma studio`
2. Use online tools: https://prisma-erd.simonknott.de/ (paste schema.prisma)
3. Use dbdiagram.io or draw.io to create custom diagrams
4. Use PostgreSQL tools like pgAdmin or DBeaver with built-in ERD generators
