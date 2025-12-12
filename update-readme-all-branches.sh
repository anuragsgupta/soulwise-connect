#!/bin/bash

# ============================================================================
# Script to Update README.md and team_info.txt Across All Git Branches
# ============================================================================
# 
# This script will:
# 1. Save current branch
# 2. Commit changes to README.md and team_info.txt on current branch
# 3. Iterate through all branches and merge the README updates
# 4. Return to original branch
#
# Usage: ./update-readme-all-branches.sh
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  README Update Across All Branches${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}Error: Not in a git repository${NC}"
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}Warning: You have uncommitted changes${NC}"
    read -p "Do you want to continue? This will commit README.md and team_info.txt (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}Aborted by user${NC}"
        exit 1
    fi
fi

# Save current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${GREEN}Current branch: ${CURRENT_BRANCH}${NC}"
echo ""

# Commit README.md and team_info.txt on current branch
echo -e "${YELLOW}Committing README.md and team_info.txt on ${CURRENT_BRANCH}...${NC}"
git add README.md team_info.txt
git commit -m "docs: Update README.md and team_info.txt with comprehensive documentation" || {
    echo -e "${YELLOW}No changes to commit or already committed${NC}"
}
echo ""

# Get all branches (local and remote)
echo -e "${BLUE}Fetching all branches...${NC}"
git fetch --all
ALL_BRANCHES=$(git branch -a | grep -v HEAD | sed 's/remotes\/origin\///' | sed 's/^\*//g' | sed 's/^[[:space:]]*//' | sort -u)

echo -e "${GREEN}Found branches:${NC}"
echo "$ALL_BRANCHES"
echo ""

# Ask for confirmation
read -p "Do you want to update README in all these branches? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Aborted by user${NC}"
    exit 1
fi

# Counter for updated branches
UPDATED=0
SKIPPED=0
FAILED=0

# Iterate through each branch
while IFS= read -r branch; do
    # Skip current branch (already updated)
    if [ "$branch" = "$CURRENT_BRANCH" ]; then
        echo -e "${YELLOW}Skipping current branch: ${branch}${NC}"
        ((SKIPPED++))
        continue
    fi
    
    echo -e "${BLUE}----------------------------------------${NC}"
    echo -e "${BLUE}Processing branch: ${branch}${NC}"
    
    # Checkout the branch
    if git checkout "$branch" 2>/dev/null; then
        # Try to merge just the README files from current branch
        if git checkout "$CURRENT_BRANCH" -- README.md team_info.txt 2>/dev/null; then
            # Commit the changes
            if git commit -m "docs: Update README.md and team_info.txt from ${CURRENT_BRANCH}" 2>/dev/null; then
                echo -e "${GREEN}✓ Updated ${branch}${NC}"
                ((UPDATED++))
            else
                echo -e "${YELLOW}⊘ No changes needed in ${branch}${NC}"
                ((SKIPPED++))
            fi
        else
            echo -e "${RED}✗ Failed to checkout files in ${branch}${NC}"
            ((FAILED++))
        fi
    else
        echo -e "${RED}✗ Failed to checkout ${branch}${NC}"
        ((FAILED++))
    fi
done <<< "$ALL_BRANCHES"

# Return to original branch
echo -e "${BLUE}----------------------------------------${NC}"
echo -e "${YELLOW}Returning to original branch: ${CURRENT_BRANCH}${NC}"
git checkout "$CURRENT_BRANCH"

# Summary
echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  Summary${NC}"
echo -e "${BLUE}============================================${NC}"
echo -e "${GREEN}✓ Updated: ${UPDATED} branches${NC}"
echo -e "${YELLOW}⊘ Skipped: ${SKIPPED} branches${NC}"
echo -e "${RED}✗ Failed: ${FAILED} branches${NC}"
echo ""

# Ask if user wants to push
read -p "Do you want to push all branches to remote? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Pushing all branches...${NC}"
    git push --all origin
    echo -e "${GREEN}✓ All branches pushed to origin${NC}"
else
    echo -e "${YELLOW}Skipped push. You can push manually later with:${NC}"
    echo -e "  ${BLUE}git push --all origin${NC}"
fi

echo ""
echo -e "${GREEN}Done! 🎉${NC}"
