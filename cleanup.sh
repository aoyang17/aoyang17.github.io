#!/bin/bash

echo "This script will clean up your repository for a minimal Jekyll academic homepage."
echo "It will remove potentially unnecessary files and folders."
echo ""
echo "Files/folders that will be PRESERVED:"
echo "  - .git/"
echo "  - _config.yml, index.md"
echo "  - assets/, files/"
echo "  - CNAME (if exists)"
echo "  - LICENSE, README.md"
echo "  - .gitignore"
echo ""
echo "Files/folders that may be REMOVED:"
echo "  - Old HTML/CSS files"
echo "  - Jekyll theme folders (_layouts/, _includes/, _sass/)"
echo "  - Script folders (scripts/)"
echo "  - Node modules, package files"
echo "  - Other non-essential files"
echo ""

# Preview what would be removed
echo "Previewing files that would be removed:"
find . -maxdepth 1 -type f \( -name "*.html" -o -name "*.css" -o -name "package*.json" -o -name "Gemfile*" \) -not -path "./.git/*" | head -10
find . -maxdepth 1 -type d \( -name "_layouts" -o -name "_includes" -o -name "_sass" -o -name "scripts" -o -name "node_modules" \) -not -path "./.git" | head -10

echo ""
read -p "Do you want to proceed with cleanup? (y/N): " confirm

if [[ $confirm =~ ^[Yy]$ ]]; then
    echo "Cleaning up repository..."
    
    # Remove common unnecessary files
    rm -f *.html 2>/dev/null || true
    rm -f *.css 2>/dev/null || true
    rm -f package*.json 2>/dev/null || true
    rm -f Gemfile* 2>/dev/null || true
    
    # Remove directories (use git rm if they're tracked)
    for dir in _layouts _includes _sass scripts node_modules vendor; do
        if [ -d "$dir" ]; then
            if git ls-files "$dir" | grep -q .; then
                echo "Removing tracked directory: $dir"
                git rm -r "$dir"
            else
                echo "Removing untracked directory: $dir"
                rm -rf "$dir"
            fi
        fi
    done
    
    # Create necessary directories
    mkdir -p assets files
    
    echo "Cleanup completed!"
    echo ""
    echo "Next steps:"
    echo "1. Add your profile photo to assets/profile.jpg"
    echo "2. Update _config.yml and index.md with your information"
    echo "3. Add your papers to files/ directory"
    echo "4. Commit changes:"
    echo "   git add ."
    echo "   git commit -m 'Simplified to minimal Jekyll academic homepage'"
    echo "   git push origin master"
else
    echo "Cleanup cancelled."
fi