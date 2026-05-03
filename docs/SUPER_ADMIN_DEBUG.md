# Super Admin Debug Guide

## Step 1: Check if Super Admin exists in database

Visit: http://localhost:3000/api/setup/super-admin

Expected response if exists:
```json
{
  "success": true,
  "exists": true,
  "data": {
    "id": "...",
    "name": "Super Administrator",
    "email": "superadmin@soulwise.connect",
    "status": "ACTIVE",
    "createdAt": "...",
    "lastLogin": null
  }
}
```

## Step 2: Create Super Admin (if not exists)

```bash
curl -X POST http://localhost:3000/api/setup/super-admin
```

## Step 3: Try to login

1. Go to http://localhost:3000/login
2. Enter:
   - Email: `superadmin@soulwise.connect`
   - Password: `SuperAdmin@123`
3. Check browser console and server logs

## Step 4: Check logs

### Server logs will show:
```
🔐 Login attempt: { email: 'superadmin@soulwise.connect', enrollmentId: false }
🔍 Looking for admin with email: superadmin@soulwise.connect
📋 Admin found: { id: '...', email: '...', adminType: 'SUPER_ADMIN', isSuperAdmin: true, status: 'ACTIVE' }
✅ Admin found and active
🔑 Verifying password...
🔑 Password valid: true
🎫 Admin token payload: { adminType: 'SUPER_ADMIN', isSuperAdmin: true, role: 'SUPER_ADMIN' }
🎫 Token generated successfully
✅ Login successful for: { email: 'superadmin@soulwise.connect', userType: 'ADMIN', adminType: 'SUPER_ADMIN', isSuperAdmin: true }
```

### Browser console will show:
```
🔐 AuthContext: Attempting login... { email: 'superadmin@soulwise.connect', enrollmentId: false }
📥 AuthContext: Login response: { success: true, userType: 'ADMIN', adminType: 'SUPER_ADMIN', isSuperAdmin: true }
✅ AuthContext: Setting user data: { userType: 'ADMIN', adminType: 'SUPER_ADMIN', isSuperAdmin: true, role: 'SUPER_ADMIN' }
```

## Common Issues:

### 1. Super Admin not found
- Run: `curl -X POST http://localhost:3000/api/setup/super-admin`

### 2. Wrong password
- Password is case-sensitive: `SuperAdmin@123`
- Make sure there are no extra spaces

### 3. Account not active
- Check database: `status` field should be `'ACTIVE'`

### 4. Can't reach database
- Check .env file has correct DATABASE_URL
- Make sure database is running

### 5. Token/cookie issues
- Clear browser cookies
- Try incognito mode
- Check browser console for errors

## Direct Database Check (if using Prisma Studio)

```bash
npx prisma studio
```

Then check:
1. Open `admins` table
2. Look for super admin with:
   - `adminType` = "SUPER_ADMIN"
   - `isSuperAdmin` = true
   - `status` = "ACTIVE"
   - `email` = "superadmin@soulwise.connect"

## Reset Super Admin Password (if needed)

Create a script `reset-super-admin-password.ts`:
```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetPassword() {
  const newPassword = 'SuperAdmin@123';
  const passwordHash = await bcrypt.hash(newPassword, 12);
  
  await prisma.admin.updateMany({
    where: {
      adminType: 'SUPER_ADMIN',
      isSuperAdmin: true,
    },
    data: {
      passwordHash,
    },
  });
  
  console.log('✅ Password reset to:', newPassword);
  await prisma.$disconnect();
}

resetPassword();
```

Run: `npx ts-node reset-super-admin-password.ts`
