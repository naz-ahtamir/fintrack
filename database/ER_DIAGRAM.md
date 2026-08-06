# 📊 FinTrack - Database ER Diagram

## Entity Relationship Diagram

```
┌─────────────────────┐
│       User          │
│─────────────────────│
│ id (PK)             │
│ email (UNIQUE)      │
│ password            │
│ name                │
│ role                │
│ email_verified      │
│ created_at          │
│ updated_at          │
└─────────────────────┘
         │
         │ 1:1
         ↓
┌─────────────────────┐
│   UserSetting       │
│─────────────────────│
│ id (PK)             │
│ user_id (FK)        │
│ currency            │
│ language            │
│ theme               │
│ notifications       │
└─────────────────────┘

         │
         │ 1:N
         ↓
┌─────────────────────┐
│      Account        │
│─────────────────────│
│ id (PK)             │
│ user_id (FK)        │
│ account_type_id(FK) │
│ name                │
│ balance             │
│ currency            │
│ is_active           │
└─────────────────────┘
         │
         │ 1:N
         ↓
┌─────────────────────┐       ┌─────────────────────┐
│    Transaction      │ N:1   │     Category        │
│─────────────────────│───────│─────────────────────│
│ id (PK)             │       │ id (PK)             │
│ user_id (FK)        │       │ user_id (FK)        │
│ account_id (FK)     │       │ name                │
│ category_id (FK)    │       │ type                │
│ to_account_id (FK)  │       │ icon                │
│ type                │       │ color               │
│ amount              │       └─────────────────────┘
│ description         │
│ transaction_date    │
└─────────────────────┘
         │
         │ N:1
         ↓
┌─────────────────────┐
│       Budget        │
│─────────────────────│
│ id (PK)             │
│ user_id (FK)        │
│ category_id (FK)    │
│ amount              │
│ period_start        │
│ period_end          │
│ alert_threshold     │
└─────────────────────┘
         │
         │ 1:N
         ↓
┌─────────────────────┐
│   BudgetAlert       │
│─────────────────────│
│ id (PK)             │
│ budget_id (FK)      │
│ alert_date          │
│ spending_amount     │
│ percentage          │
│ is_read             │
└─────────────────────┘

         │
         │ User 1:N
         ↓
┌─────────────────────┐
│        Goal         │
│─────────────────────│
│ id (PK)             │
│ user_id (FK)        │
│ name                │
│ target_amount       │
│ current_amount      │
│ start_date          │
│ target_date         │
│ category            │
│ priority            │
│ is_achieved         │
└─────────────────────┘
         │
         │ 1:N
         ↓
┌─────────────────────┐
│  GoalTransaction    │
│─────────────────────│
│ id (PK)             │
│ goal_id (FK)        │
│ transaction_id (FK) │
│ amount              │
│ transaction_date    │
└─────────────────────┘

         │
         │ User 1:N
         ↓
┌─────────────────────┐
│     Recurring       │
│─────────────────────│
│ id (PK)             │
│ user_id (FK)        │
│ account_id (FK)     │
│ category_id (FK)    │
│ type                │
│ amount              │
│ frequency           │
│ start_date          │
│ next_occurrence     │
│ is_active           │
└─────────────────────┘

         │
         │ User 1:N
         ↓
┌─────────────────────┐
│   Notification      │
│─────────────────────│
│ id (PK)             │
│ user_id (FK)        │
│ type                │
│ title               │
│ message             │
│ is_read             │
│ read_at             │
│ metadata (JSONB)    │
└─────────────────────┘

         │
         │ User 1:N
         ↓
┌─────────────────────┐
│   ActivityLog       │
│─────────────────────│
│ id (PK)             │
│ user_id (FK)        │
│ action              │
│ entity_type         │
│ entity_id           │
│ details (JSONB)     │
│ ip_address          │
│ created_at          │
└─────────────────────┘
```

## Relationships Summary

### User (1) → (N) Relationships
- User → UserSetting (1:1)
- User → Account (1:N)
- User → Category (1:N)
- User → Transaction (1:N)
- User → Budget (1:N)
- User → Goal (1:N)
- User → Recurring (1:N)
- User → Notification (1:N)
- User → ActivityLog (1:N)

### Account Relationships
- Account → Transaction (1:N) via account_id
- Account → Transaction (1:N) via to_account_id (transfers)
- Account → Recurring (1:N)
- Account → AccountType (N:1)

### Category Relationships
- Category → Transaction (1:N)
- Category → Budget (1:N)
- Category → Recurring (1:N)

### Transaction Relationships
- Transaction → GoalTransaction (1:N)
- Transaction → Recurring (N:1) optional

### Budget Relationships
- Budget → BudgetAlert (1:N)

### Goal Relationships
- Goal → GoalTransaction (1:N)

## ENUM Types

### Role
- `USER` - Regular user
- `ADMIN` - Administrator

### AccountTypeName
- `CASH` - Cash/physical money
- `BANK` - Bank account
- `CREDIT_CARD` - Credit card
- `E_WALLET` - Digital wallet
- `INVESTMENT` - Investment account
- `OTHER` - Other types

### TransactionType
- `INCOME` - Money coming in
- `EXPENSE` - Money going out
- `TRANSFER` - Transfer between accounts

### RecurringFrequency
- `DAILY` - Every day
- `WEEKLY` - Every week
- `MONTHLY` - Every month
- `YEARLY` - Every year

### NotificationFrequency
- `REALTIME` - Immediate notification
- `DAILY` - Daily digest
- `WEEKLY` - Weekly digest
- `NEVER` - Disabled

### NotificationType
- `TRANSACTION` - Transaction notification
- `BUDGET_ALERT` - Budget threshold alert
- `GOAL_ACHIEVEMENT` - Goal milestone reached
- `RECURRING_REMINDER` - Upcoming recurring transaction
- `SYSTEM` - System notification

## Key Constraints

### Primary Keys (PK)
All tables have an auto-incrementing `id` as primary key.

### Foreign Keys (FK)
All foreign keys have appropriate CASCADE or RESTRICT actions:
- `CASCADE` - Delete related records when parent is deleted
- `RESTRICT` - Prevent deletion if related records exist
- `SET NULL` - Set to NULL when parent is deleted

### Unique Constraints
- `User.email` - Unique email addresses
- `UserSetting.user_id` - One setting per user
- `AccountType.name` - Unique account type names
- `Category (user_id, name, type)` - Unique category per user and type

## Indexes

Performance indexes created on:
- User: email, role
- Account: user_id, account_type_id
- Transaction: user_id, account_id, category_id, transaction_date, type
- Budget: user_id, category_id, period
- Goal: user_id, target_date
- Notification: user_id, is_read

## Data Types

### Decimal Fields
All monetary amounts use `DECIMAL(19, 4)` for precision:
- 19 total digits
- 4 decimal places
- Supports up to 999,999,999,999,999.9999

### Timestamp Fields
All timestamps use `TIMESTAMP(3)` with millisecond precision.

### JSONB Fields
- `Notification.metadata` - Flexible notification data
- `ActivityLog.details` - Audit log details

## Notes

1. **Soft Delete**: User table has `deleted_at` field for soft deletion
2. **Audit Trail**: ActivityLog tracks all important user actions
3. **Cascade Delete**: Most relationships cascade delete to maintain data integrity
4. **Balance Tracking**: Account balance updated via transactions
5. **Goal Progress**: Goal current_amount tracks contributions via GoalTransaction

## Database Size Estimate

For a typical user with:
- 1,000 transactions/year
- 10 accounts
- 20 categories
- 5 budgets
- 3 goals

Estimated size: ~5-10 MB per user per year

## Backup Recommendations

- **Daily**: Incremental backups
- **Weekly**: Full database backup
- **Monthly**: Archive to long-term storage
- **Before Migration**: Always backup before schema changes
