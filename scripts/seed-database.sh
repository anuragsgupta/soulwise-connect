#!/bin/bash

# Database Seed Script
# Run this script to seed the database with comprehensive test data

echo "🌱 Starting database seed process..."
echo ""

# Check if tsx is installed
if ! command -v tsx &> /dev/null; then
    echo "📦 tsx not found. Installing..."
    npm install -g tsx
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "Please create a .env file with DATABASE_URL before running the seed."
    exit 1
fi

# Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL" .env; then
    echo "⚠️  Warning: DATABASE_URL not found in .env file!"
    echo "Please add DATABASE_URL to your .env file."
    exit 1
fi

echo "✅ Environment configured"
echo ""

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

echo ""
echo "🚀 Running comprehensive seed..."
echo ""

# Run the seed
npx tsx prisma/seed-full.ts

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Seed completed successfully!"
    echo ""
    echo "You can now:"
    echo "  1. Start your app: npm run dev"
    echo "  2. View data: npx prisma studio"
    echo "  3. Login with password: 12345678"
else
    echo ""
    echo "❌ Seed failed. Check the error messages above."
    exit 1
fi
