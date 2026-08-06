# 🗄️ Database Backup & Schema

This folder contains database backup and schema files for FinTrack application.

## 📁 Files

- `schema.sql` - Complete database schema (DDL)
- `seed_data.sql` - Sample/demo data
- `fintrack_schema_diagram.md` - Database ER diagram documentation

## 🚀 Usage

### Restore Database from Backup

```bash
# Using psql
psql -U username -d fintrack < schema.sql
psql -U username -d fintrack < seed_data.sql

# Or using Prisma
cd ../Backend
npx prisma migrate deploy
npx prisma db seed
```

### Create New Backup

```bash
# Export schema only
pg_dump -U username -d fintrack --schema-only > schema.sql

# Export data only  
pg_dump -U username -d fintrack --data-only > data_backup.sql

# Export full database
pg_dump -U username -d fintrack > full_backup.sql
```

### Database Information

- **Database Name:** fintrack
- **PostgreSQL Version:** 15.x or higher
- **Tables:** 13 tables
- **Total Relationships:** 20+ foreign keys

## 📊 Database Schema Overview

### Main Tables

1. **User** - User accounts
2. **UserSetting** - User preferences
3. **AccountType** - Account type definitions
4. **Account** - Financial accounts
5. **Category** - Transaction categories
6. **Transaction** - Financial transactions
7. **Budget** - Budget planning
8. **BudgetAlert** - Budget notifications
9. **Goal** - Financial goals
10. **GoalTransaction** - Goal contributions
11. **Recurring** - Recurring transactions
12. **ActivityLog** - Audit logs
13. **Notification** - User notifications

## 🔄 Migration History

All migrations are tracked in `Backend/prisma/migrations/` folder.

To check migration status:
```bash
cd Backend
npx prisma migrate status
```

## 📝 Notes

- Always backup before major schema changes
- Test restore on staging before production
- Keep backups in secure location
- Never commit sensitive data to git
