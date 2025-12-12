# How to Update README Across All Branches

## Quick Summary
This guide shows you how to update `README.md` and `team_info.txt` files across all Git branches at once.

---

## Method 1: Automated Script (Recommended)

### Step 1: Run the Script
```bash
./update-readme-all-branches.sh
```

The script will:
- ✅ Commit README.md and team_info.txt on current branch
- ✅ Show all available branches
- ✅ Ask for confirmation
- ✅ Update each branch automatically
- ✅ Return to your original branch
- ✅ Optionally push all branches to remote

### Step 2: Follow the Prompts
```
Do you want to update README in all these branches? (y/n): y
```

### Step 3: Push to Remote (if asked)
```
Do you want to push all branches to remote? (y/n): y
```

---

## Method 2: Manual Git Commands

If you prefer manual control, use these commands:

### Step 1: Commit on Current Branch
```bash
git add README.md team_info.txt
git commit -m "docs: Update README.md and team_info.txt"
```

### Step 2: Save Current Branch Name
```bash
CURRENT_BRANCH=$(git branch --show-current)
```

### Step 3: Update Each Branch Individually
```bash
# For each branch you want to update:
git checkout branch-name
git checkout $CURRENT_BRANCH -- README.md team_info.txt
git commit -m "docs: Update README.md and team_info.txt"
```

### Step 4: Return to Original Branch
```bash
git checkout $CURRENT_BRANCH
```

### Step 5: Push All Branches
```bash
git push --all origin
```

---

## Method 3: One-Liner for All Branches

```bash
# Save current branch
CURRENT=$(git branch --show-current)

# Update all local branches
for branch in $(git branch | sed 's/^\*//g' | sed 's/^[[:space:]]*//'); do 
  if [ "$branch" != "$CURRENT" ]; then
    echo "Updating $branch..."
    git checkout "$branch"
    git checkout "$CURRENT" -- README.md team_info.txt
    git commit -m "docs: Update README from $CURRENT" || echo "No changes in $branch"
  fi
done

# Return to original branch
git checkout "$CURRENT"

# Push all
git push --all origin
```

---

## Method 4: Cherry-Pick Specific Commit

If you've already committed README changes:

### Step 1: Get the Commit Hash
```bash
git log --oneline -n 5
# Copy the hash of your README commit (e.g., abc1234)
```

### Step 2: Apply to Other Branches
```bash
COMMIT_HASH="abc1234"  # Replace with your commit hash

for branch in $(git branch | sed 's/^\*//g' | sed 's/^[[:space:]]*//'); do
  echo "Cherry-picking to $branch..."
  git checkout "$branch"
  git cherry-pick "$COMMIT_HASH" || echo "Conflict in $branch - skipping"
done

git checkout main  # Return to main branch
```

---

## Important Notes

### ⚠️ Before Running:
1. **Commit your work** - Make sure README.md and team_info.txt are ready
2. **Check for conflicts** - Some branches might have different README structures
3. **Test on one branch first** - Try updating one branch manually before running the script

### ✅ Best Practices:
- Run this after finalizing your README
- Keep a backup: `cp README.md README.md.backup`
- Check each branch after update: `git log --oneline -n 1`
- Verify the changes: `git diff HEAD~1 README.md`

### 🚫 Don't Update If:
- Branches have significantly different README structures
- Some branches are archived/deprecated
- You're working with protected branches that need PR approval

---

## Troubleshooting

### "No changes to commit"
- The branch already has the same README content
- This is normal and can be skipped

### "Merge conflict"
- The branch has different README structure
- Resolve manually: `git checkout --theirs README.md` or `--ours`

### "Permission denied"
- Script not executable: `chmod +x update-readme-all-branches.sh`

### "Remote push failed"
- You may not have push access to all branches
- Push each branch manually: `git push origin branch-name`

---

## Verifying Updates

### Check all branches were updated:
```bash
# Show last commit message on each branch
for branch in $(git branch | sed 's/^\*//g'); do
  echo "$branch: $(git log $branch -1 --oneline)"
done
```

### Compare README across branches:
```bash
# Compare README on two branches
git diff branch1:README.md branch2:README.md
```

---

## Quick Commands Cheat Sheet

```bash
# 1. Make script executable
chmod +x update-readme-all-branches.sh

# 2. Run the script
./update-readme-all-branches.sh

# 3. Or use one-liner
CURRENT=$(git branch --show-current) && for branch in $(git branch | sed 's/^\*//g' | sed 's/^[[:space:]]*//'); do [ "$branch" != "$CURRENT" ] && git checkout "$branch" && git checkout "$CURRENT" -- README.md team_info.txt && git commit -m "docs: Update README" || true; done && git checkout "$CURRENT" && git push --all origin

# 4. Check results
git branch -v

# 5. View README on specific branch
git show branch-name:README.md
```

---

## Example Workflow

```bash
# 1. Edit your files
vim README.md
vim team_info.txt

# 2. Commit on current branch
git add README.md team_info.txt
git commit -m "docs: Update project documentation"

# 3. Run the automated script
./update-readme-all-branches.sh

# 4. Follow prompts
# - Confirm update all branches: y
# - Confirm push to remote: y

# 5. Verify
git log --all --oneline --graph | grep "Update"

# Done! ✅
```

---

## Alternative: GitHub Web Interface

If you prefer using GitHub UI:

1. Go to each branch on GitHub
2. Click on README.md
3. Click "Edit" (pencil icon)
4. Copy-paste your updated content
5. Commit directly to that branch

**Pros:** Visual, safe, no command line
**Cons:** Time-consuming for many branches

---

## Need Help?

- Check script output for detailed errors
- Run with debug: `bash -x update-readme-all-branches.sh`
- View git history: `git log --graph --all --oneline`
- Contact team lead if issues persist

---

**Pro Tip:** Create a backup before running:
```bash
# Backup all branches' READMEs
mkdir -p readme-backups
for branch in $(git branch | sed 's/^\*//g'); do
  git show $branch:README.md > "readme-backups/README-$branch.md"
done
```
