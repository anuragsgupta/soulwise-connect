# Department Code Update - Migration Guide

## What Changed

Previously, department codes were **globally unique** across the entire system. Now, department codes are **unique per institute**, allowing different institutes within the same university to have departments with the same code.

## Examples

### ✅ Now Allowed:
- **Lakshmi Narain College of Technology** can have department code "CSE"
- **Bansal Institute of Technology** can have department code "CSE"
- Both are in the same university but different institutes

### ❌ Still Prevented:
- **Lakshmi Narain College of Technology** cannot have TWO departments with code "CSE"
- Duplicate codes within the same institute are still blocked

## Changes Made

### 1. Database Schema (`prisma/schema.prisma`)
```prisma
model Department {
  code      String   // Removed @unique
  // ... other fields
  
  @@unique([code, instituteId])  // Added composite unique constraint
}
```

### 2. API Endpoint (`/api/departments/route.ts`)
Updated the uniqueness check to scope by institute:
```typescript
const existingDepartment = await prisma.department.findUnique({
  where: { 
    code_instituteId: {
      code,
      instituteId
    }
  },
});
```

## Migration Steps

### Option 1: Using Prisma (Recommended)
```bash
# Generate and apply migration
npx prisma migrate dev --name allow_same_dept_code_per_institute

# Or if in production
npx prisma migrate deploy
```

### Option 2: Manual SQL (If needed)
```bash
# Connect to your database and run:
psql -U your_username -d your_database -f migrate-department-constraint.sql
```

## Verification

After migration, test by:

1. **Create department in Institute A**
   - Code: "CSE"
   - Name: "Computer Science & Engineering"
   - Should succeed ✅

2. **Create department in Institute B (same university)**
   - Code: "CSE"
   - Name: "Computer Science & Engineering"
   - Should succeed ✅ (Previously would fail ❌)

3. **Try to create duplicate in Institute A**
   - Code: "CSE"
   - Name: "Computer Science"
   - Should fail ❌ with error: "Department with this code already exists in this institute"

## Error Messages

- **Before**: "Department with this code already exists"
- **After**: "Department with this code already exists in this institute"

The updated error message clarifies that the duplicate is within the same institute.

## Rollback (If Needed)

If you need to rollback this change:

```sql
-- Remove composite constraint
ALTER TABLE departments DROP CONSTRAINT IF EXISTS departments_code_institute_id_key;

-- Add back global unique constraint
ALTER TABLE departments ADD CONSTRAINT departments_code_key UNIQUE (code);
```

Note: This will fail if you have duplicate codes across institutes.
