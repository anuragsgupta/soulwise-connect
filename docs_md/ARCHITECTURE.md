# Admin Authentication System - Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT SIDE                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐ │
│  │   Register   │      │    Login     │      │   Dashboard  │ │
│  │    Page      │      │     Page     │      │     Page     │ │
│  │ /register    │      │   /login     │      │  /dashboard  │ │
│  └──────┬───────┘      └──────┬───────┘      └──────┬───────┘ │
│         │                     │                      │          │
│         └─────────────────────┴──────────────────────┘          │
│                              │                                   │
│                    ┌─────────▼──────────┐                       │
│                    │   AuthContext      │                       │
│                    │  (State Manager)   │                       │
│                    │  - login()         │                       │
│                    │  - register()      │                       │
│                    │  - logout()        │                       │
│                    │  - user state      │                       │
│                    │  - token storage   │                       │
│                    └─────────┬──────────┘                       │
│                              │                                   │
└──────────────────────────────┼───────────────────────────────────┘
                               │
                         HTTP Requests
                               │
┌──────────────────────────────▼───────────────────────────────────┐
│                       MIDDLEWARE LAYER                            │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Route Protection Middleware                   │ │
│  │  - Verify JWT tokens                                       │ │
│  │  - Check user roles                                        │ │
│  │  - Redirect unauthorized users                            │ │
│  │  - Add user info to request headers                       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
└──────────────────────────────┬───────────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────────┐
│                         API ROUTES                                │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────┐  ┌────────────────────┐                │
│  │ /api/auth/register │  │  /api/auth/login   │                │
│  ├────────────────────┤  ├────────────────────┤                │
│  │ - Validate input   │  │ - Verify password  │                │
│  │ - Hash password    │  │ - Generate JWT     │                │
│  │ - Create user      │  │ - Return token     │                │
│  │ - Return success   │  │ - Audit log        │                │
│  └─────────┬──────────┘  └─────────┬──────────┘                │
│            │                       │                             │
│  ┌─────────▼───────────────────────▼──────────┐                │
│  │        /api/universities                    │                │
│  ├─────────────────────────────────────────────┤                │
│  │ GET  - List universities                    │                │
│  │ POST - Create university                    │                │
│  └─────────┬───────────────────────────────────┘                │
│            │                                                     │
│  ┌─────────▼───────────────────────┐                           │
│  │    /api/institutes              │                           │
│  ├─────────────────────────────────┤                           │
│  │ GET  - List institutes          │                           │
│  │ POST - Create institute         │                           │
│  └─────────┬───────────────────────┘                           │
│            │                                                     │
└────────────┼─────────────────────────────────────────────────────┘
             │
┌────────────▼─────────────────────────────────────────────────────┐
│                      AUTH UTILITIES                               │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────┐  ┌─────────────────────┐              │
│  │  hashPassword()     │  │  verifyPassword()   │              │
│  └─────────────────────┘  └─────────────────────┘              │
│                                                                   │
│  ┌─────────────────────┐  ┌─────────────────────┐              │
│  │  generateToken()    │  │  verifyToken()      │              │
│  └─────────────────────┘  └─────────────────────┘              │
│                                                                   │
│  ┌──────────────────────────────────────────────┐               │
│  │  createResponse()  - Standard API responses  │               │
│  └──────────────────────────────────────────────┘               │
│                                                                   │
└────────────┬──────────────────────────────────────────────────────┘
             │
┌────────────▼─────────────────────────────────────────────────────┐
│                       DATABASE LAYER                              │
├───────────────────────────────────────────────────────────────────┤
│                        Prisma ORM                                 │
│                            │                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │   User   │  │University│  │Institute │  │ Student  │        │
│  │  Table   │  │  Table   │  │  Table   │  │  Table   │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
│                                                                   │
│  ┌──────────────────────────────────────────────────────┐       │
│  │              AuditLog Table                          │       │
│  │  - Tracks all authentication events                 │       │
│  │  - Logs user actions                                │       │
│  │  - Timestamp tracking                               │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                   │
└────────────┬──────────────────────────────────────────────────────┘
             │
┌────────────▼─────────────────────────────────────────────────────┐
│                    PostgreSQL Database                            │
└───────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### Registration Flow

```
User (Browser)
    │
    ├─► Fill Registration Form
    │   (AdminRegistrationForm.tsx)
    │
    ├─► Select Role
    │   - SUPER_ADMIN
    │   - UNIVERSITY_ADMIN
    │   - INSTITUTE_ADMIN
    │   - FACULTY
    │
    ├─► Submit Form
    │
    ▼
AuthContext.register()
    │
    ├─► POST /api/auth/register
    │
    ▼
API Route Handler
    │
    ├─► Validate Input
    │   - Email format
    │   - Password strength
    │   - Role validity
    │
    ├─► Check Existing User
    │   - Query database
    │   - Prevent duplicates
    │
    ├─► Hash Password
    │   - bcrypt (12 rounds)
    │
    ├─► Create User Record
    │   - Insert into database
    │   - Associate with Uni/Inst
    │
    ├─► Log Audit Event
    │   - Track registration
    │
    └─► Return Success
        │
        ▼
    Redirect to Login
```

### Login Flow

```
User (Browser)
    │
    ├─► Enter Credentials
    │   - Email/Roll Number
    │   - Password
    │
    ├─► Submit Login
    │
    ▼
AuthContext.login()
    │
    ├─► POST /api/auth/login
    │
    ▼
API Route Handler
    │
    ├─► Find User
    │   - By email or roll number
    │
    ├─► Verify Password
    │   - bcrypt.compare()
    │
    ├─► Check User Status
    │   - isActive = true
    │
    ├─► Generate JWT Token
    │   - Sign with secret
    │   - 7-day expiry
    │
    ├─► Log Audit Event
    │   - Track login
    │
    └─► Return Token + User
        │
        ▼
    Store in localStorage
        │
        ├─► auth-token
        └─► auth-user
            │
            ▼
    Redirect to Dashboard
        │
        ▼
    Middleware Verification
        │
        ├─► Verify JWT
        ├─► Check Role
        └─► Allow/Deny Access
```

### Dashboard Access Flow

```
User Request
    │
    ├─► Navigate to /dashboard
    │
    ▼
Middleware
    │
    ├─► Check Token
    │   - From cookie/header
    │
    ├─► Verify Token
    │   - JWT verification
    │   - Check expiry
    │
    ├─► Extract User Info
    │   - id, email, role
    │
    ├─► Add to Headers
    │   - x-user-id
    │   - x-user-email
    │   - x-user-role
    │
    └─► Allow/Deny
        │
        ├─► ✅ Valid Token
        │   └─► Continue to Dashboard
        │       │
        │       ├─► Load User Data
        │       ├─► Check Role
        │       │   - SUPER_ADMIN → SuperAdminDashboard
        │       │   - UNIVERSITY_ADMIN → UniversityAdminDashboard
        │       │   - INSTITUTE_ADMIN → InstituteAdminDashboard
        │       │   - FACULTY → FacultyDashboard
        │       │   - STUDENT → StudentDashboard
        │       │
        │       └─► Render Dashboard
        │
        └─► ❌ Invalid Token
            └─► Redirect to /login
```

## Component Hierarchy

```
App Layout
│
├─── AuthProvider (Context)
│    │
│    ├─── /register
│    │    └─── AdminRegistrationForm
│    │         ├─── Role Selection
│    │         ├─── University Selection (conditional)
│    │         ├─── Institute Selection (conditional)
│    │         └─── Submit Handler
│    │
│    ├─── /login
│    │    └─── LoginPage
│    │         ├─── Admin Tab
│    │         │    └─── Email/Password Form
│    │         └─── Student Tab
│    │              └─── Roll Number/Password Form
│    │
│    └─── /dashboard
│         └─── Dashboard Router
│              ├─── SuperAdminDashboard
│              │    ├─── University List
│              │    ├─── Create University
│              │    └─── System Stats
│              │
│              ├─── UniversityAdminDashboard
│              │    ├─── Institute List
│              │    └─── Invite Admins
│              │
│              ├─── InstituteAdminDashboard
│              │    ├─── Student Management
│              │    └─── Faculty Management
│              │
│              ├─── FacultyDashboard
│              │    ├─── Course List
│              │    └─── Student Roster
│              │
│              └─── StudentDashboard
│                   ├─── Course Enrollment
│                   └─── Resources
```

## Role Permission Matrix

```
┌──────────────────┬──────┬──────────┬──────────┬─────────┬─────────┐
│     Action       │Super │University│Institute │ Faculty │ Student │
│                  │Admin │  Admin   │  Admin   │         │         │
├──────────────────┼──────┼──────────┼──────────┼─────────┼─────────┤
│Create University │  ✅  │    ❌    │    ❌    │   ❌    │   ❌    │
│Manage University │  ✅  │    ✅    │    ❌    │   ❌    │   ❌    │
│Create Institute  │  ✅  │    ✅    │    ❌    │   ❌    │   ❌    │
│Manage Institute  │  ✅  │    ✅    │    ✅    │   ❌    │   ❌    │
│Add Students      │  ✅  │    ✅    │    ✅    │   ❌    │   ❌    │
│View Students     │  ✅  │    ✅    │    ✅    │   ✅    │   ❌    │
│Add Faculty       │  ✅  │    ✅    │    ✅    │   ❌    │   ❌    │
│Manage Courses    │  ✅  │    ✅    │    ✅    │   ✅    │   ❌    │
│Grade Students    │  ✅  │    ❌    │    ❌    │   ✅    │   ❌    │
│View Grades       │  ✅  │    ✅    │    ✅    │   ✅    │   ✅    │
│System Settings   │  ✅  │    ❌    │    ❌    │   ❌    │   ❌    │
└──────────────────┴──────┴──────────┴──────────┴─────────┴─────────┘
```

## Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layer 1                          │
│                  Input Validation                            │
│  - Email format                                              │
│  - Password strength                                         │
│  - Role validation                                           │
│  - SQL injection prevention                                  │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    Security Layer 2                          │
│                 Authentication                               │
│  - Password hashing (bcrypt)                                │
│  - JWT token generation                                     │
│  - Token expiration (7 days)                                │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    Security Layer 3                          │
│                  Authorization                               │
│  - Middleware token verification                            │
│  - Role-based access control                                │
│  - Route protection                                         │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    Security Layer 4                          │
│                   Audit Logging                              │
│  - Track all auth events                                    │
│  - Record user actions                                      │
│  - Timestamp tracking                                       │
│  - IP logging (future)                                      │
└─────────────────────────────────────────────────────────────┘
```

---

**Architecture Version:** 1.0  
**Last Updated:** November 25, 2025  
**Status:** Production Ready
