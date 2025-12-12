# Quick Commands - Database Seeding

## 🚀 Run the Seed

### Method 1: Using the shell script (Recommended)
```bash
./seed-database.sh
```

### Method 2: Direct execution
```bash
npx tsx prisma/seed-full.ts
```

### Method 3: Using ts-node
```bash
npx ts-node prisma/seed-full.ts
```

---

## 🔄 Reset and Reseed

### Complete reset (DANGER: Deletes all data!)
```bash
npx prisma migrate reset
```

### Then reseed
```bash
npx tsx prisma/seed-full.ts
```

---

## 🔍 View the Data

### Open Prisma Studio (Database GUI)
```bash
npx prisma studio
```
Opens at: http://localhost:5555

---

## 🛠️ Setup Commands

### Generate Prisma Client
```bash
npx prisma generate
```

### Create a new migration
```bash
npx prisma migrate dev --name your_migration_name
```

### Apply migrations to production
```bash
npx prisma migrate deploy
```

---

## 📦 Installation

### Install tsx globally
```bash
npm install -g tsx
```

### Install project dependencies
```bash
npm install
```

---

## 🔑 Quick Test Logins

### Super Admin
```
Email: superadmin@mannmitra.com
Password: SuperAdmin@2024
```

### Any Faculty/Student
```
Email: [see TEST_ACCOUNTS.md]
Password: 12345678
```

---

## 📊 Check Data Counts

### Using Prisma Studio
1. Run: `npx prisma studio`
2. Browse each table to see counts

### Using SQL (if using PostgreSQL)
```bash
# Connect to your database
psql $DATABASE_URL

# Run these queries:
SELECT COUNT(*) as universities FROM universities;
SELECT COUNT(*) as institutes FROM institutes;
SELECT COUNT(*) as faculty FROM faculty;
SELECT COUNT(*) as students FROM students;
```

---

## 🐛 Troubleshooting

### Issue: "tsx not found"
```bash
npm install -g tsx
```

### Issue: "Cannot find module '@prisma/client'"
```bash
npx prisma generate
```

### Issue: "DATABASE_URL not found"
```bash
# Create/update .env file with:
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

### Issue: "Unique constraint failed"
```bash
# Data already exists, either:
# 1. Skip (seed script handles duplicates)
# 2. Or reset:
npx prisma migrate reset
npx tsx prisma/seed-full.ts
```

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `prisma/seed-full.ts` | Main seed script |
| `prisma/SEED_README.md` | Complete documentation |
| `prisma/SEEDED_DATA_STRUCTURE.md` | Data structure details |
| `TEST_ACCOUNTS.md` | Quick login reference |
| `SEED_DATA_DIAGRAM.md` | Visual relationships |
| `DATABASE_SEED_SUMMARY.md` | Implementation summary |
| `seed-database.sh` | Quick run script |

---

## 🎯 Common Workflows

### First Time Setup
```bash
# 1. Install dependencies
npm install

# 2. Setup database
npx prisma migrate deploy

# 3. Generate client
npx prisma generate

# 4. Run seed
npx tsx prisma/seed-full.ts

# 5. Start app
npm run dev
```

### Development Workflow
```bash
# Make schema changes
nano prisma/schema.prisma

# Create migration
npx prisma migrate dev --name my_change

# Seed will run automatically if configured
# Or run manually:
npx tsx prisma/seed-full.ts
```

### Testing Workflow
```bash
# Reset everything
npx prisma migrate reset

# Seed test data
npx tsx prisma/seed-full.ts

# View in studio
npx prisma studio

# Start app
npm run dev
```

---

## 📝 Notes

- All passwords: `12345678`
- Total test accounts: 376
- Seed is idempotent (safe to run multiple times)
- Checks for existing data before creating

---

## 🔗 Quick Links

- Prisma Studio: http://localhost:5555 (after running `npx prisma studio`)
- App (dev): http://localhost:3000 (after running `npm run dev`)

---

**Created:** December 8, 2025
**Last Updated:** December 8, 2025
