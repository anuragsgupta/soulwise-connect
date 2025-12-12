# Institute Admin Dashboard Implementation

## Overview
Implemented a comprehensive Institute Admin Dashboard that allows Institute Admins to view their institute information and create new admins for their own institute only.

## Features Implemented

### 1. Institute Admin Dashboard (`InstituteAdminDashboard.tsx`)
- **Institute Information Card**: Displays institute details (name, code, email, phone, address)
- **Statistics Cards**: Shows counts for departments, faculties, and students
- **Admin Management Section**: 
  - View all admins for the institute
  - Add new admins with a single click
  - Uses `AdminsTable` component with instituteId filtering

### 2. Authorization System Updates

#### API Authorization (`/api/auth/register/route.ts`)
Updated to allow Institute Admins to create admins with the following rules:

**Super Admin**:
- ✅ Can create UNIVERSITY_ADMIN for any university
- ✅ Can create INSTITUTE_ADMIN for any institute

**University Admin**:
- ✅ Can create INSTITUTE_ADMIN for institutes in their own university
- ❌ Cannot create UNIVERSITY_ADMIN
- ❌ Cannot create admins for other universities

**Institute Admin**:
- ✅ Can create INSTITUTE_ADMIN for their own institute only
- ❌ Cannot create UNIVERSITY_ADMIN
- ❌ Cannot create admins for other institutes
- ❌ Cannot create admins for other universities

Authorization checks:
```typescript
if (decoded.adminType === 'INSTITUTE_ADMIN') {
  // Institute admins can only create admins for their own institute
  if (!instituteId || instituteId !== decoded.instituteId) {
    return 403; // Forbidden
  }
  
  // Institute admin cannot create university admins, only institute admins
  if (adminType === 'UNIVERSITY_ADMIN') {
    return 403; // Forbidden
  }
  
  // Ensure universityId matches their institute's university
  if (universityId !== decoded.universityId) {
    return 403; // Forbidden
  }
}
```

### 3. Admin Filtering (`/api/admins/route.ts`)
Enhanced the admins API to support filtering by:
- `universityId`: Returns all admins for a university (excludes super admins)
- `instituteId`: Returns all admins for an institute (excludes super admins)

### 4. AdminsTable Component
Updated to accept `instituteId` prop:
```typescript
interface AdminsTableProps {
  universityId?: string;
  instituteId?: string; // NEW
}
```

The table now supports three filtering modes:
1. No filter: Shows all admins (Super Admin view)
2. University filter: Shows admins for a specific university
3. Institute filter: Shows admins for a specific institute

### 5. CreateAdminForm Updates
Enhanced the form to work seamlessly for Institute Admins:

**For Institute Admins**:
- Admin Type field is hidden (automatically set to INSTITUTE_ADMIN)
- Institute field is pre-selected and disabled (locked to their institute)
- Only need to fill in name, email, password, phone, and address

**For University Admins**:
- Admin Type field is visible but disabled (can only create INSTITUTE_ADMIN)
- Institute field is enabled (can select any institute in their university)

**For Super Admins**:
- Admin Type field shows both UNIVERSITY_ADMIN and INSTITUTE_ADMIN options
- Institute field is enabled when INSTITUTE_ADMIN is selected

## UI Flow for Institute Admins

1. **Login** as Institute Admin
2. **View Dashboard** showing:
   - Institute information card
   - Department, faculty, and student statistics
   - Admin Management section with list of current admins
3. **Click "Add Admin"** button
4. **Fill the form**:
   - Name (required)
   - Email (required, validated)
   - Password (required, min 8 chars)
   - Phone (required)
   - Address (required)
   - Admin Type: Hidden (auto-set to Institute Admin)
   - Institute: Pre-selected and disabled (their institute)
5. **Submit** to create the new admin
6. **View updated** admins table with the new admin

## Security Features

### Authorization Layers
1. **API Token Verification**: All requests require valid JWT token
2. **User Type Check**: Only ADMIN type users can access admin APIs
3. **Role-Based Access**: Specific checks for Super/University/Institute admin roles
4. **Ownership Validation**: Institute admins can only create for their own institute
5. **University Association**: Validates institute belongs to the correct university

### Data Filtering
- Super admins are excluded from university and institute-filtered views
- Each admin type only sees data relevant to their scope
- No cross-institute or cross-university data leakage

## Database Operations

### Creating an Institute Admin
```typescript
await prisma.admin.create({
  data: {
    email: 'admin@institute.edu',
    passwordHash: hashedPassword,
    name: 'Institute Admin',
    phone: '+1234567890',
    address: '123 Main St',
    adminType: 'INSTITUTE_ADMIN',
    universityId: 'university-id',
    instituteId: 'institute-id',
    status: 'ACTIVE',
    isSuperAdmin: false,
  },
});
```

### Querying Institute Admins
```typescript
await prisma.admin.findMany({
  where: {
    instituteId: 'institute-id',
    isSuperAdmin: false,
  },
  include: {
    university: true,
    institute: true,
  },
});
```

## Testing Checklist

### As Institute Admin:
- [x] Login and see institute dashboard
- [x] View institute information card
- [x] See department, faculty, student statistics
- [x] View admins table filtered to my institute
- [x] Click "Add Admin" button
- [x] See pre-filled institute (disabled)
- [x] Admin type hidden (auto-set)
- [x] Fill form and submit successfully
- [x] See new admin in the admins table
- [x] Try to create admin for different institute (should fail via API)

### As University Admin:
- [x] Can still create Institute Admins for any institute in their university
- [x] Can select from dropdown of institutes
- [x] Admin type is disabled (can only create Institute Admin)

### As Super Admin:
- [x] Can create University Admins and Institute Admins
- [x] Can select any institute from any university
- [x] Both admin type options are available

## Files Modified

1. `/src/components/admin/InstituteAdminDashboard.tsx` - Complete redesign with admin management
2. `/src/app/api/auth/register/route.ts` - Added Institute Admin authorization
3. `/src/app/api/admins/route.ts` - Added instituteId filter support
4. `/src/components/admin/AdminsTable.tsx` - Added instituteId prop and filtering
5. `/src/components/admin/CreateAdminForm.tsx` - Enhanced for Institute Admin workflow

## Error Handling

### Form Validation
- Name: Required, non-empty
- Email: Required, valid format
- Password: Required, minimum 8 characters
- Phone: Required
- Address: Required
- Institute: Required for Institute Admin (auto-filled for Institute Admins)

### API Error Responses
- 401: Unauthorized (missing/invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found (university/institute doesn't exist)
- 409: Conflict (email already exists)
- 500: Internal Server Error

## Future Enhancements

1. **Email Verification**: Send verification email to newly created admins
2. **Password Reset**: Allow admins to reset their passwords
3. **Role Transfer**: Transfer Institute Admin role between admins
4. **Activity Logs**: Track admin creation and modifications
5. **Bulk Import**: Import multiple admins from CSV
6. **Status Management**: Enable/disable admin accounts
7. **Permission Levels**: Fine-grained permissions within Institute Admin role

## Summary

The Institute Admin Dashboard is now fully functional with:
- ✅ Role-based access control
- ✅ Institute-scoped data visibility
- ✅ Admin creation with automatic validation
- ✅ Secure API endpoints with authorization
- ✅ User-friendly form with smart defaults
- ✅ Complete error handling and validation

Institute Admins can now effectively manage administrators for their specific institute without access to other institutes or universities, maintaining proper data isolation and security.
