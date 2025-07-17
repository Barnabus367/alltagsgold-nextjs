#!/bin/bash

# Vercel Deployment Fix Script
# Löst Git Author Probleme für Vercel Deployment

echo "🔧 Fixing Git configuration for Vercel deployment..."

# 1. Remove lock files
echo "Removing Git lock files..."
rm -f .git/index.lock
rm -f .git/config.lock

# 2. Configure git author
echo "Configuring Git author..."
git config user.name "AlltagsGold"
git config user.email "hallo@alltagsgold.ch"

# 3. Validate configuration
echo "Current Git configuration:"
git config --list | grep user

# 4. Check if there are any uncommitted changes
echo "Git status:"
git status

echo ""
echo "✅ Git configuration fixed!"
echo ""
echo "Next steps to run manually:"
echo "1. git commit --allow-empty -m \"fix: Configure git author for Vercel deployment\""
echo "2. git push origin main"
echo ""
echo "Or use Vercel CLI directly:"
echo "vercel --prod"