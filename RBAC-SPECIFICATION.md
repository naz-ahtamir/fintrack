# 🔐 RBAC Specification - FinTrack

## Role Hierarchy & Permissions

### **1. USER** (Regular User)
**Deskripsi:** User biasa yang hanya bisa manage data finansial mereka sendiri

**Permissions:**
- ✅ Manage own accounts (create, read, update, delete)
- ✅ Manage own transactions (create, read, update, delete)
- ✅ Manage own categories (create, read, update, delete)
- ✅ Manage own budgets (create, read, update, delete)
- ✅ Manage own goals (create, read, update, delete)
- ✅ View own profile and statistics
- ✅ Update own settings
- ✅ Change own password
- ❌ **CANNOT** view other users
- ❌ **CANNOT** view user list
- ❌ **CANNOT** manage other users' data
- ❌ **CANNOT** access admin endpoints

**Protected From:**
- IDOR attacks (ownership checks enforced)
- Cross-user data access

---

### **2. MODERATOR** (Content Moderator)
**Deskripsi:** User yang bisa view data users untuk moderasi, tapi tidak bisa edit

**Permissions:**
- ✅ All USER permissions (untuk data sendiri)
- ✅ **View all users list** (read-only)
- ✅ **View user profiles** (read-only)
- ✅ **View user statistics** (read-only)
- ✅ **View activity logs** (untuk monitoring)
- ❌ **CANNOT** modify other users' data
- ❌ **CANNOT** delete users
- ❌ **CANNOT** change user roles
- ❌ **CANNOT** access sensitive admin functions

**Use Case:**
- Customer support yang perlu lihat data user untuk troubleshooting
- Content moderator untuk compliance check
- Auditor untuk monitoring transaksi suspicious

---

### **3. ADMIN** (System Administrator)
**Deskripsi:** Full system access, dapat manage semua users dan system settings

**Permissions:**
- ✅ All MODERATOR permissions
- ✅ All USER permissions
- ✅ **Manage all users** (create, read, update, delete)
- ✅ **Change user roles**
- ✅ **Delete users**
- ✅ **View system statistics**
- ✅ **Manage system settings** (future: account types, etc.)
- ✅ **Full database access**

**Use Case:**
- System administrator
- Super admin untuk management
- Technical support dengan full access

---

## Implementation Matrix

| Endpoint | USER | MODERATOR | ADMIN |
|----------|------|-----------|-------|
| **Authentication** |
| POST /api/auth/register | ✅ | ✅ | ✅ |
| POST /api/auth/login | ✅ | ✅ | ✅ |
| **Users** |
| GET /api/users/profile | ✅ (own) | ✅ (own) | ✅ (own) |
| GET /api/users/statistics | ✅ (own) | ✅ (own) | ✅ (own) |
| PATCH /api/users/settings | ✅ (own) | ✅ (own) | ✅ (own) |
| POST /api/users/change-password | ✅ (own) | ✅ (own) | ✅ (own) |
| GET /api/users | ❌ | ✅ (read-only) | ✅ (full) |
| GET /api/users/:id | ❌ | ✅ (read-only) | ✅ (full) |
| PATCH /api/users/:id | ❌ | ❌ | ✅ |
| DELETE /api/users/:id | ❌ | ❌ | ✅ |
| **Accounts** |
| All /api/accounts/* | ✅ (own) | ✅ (own) | ✅ (own) |
| **Transactions** |
| All /api/transactions/* | ✅ (own) | ✅ (own) | ✅ (own) |
| **Categories** |
| All /api/categories/* | ✅ (own) | ✅ (own) | ✅ (own) |
| **Budgets** |
| All /api/budgets/* | ✅ (own) | ✅ (own) | ✅ (own) |
| **Goals** |
| All /api/goals/* | ✅ (own) | ✅ (own) | ✅ (own) |

---

## Code Implementation

### RolesGuard Enhancement

```typescript
// Support multiple roles
@Roles('ADMIN', 'MODERATOR')
@Get('/api/users')
findAllUsers() { ... }
```

### Current Implementation:
- ✅ JWT includes role in payload
- ✅ RolesGuard checks role from request.user
- ✅ @Roles decorator applied to admin endpoints
- ⚠️ MODERATOR belum fully implemented (hanya read access ke /users)

---

## Demo Credentials

**User:**
- Email: `demo@fintrack.com`
- Password: `Demo@2026#`
- Role: `USER`

**Moderator:**
- Email: `moderator@fintrack.com`
- Password: `Mod@2026#`
- Role: `MODERATOR`

**Admin:**
- Email: `admin@fintrack.com`
- Password: `Admin@2026#`
- Role: `ADMIN`

**User 2:**
- Email: `user2@fintrack.com`
- Password: `User@2026#`
- Role: `USER`

---

## Testing RBAC

### Test 1: USER Access Control
```bash
# Login as USER
POST /api/auth/login
{ "email": "demo@fintrack.com", "password": "Demo@2026#" }

# Try to access admin endpoint
GET /api/users
Authorization: Bearer <user-token>

# Expected: 403 Forbidden
```

### Test 2: MODERATOR Access Control
```bash
# Login as MODERATOR
POST /api/auth/login
{ "email": "moderator@fintrack.com", "password": "Mod@2026#" }

# Access user list (read-only)
GET /api/users
Authorization: Bearer <moderator-token>

# Expected: 200 OK with user list
```

### Test 3: ADMIN Full Access
```bash
# Login as ADMIN
POST /api/auth/login
{ "email": "admin@fintrack.com", "password": "Admin@2026#" }

# Access user list
GET /api/users
Authorization: Bearer <admin-token>

# Expected: 200 OK with user list

# Get specific user
GET /api/users/1
Authorization: Bearer <admin-token>

# Expected: 200 OK with user details
```

### Test 4: IDOR Protection
```bash
# Login as USER (ID 1)
# Try to access another user's transaction (ID belongs to user 2)
GET /api/transactions/999
Authorization: Bearer <user1-token>

# Expected: 404 Not Found (ownership check)
```

---

## Future Enhancements

1. **Permission System:**
   - Granular permissions per resource
   - Custom permission groups
   - Permission inheritance

2. **Audit Logs:**
   - Track admin/moderator actions
   - Log all data access by privileged users
   - Compliance reporting

3. **Role Management UI:**
   - Admin can assign/revoke roles
   - Bulk role updates
   - Role activity dashboard

4. **Advanced MODERATOR Features:**
   - Flag suspicious transactions
   - Review reported users
   - Export user data for compliance

---

## Security Notes

- ✅ All endpoints enforce authentication (JwtAuthGuard)
- ✅ Admin/Moderator endpoints protected by RolesGuard
- ✅ Ownership checks prevent IDOR attacks
- ✅ JWT tokens include role claim
- ✅ Role cannot be self-assigned during registration
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ Rate limiting on auth endpoints

**Best Practices:**
- Never trust client-side role checks
- Always verify role on server side
- Log all privileged operations
- Implement principle of least privilege
