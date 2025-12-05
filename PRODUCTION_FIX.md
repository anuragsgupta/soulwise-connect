# 🔧 Production 401 Error Fix

## Root Cause
The `DATABASE_URL` contains a password with special character `@` that breaks URL parsing.

**Current (Broken):**
```
DATABASE_URL="postgresql://postgres.mqnibarfktnjncodliba:Super@Admin9211@aws-..."
                                                           ↑ This @ breaks parsing
```

## Solution: URL-Encode the Password

Replace `@` with `%40` in the password portion:

### ✅ Fixed DATABASE_URL for Netlify

```bash
DATABASE_URL="postgresql://postgres.mqnibarfktnjncodliba:Super%40Admin9211@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

## 📝 Steps to Fix on Netlify:

1. **Go to Netlify Dashboard:**
   - Navigate to: https://app.netlify.com/sites/project-soulwise/configuration/env

2. **Edit DATABASE_URL:**
   - Find the `DATABASE_URL` variable
   - Click "Edit"
   - Replace the value with:
     ```
     postgresql://postgres.mqnibarfktnjncodliba:Super%40Admin9211@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
     ```
   
3. **Save and Redeploy:**
   - Click "Save"
   - Trigger a new deployment or it will auto-deploy on next commit

## 🧪 Test After Fix:

```bash
# Test login endpoint
curl 'https://project-soulwise.netlify.app/api/auth/login' \
  -H 'content-type: application/json' \
  --data-raw '{"password":"12345678","enrollmentId":"0103CS243D07"}'
```

Expected response: `200 OK` with token

## 📋 Common URL Encoding for Database Passwords:

| Character | Encoded |
|-----------|---------|
| `@`       | `%40`   |
| `:`       | `%3A`   |
| `/`       | `%2F`   |
| `?`       | `%3F`   |
| `#`       | `%23`   |
| `&`       | `%26`   |
| `=`       | `%3D`   |
| `+`       | `%2B`   |
| ` ` (space) | `%20` |

## ✅ Local Fix Applied
Your local `.env.local` has been updated with the encoded password.
Restart your dev server to test:

```bash
./clean-dev.sh
```
