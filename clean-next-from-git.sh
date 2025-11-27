#!/bin/bash
# Script to remove .next/ directory from git history and cache

echo "🧹 Cleaning .next/ from git..."

# Remove from git cache (staging area) if present
if git ls-files | grep -q "^\.next/"; then
    echo "Found .next/ files in git index, removing..."
    git rm -r --cached .next/ 2>/dev/null || true
fi

# Remove any .next/ directory from working tree
if [ -d ".next" ]; then
    echo "Removing .next/ directory..."
    rm -rf .next/
fi

# Ensure .gitignore has .next/
if ! grep -q "^\.next/" .gitignore; then
    echo "Adding .next/ to .gitignore..."
    echo "" >> .gitignore
    echo "# Next.js build output" >> .gitignore
    echo ".next/" >> .gitignore
fi

echo "✅ Cleanup complete!"
echo ""
echo "Next steps:"
echo "1. Run: git add .gitignore .gitattributes"
echo "2. Run: git commit -m 'chore: remove .next/ from git tracking'"
echo "3. Continue with your rebase: git rebase --continue"
