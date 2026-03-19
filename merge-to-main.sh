#!/bin/bash
set -e

FEATURE_BRANCH="claude/refactor-security-scalability-eLQ1Y"

echo "=== Merging $FEATURE_BRANCH into main ==="

# Ensure we have latest
git fetch origin main
git fetch origin "$FEATURE_BRANCH"

# Switch to main
git checkout main
git pull origin main

# Merge the feature branch
git merge "$FEATURE_BRANCH" -m "Merge $FEATURE_BRANCH: fix Netlify Blobs with explicit credentials"

# Push to remote
git push origin main

echo ""
echo "=== Done! main is now up to date. ==="
echo "Netlify should auto-deploy from main shortly."
