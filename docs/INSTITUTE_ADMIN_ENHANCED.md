# Institute Admin Dashboard - Enhanced Version

## Overview
Enhanced the Institute Admin Dashboard with clickable stat cards and comprehensive table views for admins, students, faculties, and departments.

## New Features Implemented

### 1. Clickable Stats Cards (4 Cards)
All stat cards are now clickable and toggle the display of their respective tables:

#### **Admins Card**
- Icon: UserCog
- Shows: Total number of institute administrators
- Click behavior: Shows/hides the admins table

#### **Departments Card**
- Icon: BookOpen  
- Shows: Total number of academic departments
- Click behavior: Shows/hides the departments table

#### **Faculty Members Card**
- Icon: Users
- Shows: Total number of teaching staff
- Click behavior: Shows/hides the faculties table

#### **Students Card**
- Icon: GraduationCap
- Shows: Total number of enrolled students
- Click behavior: Shows/hides the students table

### 2. Dynamic Table Views
Tables are displayed dynamically based on which card is clicked. Only one table is shown at a time.

## New Components Created

### 1. StudentsTable Component (`/src/components/admin/StudentsTable.tsx`)

**Features:**
- Lists all students in the institute
- Displays: Name, Enrollment ID, Roll Number, Department, Semester, CGPA, Status
- View details modal with complete student information
- Color-coded status badges:
  - Active (Green)
  - Inactive (Gray outline)
  - Suspended (Red)
  - Graduated (Blue)
- Shows mentor information if assigned
- Includes batch information

**Props:**
```typescript
interface StudentsTableProps {
  instituteId?: string; // Filter students by institute
}
```

**Data Displayed:**
- Personal: Name, Email, Phone
- Academic: Enrollment ID, Roll Number, Department, Batch, Semester, CGPA
- Administrative: Status, Mentor (if assigned)

### 2. FacultiesTable Component (`/src/components/admin/FacultiesTable.tsx`)

**Features:**
- Lists all faculty members in the institute
- Displays: Name, Email, Job Title, Department, Type, Experience, Status
- View details modal with complete faculty information
- Color-coded badges:
  - **Status**: Active (Green), Inactive (Gray), On Leave (Yellow), Retired (Gray)
  - **Availability**: Available (Green), Busy (Orange), On Leave (Gray)
  - **Type**: Permanent (Blue), Visiting (Purple), Contractual (Yellow)
- Shows years of experience

**Props:**
```typescript
interface FacultiesTableProps {
  instituteId?: string; // Filter faculties by institute
}
```

**Data Displayed:**
- Personal: Name, Email, Phone
- Professional: Job Title, Department, Years of Experience
- Administrative: Faculty Type, Status, Availability Status

### 3. DepartmentsTable Component (`/src/components/admin/DepartmentsTable.tsx`)

**Features:**
- Lists all departments in the institute
- Displays: Name, Code, HOD, Batches Count, Students Count, Faculties Count
- View details modal with department statistics
- Shows Head of Department (HOD) information
- Displays aggregate counts for batches, students, and faculties

**Props:**
```typescript
interface DepartmentsTableProps {
  instituteId?: string; // Filter departments by institute
}
```

**Data Displayed:**
- Basic: Department Name, Code
- Leadership: Head of Department (HOD) name
- Statistics: Total Batches, Total Students, Total Faculties

## API Endpoints Created

### 1. Students API (`/src/app/api/students/route.ts`)

**Endpoint:** `GET /api/students`

**Query Parameters:**
- `instituteId` (optional): Filter students by institute

**Response:**
```json
{
  "success": true,
  "message": "Students retrieved successfully",
  "data": {
    "students": [
      {
        "id": "uuid",
        "name": "Student Name",
        "email": "student@example.com",
        "enrollmentId": "2024CS001",
        "rollNumber": "CS001",
        "phone": "+1234567890",
        "currentSemester": 3,
        "cgpa": 8.5,
        "status": "ACTIVE",
        "department": {
          "id": "uuid",
          "name": "Computer Science",
          "code": "CS"
        },
        "batch": {
          "id": "uuid",
          "name": "2024-2028"
        },
        "mentor": {
          "id": "uuid",
          "name": "Prof. John Doe"
        }
      }
    ]
  }
}
```

**Features:**
- Authentication required (Admin only)
- Filters by instituteId if provided
- Returns students with department, batch, and mentor relations
- Password hashes excluded from response
- Ordered by creation date (newest first)

### 2. Faculties API (`/src/app/api/faculties/route.ts`)

**Endpoint:** `GET /api/faculties`

**Query Parameters:**
- `instituteId` (optional): Filter faculties by institute

**Response:**
```json
{
  "success": true,
  "message": "Faculties retrieved successfully",
  "data": {
    "faculties": [
      {
        "id": "uuid",
        "name": "Prof. Jane Smith",
        "email": "jane@example.com",
        "phone": "+1234567890",
        "jobTitle": "Associate Professor",
        "facultyType": "PERMANENT",
        "status": "ACTIVE",
        "availabilityStatus": "AVAILABLE",
        "yearsOfExperience": 10,
        "department": {
          "id": "uuid",
          "name": "Computer Science",
          "code": "CS"
        }
      }
    ]
  }
}
```

**Features:**
- Authentication required (Admin only)
- Filters by instituteId if provided
- Returns faculties with department relation
- Password hashes excluded from response
- Ordered by creation date (newest first)

### 3. Departments API (`/src/app/api/departments/route.ts`)

**Endpoint:** `GET /api/departments`

**Query Parameters:**
- `instituteId` (optional): Filter departments by institute

**Response:**
```json
{
  "success": true,
  "message": "Departments retrieved successfully",
  "data": {
    "departments": [
      {
        "id": "uuid",
        "name": "Computer Science",
        "code": "CS",
        "hod": {
          "id": "uuid",
          "name": "Prof. John Doe"
        },
        "_count": {
          "batches": 5,
          "students": 250,
          "faculties": 15
        }
      }
    ]
  }
}
```

**Features:**
- Authentication required (Admin only)
- Filters by instituteId if provided
- Returns departments with HOD relation and aggregate counts
- Ordered by name (alphabetically)
- Includes counts for batches, students, and faculties

## Dashboard State Management

### Active View State
```typescript
const [activeView, setActiveView] = useState<'admins' | 'students' | 'faculties' | 'departments' | null>(null);
```

**Behavior:**
- `null`: No table is displayed (default state)
- `'admins'`: Admins table is displayed
- `'students'`: Students table is displayed
- `'faculties'`: Faculties table is displayed
- `'departments'`: Departments table is displayed

### Stats State
```typescript
interface InstituteStats {
  departments: number;
  faculties: number;
  students: number;
  admins: number; // NEW
}
```

**Loading Logic:**
- Fetches institute data with counts
- Makes parallel API call to get admin count
- Updates all stats at once

## UI/UX Improvements

### 1. Clickable Cards
- Hover effect: Shadow increases on hover (`hover:shadow-lg`)
- Pointer cursor to indicate clickability
- Toggle behavior: Click again to hide the table
- Smooth transitions

### 2. Responsive Design
- Cards arranged in 4 columns on desktop (`md:grid-cols-4`)
- Single column on mobile
- Tables are horizontally scrollable on small screens

### 3. View Details Modal
All tables include a "View Details" button that opens a modal with:
- Complete information about the selected record
- Grid layout for organized data display
- Color-coded badges for status indicators
- Close on outside click or ESC key

### 4. Loading States
- Spinner animation while loading data
- Centered loading indicator
- No flickering or layout shift

### 5. Empty States
- Clear message when no records found
- Centered text with muted color
- Consistent across all tables

## Add Functionality (Coming Soon)

Each table has an "Add" button in the header:

### Current Status:
- **Add Admin**: ✅ Fully functional (opens CreateAdminForm)
- **Add Department**: 🔜 Coming soon (shows toast notification)
- **Add Faculty**: 🔜 Coming soon (shows toast notification)
- **Add Student**: 🔜 Coming soon (shows toast notification)

### Planned Implementation:
1. Create form components for Department, Faculty, and Student
2. Add POST endpoints to respective APIs
3. Implement validation and error handling
4. Add success callbacks to refresh tables

## Files Modified

1. **`/src/components/admin/InstituteAdminDashboard.tsx`**
   - Added `activeView` state management
   - Updated stats interface to include admins count
   - Converted stat cards to clickable cards
   - Added dynamic table rendering based on active view
   - Imported new table components
   - Enhanced data loading with parallel API calls

## Files Created

1. **`/src/components/admin/StudentsTable.tsx`** - Student listing and details
2. **`/src/components/admin/FacultiesTable.tsx`** - Faculty listing and details
3. **`/src/components/admin/DepartmentsTable.tsx`** - Department listing and details
4. **`/src/app/api/students/route.ts`** - Students GET endpoint
5. **`/src/app/api/faculties/route.ts`** - Faculties GET endpoint
6. **`/src/app/api/departments/route.ts`** - Departments GET endpoint

## Testing Checklist

### As Institute Admin:

#### Stats Cards:
- [x] All 4 cards display correct counts
- [x] Cards show hover effect on mouse over
- [x] Cursor changes to pointer on hover

#### Admins Card:
- [x] Click shows admins table filtered to institute
- [x] Click again hides the table
- [x] "Add Admin" button opens CreateAdminForm
- [x] View details button shows admin information

#### Departments Card:
- [x] Click shows departments table filtered to institute
- [x] Table displays department name, code, HOD
- [x] Shows counts for batches, students, faculties
- [x] View details modal shows complete information
- [x] "Add Department" button shows coming soon message

#### Faculties Card:
- [x] Click shows faculties table filtered to institute
- [x] Table displays name, email, job title, department
- [x] Shows faculty type, experience, status badges
- [x] View details modal shows complete information
- [x] "Add Faculty" button shows coming soon message

#### Students Card:
- [x] Click shows students table filtered to institute
- [x] Table displays enrollment ID, roll number, department
- [x] Shows semester, CGPA, status badges
- [x] View details modal shows complete information
- [x] "Add Student" button shows coming soon message

#### General:
- [x] Only one table visible at a time
- [x] Tables load with proper authentication
- [x] Empty states display correctly
- [x] Loading spinners show during data fetch
- [x] View details modals close properly
- [x] Responsive design works on mobile

## Security Features

### API Authorization
- All endpoints require authentication token
- Token verification on every request
- User type must be 'ADMIN'
- Returns 401 for missing token
- Returns 403 for non-admin users

### Data Filtering
- Institute Admins only see data from their institute
- University Admins see data from their university
- Super Admins see all data
- Filters applied at database level
- No cross-institute data leakage

### Password Protection
- Password hashes excluded from all API responses
- Sanitization applied before sending data
- No sensitive information exposed in details modals

## Performance Optimizations

### 1. Parallel API Calls
```typescript
const [instituteResponse, adminsResponse] = await Promise.all([
  fetch(`/api/institutes?universityId=${user?.universityId}`),
  fetch(`/api/admins?instituteId=${user?.instituteId}`)
]);
```

### 2. Efficient Queries
- Uses Prisma `include` for relations (no N+1 queries)
- Filters applied at database level
- Only necessary fields selected
- Ordered results for better UX

### 3. Lazy Loading
- Tables only fetch data when card is clicked
- No unnecessary API calls on initial load
- Data cached in component state

## Future Enhancements

### Short Term:
1. **Create Department Form** - Add new departments to institute
2. **Create Faculty Form** - Onboard new faculty members
3. **Create Student Form** - Enroll new students
4. **Edit Functionality** - Update existing records
5. **Delete Functionality** - Remove records with confirmation

### Medium Term:
1. **Bulk Import** - CSV upload for students and faculties
2. **Export Data** - Download tables as CSV/Excel
3. **Search and Filter** - Advanced filtering within tables
4. **Pagination** - Handle large datasets efficiently
5. **Sorting** - Sort by any column

### Long Term:
1. **Analytics Dashboard** - Charts and graphs for statistics
2. **Activity Logs** - Track all changes made
3. **Email Notifications** - Notify on important actions
4. **Role Assignments** - Assign HODs, mentors
5. **Batch Operations** - Update multiple records at once

## Summary

The Institute Admin Dashboard now provides:
- ✅ **4 Clickable Stat Cards** for Admins, Departments, Faculties, Students
- ✅ **3 New Table Components** with complete CRUD-ready structure
- ✅ **3 New API Endpoints** for fetching filtered data
- ✅ **Dynamic View System** showing one table at a time
- ✅ **View Details Modals** for all record types
- ✅ **Add Buttons** (Admin functional, others coming soon)
- ✅ **Proper Authorization** at API and component level
- ✅ **Loading & Empty States** for better UX
- ✅ **Responsive Design** for all screen sizes
- ✅ **Color-Coded Badges** for visual clarity

The dashboard is now fully functional for viewing and managing institute data, with a clear path for implementing the remaining create/edit/delete operations.
