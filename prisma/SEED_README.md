# Database Seed Guide

This guide explains how to seed your database with comprehensive test data including Indian universities, institutes, faculty members, and students.

## Seed Files

There are two seed files available:

1. **`seed.ts`** - Original minimal seed (Super Admin + Fields only)
2. **`seed-full.ts`** - Comprehensive seed with full data (Recommended)

## What's Included in seed-full.ts

The comprehensive seed file creates:

- ✅ **5 Major Indian Universities:**
  - Indian Institute of Technology Delhi
  - University of Mumbai
  - Anna University
  - Jawaharlal Nehru University
  - University of Calcutta

- ✅ **25 Institutes** (5 per university):
  - Computer Science and Engineering
  - Electronics and Communication
  - Business Administration
  - Applied Sciences
  - Humanities and Social Sciences

- ✅ **25 Departments** (1 per institute)

- ✅ **125 Faculty Members** (5 per institute) with roles:
  - Professor (HOD)
  - Associate Professor
  - Assistant Professor
  - Student Counselor
  - Faculty Mentor

- ✅ **250 Students** (10 per institute)
  - Complete with enrollment IDs, roll numbers
  - Assigned to mentors
  - Realistic Indian names
  - CGPA between 6.0-10.0

## Default Credentials

All users (faculty and students) have the password: **`12345678`**

Super Admin credentials are set via environment variables or defaults to:
- Email: `superadmin@mannmitra.com`
- Password: `SuperAdmin@2024`

## How to Run

### Option 1: Using tsx (Recommended)

```bash
# Install tsx if not already installed
npm install -g tsx

# Run the full seed
npx tsx prisma/seed-full.ts
```

### Option 2: Using ts-node

```bash
# Install ts-node if not already installed
npm install -g ts-node

# Run the full seed
npx ts-node prisma/seed-full.ts
```

### Option 3: Add to package.json

Add this to your `package.json`:

```json
{
  "scripts": {
    "seed": "tsx prisma/seed.ts",
    "seed:full": "tsx prisma/seed-full.ts"
  },
  "prisma": {
    "seed": "tsx prisma/seed-full.ts"
  }
}
```

Then run:

```bash
npm run seed:full
```

### Option 4: Using Prisma's db seed command

```bash
npx prisma db seed
```

## Reset Database and Reseed

If you want to start fresh:

```bash
# Reset the database (WARNING: This will delete all data!)
npx prisma migrate reset

# This will automatically run the seed if configured in package.json
# Otherwise, run manually:
npx tsx prisma/seed-full.ts
```

## Sample Login Credentials

After seeding, you can login with any of these users:

### Faculty Examples:
- `prof.amit.sharma.cse@iitd.ac.in` (Professor)
- `dr.priya.patel.cse@iitd.ac.in` (Associate Professor)
- `ms.anjali.verma.cse@iitd.ac.in` (Counselor)

### Student Examples:
- `aarav.kumar.cse@student.iitd.ac.in`
- `vivaan.sharma.cse@student.iitd.ac.in`
- `diya.reddy.mba@student.mu.ac.in`

**Password for all:** `12345678`

## Checking the Data

After seeding, you can verify the data using Prisma Studio:

```bash
npx prisma studio
```

This will open a web interface at `http://localhost:5555` where you can browse all the seeded data.

## Notes

- The seed script is idempotent - it checks for existing data and won't create duplicates
- All data uses realistic Indian names, addresses, and phone numbers
- Faculty are automatically assigned as HODs for their departments
- Students are randomly assigned to mentors within their institute
- Batches are created with current semester set to 5
- All entities have proper relationships maintained

## Troubleshooting

If you encounter errors:

1. **Unique constraint errors**: The database might already have conflicting data. Consider resetting the database.

2. **Connection errors**: Ensure your `DATABASE_URL` in `.env` is correct and the database is running.

3. **Missing dependencies**: Make sure you have installed all required packages:
   ```bash
   npm install
   ```

4. **TypeScript errors**: Ensure Prisma client is generated:
   ```bash
   npx prisma generate
   ```
