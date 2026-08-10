# API Smoke Test - FinTrack Backend

**Base URL:** `https://fintrack-backend.adaptable.app`  
**Local URL:** `http://localhost:3000`

## Test Environment Setup

### Prerequisites
- Valid JWT token (obtain from login endpoint)
- Test credentials:
  - Demo User: `demo@fintrack.com` / `Demo@2026#`
  - Admin User: `admin@fintrack.com` / `Admin@2026#`
  - User 2: `user2@fintrack.com` / `User@2026#`

### Headers Required
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

---

## 1. Authentication Tests

### ✅ Test 1.1: Register New User
**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "testuser@example.com",
  "password": "Test@2026#",
  "name": "Test User"
}
```

**Expected Response (201):**
```json
{
  "user": {
    "id": 4,
    "email": "testuser@example.com",
    "name": "Test User",
    "role": "USER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### ✅ Test 1.2: Login Existing User
**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "demo@fintrack.com",
  "password": "Demo@2026#"
}
```

**Expected Response (200):**
```json
{
  "user": {
    "id": 1,
    "email": "demo@fintrack.com",
    "name": "Demo User",
    "role": "USER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### ❌ Test 1.3: Login with Invalid Credentials
**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "demo@fintrack.com",
  "password": "wrongpassword"
}
```

**Expected Response (401):**
```json
{
  "statusCode": 401,
  "message": "Invalid email or password"
}
```

---

## 2. Users Tests (RBAC Protected)

### ✅ Test 2.1: Get User Profile (Any authenticated user)
**Endpoint:** `GET /api/users/profile`

**Headers:**
```
Authorization: Bearer <user-token>
```

**Expected Response (200):**
```json
{
  "id": 1,
  "email": "demo@fintrack.com",
  "name": "Demo User",
  "role": "USER",
  "emailVerified": true,
  "createdAt": "2026-01-15T10:30:00.000Z"
}
```

### ❌ Test 2.2: Get All Users (USER role - should fail)
**Endpoint:** `GET /api/users`

**Headers:**
```
Authorization: Bearer <user-token>
```

**Expected Response (403):**
```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

### ✅ Test 2.3: Get All Users (ADMIN role - should succeed)
**Endpoint:** `GET /api/users`

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Expected Response (200):**
```json
[
  {
    "id": 1,
    "email": "demo@fintrack.com",
    "name": "Demo User",
    "role": "USER"
  },
  {
    "id": 2,
    "email": "admin@fintrack.com",
    "name": "Admin User",
    "role": "ADMIN"
  }
]
```

---

## 3. Accounts Tests

### ✅ Test 3.1: Create New Account
**Endpoint:** `POST /api/accounts`

**Request Body:**
```json
{
  "name": "Test Wallet",
  "type": "CASH",
  "balance": 500000,
  "currency": "IDR",
  "description": "Test cash account"
}
```

**Expected Response (201):**
```json
{
  "id": 10,
  "name": "Test Wallet",
  "balance": 500000,
  "currency": "IDR",
  "userId": 1,
  "accountType": {
    "id": 1,
    "name": "CASH"
  }
}
```

### ✅ Test 3.2: Get All Accounts
**Endpoint:** `GET /api/accounts`

**Expected Response (200):**
```json
[
  {
    "id": 1,
    "name": "Dompet Demo",
    "balance": 5000000,
    "currency": "IDR",
    "accountType": { "name": "CASH" }
  },
  {
    "id": 2,
    "name": "BCA Demo",
    "balance": 15000000,
    "currency": "IDR",
    "accountType": { "name": "BANK" }
  }
]
```

### ❌ Test 3.3: Get Account Not Owned (IDOR Test)
**Endpoint:** `GET /api/accounts/999`

**Expected Response (404):**
```json
{
  "statusCode": 404,
  "message": "Account not found"
}
```

---

## 4. Categories Tests

### ✅ Test 4.1: Create Category
**Endpoint:** `POST /api/categories`

**Request Body:**
```json
{
  "name": "Healthcare",
  "type": "EXPENSE",
  "color": "#10b981"
}
```

**Expected Response (201):**
```json
{
  "id": 9,
  "name": "Healthcare",
  "type": "EXPENSE",
  "color": "#10b981",
  "userId": 1
}
```

### ✅ Test 4.2: Get Categories by Type
**Endpoint:** `GET /api/categories?type=EXPENSE`

**Expected Response (200):**
```json
[
  {
    "id": 3,
    "name": "Food",
    "type": "EXPENSE",
    "color": "#ef4444"
  },
  {
    "id": 4,
    "name": "Transport",
    "type": "EXPENSE",
    "color": "#f59e0b"
  }
]
```

---

## 5. Transactions Tests (Balance Recalculation)

### ✅ Test 5.1: Create Income Transaction
**Endpoint:** `POST /api/transactions`

**Request Body:**
```json
{
  "type": "INCOME",
  "amount": 5000000,
  "description": "Monthly Salary",
  "date": "2026-08-01",
  "accountId": 1,
  "categoryId": 1
}
```

**Expected Response (201):**
```json
{
  "id": 50,
  "type": "INCOME",
  "amount": 5000000,
  "description": "Monthly Salary",
  "transactionDate": "2026-08-01T00:00:00.000Z",
  "account": {
    "id": 1,
    "name": "Dompet Demo",
    "balance": 10000000
  }
}
```

**Verification:** Account balance should increase by 5000000

### ✅ Test 5.2: Create Expense Transaction
**Endpoint:** `POST /api/transactions`

**Request Body:**
```json
{
  "type": "EXPENSE",
  "amount": 200000,
  "description": "Groceries shopping",
  "date": "2026-08-02",
  "accountId": 1,
  "categoryId": 3
}
```

**Expected Response (201):**
Account balance should decrease by 200000

### ❌ Test 5.3: Update Transaction Not Owned (IDOR Test)
**Endpoint:** `PATCH /api/transactions/999`

**Request Body:**
```json
{
  "amount": 1000000
}
```

**Expected Response (404):**
```json
{
  "statusCode": 404,
  "message": "Transaction not found"
}
```

### ✅ Test 5.4: Get Transaction Statistics
**Endpoint:** `GET /api/transactions/stats?startDate=2026-08-01&endDate=2026-08-31`

**Expected Response (200):**
```json
{
  "income": 5000000,
  "expenses": 200000,
  "balance": 4800000,
  "transactionCount": 2
}
```

---

## 6. Budgets Tests

### ✅ Test 6.1: Create Budget
**Endpoint:** `POST /api/budgets`

**Request Body:**
```json
{
  "categoryId": 3,
  "amount": 2000000,
  "month": 8,
  "year": 2026
}
```

**Expected Response (201):**
```json
{
  "id": 5,
  "categoryId": 3,
  "amount": 2000000,
  "month": 8,
  "year": 2026,
  "category": {
    "name": "Food"
  }
}
```

### ✅ Test 6.2: Get Budget Summary
**Endpoint:** `GET /api/budgets/summary?month=8&year=2026`

**Expected Response (200):**
```json
{
  "budgets": [
    {
      "id": 5,
      "amount": 2000000,
      "spent": 200000,
      "remaining": 1800000,
      "percentage": 10,
      "category": { "name": "Food" }
    }
  ],
  "totalBudget": 2000000,
  "totalSpent": 200000
}
```

---

## 7. Goals Tests

### ✅ Test 7.1: Create Goal
**Endpoint:** `POST /api/goals`

**Request Body:**
```json
{
  "name": "Emergency Fund",
  "targetAmount": 50000000,
  "targetDate": "2027-01-01",
  "priority": "HIGH",
  "description": "Build emergency fund for 6 months expenses"
}
```

**Expected Response (201):**
```json
{
  "id": 3,
  "name": "Emergency Fund",
  "targetAmount": 50000000,
  "currentAmount": 0,
  "targetDate": "2027-01-01T00:00:00.000Z",
  "priority": "HIGH",
  "status": "ACTIVE"
}
```

### ✅ Test 7.2: Add Contribution to Goal
**Endpoint:** `POST /api/goals/3/contribute`

**Request Body:**
```json
{
  "amount": 5000000,
  "notes": "First contribution"
}
```

**Expected Response (200):**
```json
{
  "transaction": {
    "id": 15,
    "amount": 5000000,
    "notes": "First contribution"
  },
  "goal": {
    "currentAmount": 5000000,
    "progress": 10
  }
}
```

---

## 8. Error Handling Tests

### ❌ Test 8.1: Missing Authorization Header
**Endpoint:** `GET /api/accounts`

**Headers:** (No Authorization header)

**Expected Response (401):**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### ❌ Test 8.2: Invalid JWT Token
**Endpoint:** `GET /api/accounts`

**Headers:**
```
Authorization: Bearer invalid-token-123
```

**Expected Response (401):**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### ❌ Test 8.3: Validation Error
**Endpoint:** `POST /api/accounts`

**Request Body:**
```json
{
  "name": "",
  "type": "INVALID_TYPE"
}
```

**Expected Response (400):**
```json
{
  "statusCode": 400,
  "message": [
    "name should not be empty",
    "type must be one of: CASH, BANK, CREDIT_CARD, INVESTMENT"
  ],
  "error": "Bad Request"
}
```

---

## Test Execution Summary

| Test Category | Total Tests | Expected Pass | Expected Fail (Security) |
|--------------|-------------|---------------|-------------------------|
| Authentication | 3 | 2 | 1 |
| Users (RBAC) | 3 | 2 | 1 |
| Accounts | 3 | 2 | 1 |
| Categories | 2 | 2 | 0 |
| Transactions | 4 | 3 | 1 |
| Budgets | 2 | 2 | 0 |
| Goals | 2 | 2 | 0 |
| Error Handling | 3 | 0 | 3 |
| **TOTAL** | **22** | **15** | **7** |

---

## Security Verification Checklist

- ✅ JWT authentication required for all protected endpoints
- ✅ RBAC properly enforced (Admin-only endpoints blocked for USER role)
- ✅ IDOR protection - users cannot access other users' data
- ✅ Password hashing with bcrypt
- ✅ Input validation with class-validator
- ✅ Rate limiting on login endpoint
- ✅ CORS properly configured
- ✅ Helmet security headers enabled

---

## Notes

1. **Balance Recalculation:** Verify account balance changes after creating/updating/deleting transactions
2. **RBAC Testing:** Test with both USER and ADMIN tokens to verify role restrictions
3. **IDOR Testing:** Attempt to access resources with IDs not owned by the authenticated user
4. **Date Ranges:** Test transaction filters and stats with various date ranges
5. **Validation:** Test all endpoints with invalid/missing data to verify proper error handling
