# Database Seed Implementation Summary

## Files Created

### 1. `/prisma/seed-full.ts` - Comprehensive Seed File
A complete database seeding script that creates:
- **5 Indian Universities** with realistic details
- **25 Institutes** (5 per university)
- **25 Departments** (1 per institute)
- **25 Batches** (1 per department)
- **125 Faculty Members** (5 per institute with different roles)
- **250 Students** (10 per institute)

**Total Users Created:** 375 (125 faculty + 250 students) + 1 Super Admin

### 2. `/prisma/SEED_README.md` - Usage Guide
Complete documentation on how to:
- Run the seed scripts
- Understanding what data is created
- Login credentials and examples
- Troubleshooting tips

### 3. `/prisma/SEEDED_DATA_STRUCTURE.md` - Data Structure Reference
Detailed breakdown of:
- All universities and their details
- Institute distribution
- Faculty roles and naming
- Student distribution
- Email formats
- Enrollment ID formats
- Sample test accounts

### 4. `/seed-database.sh` - Quick Run Script
A bash script to easily run the seed with:
- Environment checks
- Prisma client generation
- Seed execution
- Success/failure reporting

## Key Features

### Universities (Realistic Indian Institutions)
1. **IIT Delhi** - iitd.ac.in
2. **University of Mumbai** - mu.ac.in
3. **Anna University** - annauniv.edu
4. **JNU** - jnu.ac.in
5. **University of Calcutta** - caluniv.ac.in

### Institutes per University
1. Computer Science and Engineering (CSE)
2. Electronics and Communication (ECE)
3. Business Administration (MBA)
4. Applied Sciences (SCI)
5. Humanities and Social Sciences (HSS)

### Faculty Roles (5 per Institute)
1. **HOD** - Professor and Head (Department & Institute Head)
2. **FACULTY** - Associate Professor
3. **FACULTY** - Assistant Professor
4. **COUNSELOR** - Student Counselor
5. **MENTOR** - Faculty Mentor

### Student Details
- 10 students per institute
- Current semester: 5
- CGPA: 6.00 to 10.00 (random)
- Assigned to mentors
- Realistic Indian names
- Complete enrollment details

## How to Use

### Quick Start
```bash
# Make the script executable (already done)
chmod +x seed-database.sh

# Run the seed
./seed-database.sh
```

### Manual Execution
```bash
# Generate Prisma Client
npx prisma generate

# Run the seed
npx tsx prisma/seed-full.ts
```

### Using npm scripts (Add to package.json)
```json
{
  "scripts": {
    "seed:full": "tsx prisma/seed-full.ts"
  }
}
```

Then run:
```bash
npm run seed:full
```

## Default Credentials

### Super Admin
- Email: `superadmin@mannmitra.com`
- Password: `SuperAdmin@2024` (or from env)

### All Faculty & Students
- Password: `12345678`

## Sample Login Accounts

### Faculty Examples
```
prof.amit.sharma.cse@iitd.ac.in (HOD)
dr.priya.patel.cse@iitd.ac.in (Faculty)
ms.sneha.singh.cse@iitd.ac.in (Counselor)
mr.vikram.reddy.cse@iitd.ac.in (Mentor)
```

### Student Examples
```
aarav.kumar.cse@student.iitd.ac.in
vivaan.sharma.ece@student.mu.ac.in
diya.reddy.mba@student.annauniv.edu
```

## Data Statistics

| Entity | Count |
|--------|-------|
| Universities | 5 |
| Institutes | 25 |
| Departments | 25 |
| Batches | 25 |
| Faculty | 125 |
| Students | 250 |
| Fields | 6 |
| **Total Users** | **376** |

## Email Format Conventions

### Faculty
```
{firstname}.{lastname}.{institute_code}@{university_domain}
Example: amit.sharma.cse@iitd.ac.in
```

### Students
```
{firstname}.{lastname}.{institute_code}@student.{university_domain}
Example: aarav.kumar.cse@student.iitd.ac.in
```

## Important Notes

1. **Idempotent**: The seed script checks for existing data and won't create duplicates
2. **Relationships**: All foreign key relationships are properly maintained
3. **Indian Context**: All data (names, universities, locations) are India-specific
4. **Realistic Data**: Phone numbers, addresses, and other details are realistic
5. **HOD Assignment**: First faculty member is automatically set as HOD

## Verification

After seeding, verify the data using Prisma Studio:
```bash
npx prisma studio
```

This opens a web interface at `http://localhost:5555` to browse the data.

## Reset and Reseed

To start fresh:
```bash
# WARNING: This deletes all data!
npx prisma migrate reset

# Then reseed
npx tsx prisma/seed-full.ts
```

## Troubleshooting

### Common Issues

1. **"tsx not found"**
   ```bash
   npm install -g tsx
   ```

2. **Database connection error**
   - Check your `.env` file has correct `DATABASE_URL`
   - Ensure database is running

3. **Unique constraint violation**
   - Data might already exist
   - Consider resetting the database

4. **Prisma Client not found**
   ```bash
   npx prisma generate
   ```

## Next Steps

After seeding:
1. Start your development server: `npm run dev`
2. Login with any seeded account
3. Explore the data in Prisma Studio: `npx prisma studio`
4. Test various features with different user roles

## Files Location

```
/prisma/
  ├── seed.ts                      # Original minimal seed
  ├── seed-full.ts                 # Comprehensive seed (NEW)
  ├── SEED_README.md              # Usage guide (NEW)
  └── SEEDED_DATA_STRUCTURE.md    # Data reference (NEW)

/seed-database.sh                  # Quick run script (NEW)
```

---

**Created:** December 8, 2025
**All users password:** 12345678
**Total test accounts:** 376 (1 Super Admin + 125 Faculty + 250 Students)
