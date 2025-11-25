# 🎯 Quick Start Commands

Quick reference for common commands when working with the admin auth system.

## 🚀 Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## 🗄️ Database Commands

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Open Prisma Studio (Database GUI)
npx prisma studio

# Reset database (⚠️ Deletes all data)
npx prisma db push --force-reset

# Create a migration
npx prisma migrate dev --name your_migration_name

# Run migrations
npx prisma migrate deploy

# View database schema
npx prisma db pull
```

## 🔧 Setup Commands

```bash
# Install dependencies
npm install

# Run setup script
./setup-admin-auth.sh

# Create .env from example
cp .env.example .env

# Make script executable
chmod +x setup-admin-auth.sh
```

## 🧪 Testing Commands

```bash
# Test database connection
npx prisma db execute --stdin <<EOF
SELECT 1;
EOF

# Check TypeScript errors
npx tsc --noEmit

# Test API endpoints (requires curl)
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123",
    "role": "SUPER_ADMIN"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'

# Get universities
curl http://localhost:3000/api/universities
```

## 🔐 Security Commands

```bash
# Generate secure JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate random password
node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"

# Check for security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

## 📦 Package Management

```bash
# Install package
npm install <package-name>

# Install dev dependency
npm install -D <package-name>

# Update packages
npm update

# Check outdated packages
npm outdated

# Remove package
npm uninstall <package-name>
```

## 🧹 Cleanup Commands

```bash
# Clear Next.js cache
rm -rf .next

# Clear node modules
rm -rf node_modules
npm install

# Clear all caches
rm -rf .next node_modules package-lock.json
npm install

# Clear browser localStorage (in browser console)
localStorage.clear()
```

## 📊 Monitoring Commands

```bash
# Check running processes
ps aux | grep node

# Kill process by port
kill $(lsof -t -i:3000)

# View logs (if using pm2)
pm2 logs

# Monitor server
npm run dev | tee dev.log
```

## 🔍 Debugging Commands

```bash
# Check environment variables
env | grep -E "DATABASE_URL|JWT_SECRET|NEXT_PUBLIC"

# Verify .env file
cat .env

# Test database URL
node -e "console.log(process.env.DATABASE_URL)"

# Check Node version
node -v

# Check npm version
npm -v

# Check system info
uname -a
```

## 🌐 Browser Testing URLs

```bash
# Development URLs
http://localhost:3000                    # Home
http://localhost:3000/register          # Registration
http://localhost:3000/login             # Login
http://localhost:3000/dashboard         # Dashboard

# API Endpoints
http://localhost:3000/api/auth/register
http://localhost:3000/api/auth/login
http://localhost:3000/api/universities
http://localhost:3000/api/institutes
```

## 🐳 Docker Commands (Optional)

```bash
# Build Docker image
docker build -t mann-mitra .

# Run container
docker run -p 3000:3000 mann-mitra

# Stop container
docker stop <container-id>

# View logs
docker logs <container-id>
```

## 📱 Git Commands

```bash
# Check status
git status

# Add files
git add .

# Commit changes
git commit -m "Add admin auth system"

# Push to remote
git push origin main

# Create new branch
git checkout -b feature/admin-auth

# View diff
git diff
```

## 🎨 UI Development

```bash
# Install shadcn component
npx shadcn-ui@latest add <component-name>

# Example: Add new button
npx shadcn-ui@latest add button

# Example: Add dialog
npx shadcn-ui@latest add dialog
```

## 🔄 Hot Reload

```bash
# Force restart (Ctrl+C then)
npm run dev

# Clear cache and restart
rm -rf .next && npm run dev
```

## 📈 Performance

```bash
# Analyze bundle size
npm run build
npm run analyze

# Check build size
du -sh .next/

# Lighthouse audit (in browser DevTools)
# Run Lighthouse in Chrome DevTools > Lighthouse tab
```

## 🛠️ Common Workflows

### First Time Setup
```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### After Pulling Changes
```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### Database Reset
```bash
npx prisma db push --force-reset
npx prisma db seed  # If you have seed data
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Troubleshooting
```bash
rm -rf .next node_modules package-lock.json
npm install
npx prisma generate
npx prisma db push
npm run dev
```

## 📝 Quick Notes

- **Port 3000** is the default development port
- **Prisma Studio** runs on port 5555
- Press **Ctrl+C** to stop the dev server
- Use **Ctrl+Shift+R** to hard refresh browser
- Check **.env** file if API calls fail
- Run **prisma generate** after schema changes

## 🆘 Emergency Commands

```bash
# Kill all Node processes
pkill -9 node

# Free up port 3000
lsof -ti:3000 | xargs kill -9

# Reset everything
rm -rf .next node_modules .env
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npm run dev
```

---

**Quick Reference Version:** 1.0  
**Last Updated:** November 25, 2025

💡 **Tip:** Bookmark this page for quick access to commands!
