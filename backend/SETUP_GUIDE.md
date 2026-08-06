# Database Setup Guide

## Prerequisites

Pastikan Anda sudah punya:
- ✅ PostgreSQL 12+ installed dan running
- ✅ Database `fintrack_db` tersedia
- ✅ `.env` file sudah dikonfigurasi dengan `DATABASE_URL`
- ✅ Node.js 18+ dan npm installed

---

## Step 1: Verify Environment Variables

Cek file `.env`:

```env
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/fintrack_db
JWT_SECRET=b55e12c9460e66df6a1400147353f81ea961be903e94de43ce2d4efa3a690946b531f6811b120fb1ed20cc22852ba8301402ad39c2832c711cc29da1be2898ee
JWT_EXPIRE=7d
NODE_ENV=development
PORT=3000
```

**⚠️ Important:** 
- Ganti `postgres123` dengan actual password Anda
- Generate unique JWT_SECRET untuk production

---

## Step 2: Create Database

```bash
# Login ke PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE fintrack_db;

# Create user (optional, if using different user)
CREATE USER fintrack_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE fintrack_db TO fintrack_user;

# Verify
\l  # list databases
```

---

## Step 3: Install Dependencies

```bash
cd Backend

# Install npm packages
npm install

# Or using yarn
yarn install
```

---

## Step 4: Run Migrations

```bash
# Create initial migration from schema
npx prisma migrate dev --name init

# This will:
# ✅ Create all tables
# ✅ Add indexes
# ✅ Setup relationships
# ✅ Generate Prisma client
```

**Expected output:**
```
✓ Generated Prisma Client (x.x.x) to ./node_modules/@prisma/client in 234ms

Environment variables loaded from .env

Prisma schema loaded from ./prisma/schema.prisma

✓ Created database schema (xxx ms)

✓ Migration 001_init_fintrack_db applied successfully
```

---

## Step 5: Generate Prisma Client

```bash
npx prisma generate
```

**Verifikasi:**
```bash
# Check if client was generated
ls -la ./generated/prisma/client
```

---

## Step 6: Seed Database (Optional)

Jika ada seed script, jalankan:

```bash
npx prisma db seed
```

Atau buat seed script baru:

```bash
# Create seed file
touch prisma/seed.ts
```

Tambahkan ke `package.json`:

```json
"prisma": {
  "seed": "ts-node prisma/seed.ts"
}
```

---

## Step 7: Verify Schema

```bash
# Open Prisma Studio untuk inspect database
npx prisma studio

# Browser akan membuka di http://localhost:5555
```

---

## Step 8: Fix Auth Guard Issue

Update auth guard di controllers untuk menggunakan JWT dari Passport:

```typescript
// Backend/src/auth/auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends PassportAuthGuard('jwt') {}
```

Update import di controllers:

```typescript
// Dari:
import { AuthGuard } from '../auth/auth.guard';
@UseGuards(AuthGuard)

// Ke:
import { JwtAuthGuard } from '../auth/auth.guard';
@UseGuards(JwtAuthGuard)
```

---

## Step 9: Update API Routes (Important!)

Backend routes harus punya `/api` prefix agar sesuai dengan frontend:

```typescript
// Backend/src/transactions/transactions.controller.ts
@Controller('api/transactions')  // Tambahkan 'api/' prefix
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  // ...
}
```

Apply ke semua controllers:
- `api/transactions`
- `api/accounts`
- `api/categories`
- `api/budgets`
- `api/goals`
- `api/auth` (sudah punya)

---

## Step 10: Build & Test

```bash
# Build TypeScript
npm run build

# Start development server
npm run start:dev

# Expected output:
# 🚀 Backend is running on: http://localhost:3000
```

---

## Step 11: Test API Endpoints

Gunakan Postman atau curl untuk test:

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Response expected:
# {
#   "user": { "id": 1, "email": "test@example.com", "name": "Test User" },
#   "token": "eyJhbGciOiJIUzI1NiIs..."
# }

# Get accounts (with token)
curl -X GET http://localhost:3000/api/accounts \
  -H "Authorization: Bearer <token>"
```

---

## Step 12: Frontend Integration

Update Frontend `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Test frontend connection:

```bash
cd Frontend
npm run dev

# Browser akan open di http://localhost:3001
```

---

## Common Issues & Solutions

### Issue: "Database does not exist"
```bash
# Solution: Create database manually
psql -U postgres -c "CREATE DATABASE fintrack_db;"
```

### Issue: "Permission denied"
```bash
# Solution: Check database URL in .env
# Format: postgresql://user:password@localhost:5432/database_name
```

### Issue: "Migration failed"
```bash
# Solution: Reset database (development only!)
npx prisma migrate reset --force

# Or manually drop and recreate
psql -U postgres -c "DROP DATABASE fintrack_db;"
psql -U postgres -c "CREATE DATABASE fintrack_db;"
```

### Issue: "Prisma Client not found"
```bash
# Solution: Regenerate client
npx prisma generate
```

---

## Verification Checklist

- [ ] PostgreSQL running
- [ ] Database `fintrack_db` created
- [ ] `.env` configured correctly
- [ ] Dependencies installed (`npm install`)
- [ ] Migrations applied (`npx prisma migrate dev`)
- [ ] Prisma client generated (`npx prisma generate`)
- [ ] Auth guard fixed
- [ ] API routes updated with `/api` prefix
- [ ] Backend builds successfully (`npm run build`)
- [ ] Backend starts successfully (`npm run start:dev`)
- [ ] API endpoints respond (test with curl/Postman)
- [ ] Frontend `.env.local` configured
- [ ] Frontend starts successfully (`npm run dev`)
- [ ] Frontend can call backend endpoints

---

## Production Checklist

Before deploying to production:

- [ ] Generate new JWT_SECRET
- [ ] Use strong database password
- [ ] Enable SSL for database connection
- [ ] Set `NODE_ENV=production`
- [ ] Enable CORS properly (only frontend domain)
- [ ] Use environment variables, not hardcoded values
- [ ] Enable rate limiting
- [ ] Setup logging and monitoring
- [ ] Backup database
- [ ] Test all endpoints
- [ ] Load testing
- [ ] Security audit

---

## Useful Commands

```bash
# View database in Prisma Studio
npx prisma studio

# Generate schema diagram
npx prisma generate --only-engine

# Format Prisma schema
npx prisma format

# Validate Prisma schema
npx prisma validate

# Create migration without applying
npx prisma migrate diff --from-url "$OLD_DATABASE_URL" --to-schema-from-stdin

# Rollback migration
npx prisma migrate resolve --rolled-back migration_name
```

---

## Next Steps

1. ✅ Complete all setup steps above
2. ✅ Run API tests to verify everything works
3. ✅ Test frontend-backend integration
4. ✅ Deploy to staging environment
5. ✅ Run comprehensive testing
6. ✅ Deploy to production

