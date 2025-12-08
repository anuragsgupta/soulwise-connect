#!/bin/bash

echo "🔧 Setting up local PostgreSQL database..."
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed."
    echo ""
    echo "Install PostgreSQL:"
    echo "  Ubuntu/Debian: sudo apt install postgresql postgresql-contrib"
    echo "  Fedora: sudo dnf install postgresql postgresql-server"
    echo "  Arch: sudo pacman -S postgresql"
    echo "  macOS: brew install postgresql"
    exit 1
fi

echo "✅ PostgreSQL is installed"
echo ""

# Database configuration
DB_NAME="soulwise_connect"
DB_USER="soulwise_user"
DB_PASSWORD="soulwise_password"
DB_HOST="localhost"
DB_PORT="5432"

echo "Creating local database..."
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo ""

# Check if PostgreSQL is running
if ! sudo systemctl is-active --quiet postgresql; then
    echo "Starting PostgreSQL service..."
    sudo systemctl start postgresql
fi

# Create database and user
sudo -u postgres psql <<EOF
-- Drop existing if needed
DROP DATABASE IF EXISTS $DB_NAME;
DROP USER IF EXISTS $DB_USER;

-- Create new user
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';

-- Create database
CREATE DATABASE $DB_NAME OWNER $DB_USER;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;

\c $DB_NAME

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO $DB_USER;

\q
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database created successfully!"
    echo ""
    echo "📝 Update your .env file with:"
    echo ""
    echo "DATABASE_URL=\"postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME\""
    echo "DIRECT_URL=\"postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME\""
    echo ""
    echo "Next steps:"
    echo "1. Update .env file with the connection strings above"
    echo "2. Run: npx prisma migrate deploy"
    echo "3. Run: npx tsx prisma/seed-full.ts"
else
    echo ""
    echo "❌ Failed to create database"
    echo ""
    echo "Try manually:"
    echo "sudo -u postgres psql"
    echo "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
    echo "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
fi
