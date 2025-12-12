# Super Admin Setup Guide

## ✅ Migrations Applied

The Prisma schema has been updated and migrated successfully:
- Migration: `20251130191951_allow_same_dept_code_per_institute`
- Department codes are now unique per institute (not globally)

## 🔧 Create Super Admin

You can create the Super Admin account using the API endpoint:

### Method 1: Check if Super Admin exists (GET)
```bash
curl http://localhost:3000/api/setup/super-admin
```

### Method 2: Create Super Admin with defaults (POST)
```bash
curl -X POST http://localhost:3000/api/setup/super-admin \
  -H "Content-Type: application/json"
```

**Default Credentials:**
- Email: `superadmin@soulwise.connect`
- Password: `SuperAdmin@123`
- Name: `Super Administrator`

### Method 3: Create Super Admin with custom credentials (POST)
```bash
curl -X POST http://localhost:3000/api/setup/super-admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourcompany.com",
    "password": "YourSecurePassword123!",
    "name": "Your Admin Name"
  }'
```

## 🌐 Browser Method

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your browser and visit:
   ```
   http://localhost:3000/api/setup/super-admin
   ```
   
   This will show if Super Admin exists.

3. To create, use a REST client or browser console:
   ```javascript
   fetch('http://localhost:3000/api/setup/super-admin', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({})  // Use defaults or provide custom credentials
   })
   .then(r => r.json())
   .then(console.log)
   ```

## 🔐 Login

After creating the Super Admin:

1. Go to: `http://localhost:3000/login`
2. Enter credentials:
   - Email: `superadmin@soulwise.connect` (or your custom email)
   - Password: `SuperAdmin@123` (or your custom password)
3. **Important:** Change the password immediately after first login!

## 📊 Features

Super Admin can:
- ✅ Create and manage universities
- ✅ Create and manage institutes
- ✅ Assign university and institute admins
- ✅ View all system data
- ✅ Access audit logs
- ✅ Manage departments (with new per-institute code uniqueness)

## 🔄 Department Code Changes

With the new migration:
- ✅ Different institutes can now have departments with the same code (e.g., both can have "CSE")
- ❌ Same institute cannot have duplicate department codes
- Example:
  ```
  Institute A → CSE (Computer Science)  ✅
  Institute B → CSE (Computer Science)  ✅  (Previously would fail)
  Institute A → CSE (again)             ❌  (Still fails - duplicate in same institute)
  ```

## 🛠️ Environment Variables (Optional)

Add to your `.env` file to customize default Super Admin:

```env
SUPER_ADMIN_EMAIL=admin@yourcompany.com
SUPER_ADMIN_PASSWORD=YourSecurePassword123!
SUPER_ADMIN_NAME=Your Admin Name
```

## ⚠️ Security Notes

1. **Change the default password immediately** after first login
2. Store credentials securely (use a password manager)
3. In production, use strong, unique passwords
4. Consider enabling 2FA for Super Admin accounts
5. The API endpoint should be disabled or protected in production

## 🧪 Verification

To verify Super Admin was created:

```bash
# Check via API
curl http://localhost:3000/api/setup/super-admin

# Or login via browser
http://localhost:3000/login
```

Response should show:
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
