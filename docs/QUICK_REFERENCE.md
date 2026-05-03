# Quick Reference Card - Admin Auth System

## Super Admin Credentials
```
Email:    superadmin@soulwise.connect
Password: SuperAdmin@2024
```
⚠️ Change after first login!

## Common Commands

### Database
```bash
npx prisma generate              # Generate Prisma client
npx prisma db push               # Apply schema changes
npx prisma db seed               # Create super admin
npx prisma studio                # Open database GUI
```

### Development
```bash
npm run dev                      # Start dev server (localhost:3000)
npm run build                    # Build for production
npm run start                    # Start production server
```

### Testing
```bash
node test-super-admin-login.js   # Test super admin login
```

## API Quick Reference

### Login (POST /api/auth/login)
```javascript
// Admin/Faculty login
{ "email": "user@example.com", "password": "pass123" }

// Student login
{ "rollNumber": "2024CS001", "password": "pass123" }
```

### Register Admin (POST /api/auth/register)
```javascript
// Headers: Authorization: Bearer <super_admin_token>
{
  "email": "admin@uni.edu",
  "password": "SecurePass123",
  "name": "Admin Name",
  "adminType": "UNIVERSITY_ADMIN",  // or INSTITUTE_ADMIN
  "universityId": "uuid",
  "instituteId": "uuid"  // Required for INSTITUTE_ADMIN
}
```

## Admin Types & Permissions

| Admin Type | Can Create | Can Access |
|------------|-----------|------------|
| SUPER_ADMIN | Universities, All Admins | Everything |
| UNIVERSITY_ADMIN | Institutes, Institute Admins | Own university only |
| INSTITUTE_ADMIN | Departments, Faculty, Students | Own institute only |

## Database Tables (15 Models)

### Identity
- admins
- faculties
- students

### Organization
- universities
- fields
- institutes
- departments
- batches

### Mental Health
- locations
- mood_check_ins
- crisis_alerts
- chat_sessions
- chat_messages

### System
- invites (ready for implementation)
- audit_logs

## Key Features

✅ Super admin cannot be deleted (`isSuperAdmin: true`)  
✅ Hierarchical access control  
✅ JWT tokens (7-day expiry)  
✅ Password hashing (bcrypt, 12 rounds)  
✅ Complete audit trail  
✅ Mental health features integrated  

## Important Files

- `/prisma/schema.prisma` - Database schema
- `/prisma/seed.ts` - Creates super admin
- `/src/app/api/auth/login/route.ts` - Login endpoint
- `/src/app/api/auth/register/route.ts` - Register endpoint
- `/src/lib/auth.ts` - Auth utilities

## Troubleshooting

**TypeScript errors?**
- Restart TS server (Cmd/Ctrl+Shift+P → "TypeScript: Restart TS Server")

**Login not working?**
- Check `npx prisma studio` → admins table
- Verify JWT_SECRET in .env

**Schema changes not applying?**
```bash
npx prisma db push --force-reset  # ⚠️ Deletes all data!
npx prisma db seed
```

## Documentation
- `ADMIN_AUTH_IMPLEMENTATION.md` - Full implementation guide
- `SCHEMA_MIGRATION_COMPLETE.md` - Migration details
- `README.md` - Project overview

## Next Steps
1. Login as super admin
2. Create first university
3. Register university admin
4. Build management dashboards
5. Implement invitation system
