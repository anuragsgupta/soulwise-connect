#!/bin/bash
# Clean development script
# This removes all build artifacts and starts fresh

echo "🧹 Cleaning build directories..."
rm -rf .next
rm -rf node_modules/.cache

echo "✨ Starting clean dev server..."
npm run dev
