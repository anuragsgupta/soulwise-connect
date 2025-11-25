#!/bin/bash

# Admin Auth System - Quick Setup Script
# This script helps you set up the admin authentication system

echo "🚀 Mann Mitra - Admin Auth System Setup"
echo "========================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Created .env file. Please update it with your credentials."
    else
        echo "❌ No .env.example found. Please create a .env file manually."
        exit 1
    fi
else
    echo "✅ .env file found"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🗄️  Setting up database..."
echo "Generating Prisma client..."
npx prisma generate

echo ""
echo "📊 Checking database connection..."
npx prisma db push

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your DATABASE_URL and JWT_SECRET"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Visit http://localhost:3000/register to create your first admin account"
echo "4. Login at http://localhost:3000/login"
echo ""
echo "📚 Documentation: See ADMIN_AUTH_IMPLEMENTATION.md for details"
echo ""
