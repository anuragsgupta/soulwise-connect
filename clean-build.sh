#!/bin/bash
# Clean build script
# This removes all build artifacts and creates a fresh production build

echo "🧹 Cleaning build directories..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf out

echo "📦 Creating fresh production build..."
npm run build
