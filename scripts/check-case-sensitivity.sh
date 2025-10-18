#!/bin/bash
# Script to check for case sensitivity issues

echo "🔍 Checking for case sensitivity issues..."

# Check for UPPERCASE UI component files
echo "1. Checking for UPPERCASE UI component files..."
UPPERCASE_FILES=$(find dashboard/components/ui -name "[A-Z]*.tsx" -type f 2>/dev/null)

if [ -n "$UPPERCASE_FILES" ]; then
    echo "❌ Found UPPERCASE files:"
    echo "$UPPERCASE_FILES"
    echo ""
    echo "Fix with:"
    for file in $UPPERCASE_FILES; do
        lowercase_file=$(echo "$file" | sed 's/\([A-Z]\)/\L\1/g')
        echo "  git mv $file $lowercase_file"
    done
    exit 1
else
    echo "✅ No UPPERCASE UI component files found"
fi

# Check Git tracked files
echo ""
echo "2. Checking Git tracked UI component files..."
GIT_FILES=$(git ls-files dashboard/components/ui/ | grep -E "\.(tsx|ts)$")

echo "Git tracked files:"
echo "$GIT_FILES"

# Check for case mismatches
echo ""
echo "3. Checking for case mismatches..."
for file in $GIT_FILES; do
    if [ -f "$file" ]; then
        actual_case=$(basename "$file")
        expected_case=$(echo "$actual_case" | tr '[:upper:]' '[:lower:]')
        if [ "$actual_case" != "$expected_case" ]; then
            echo "❌ Case mismatch: $file (should be lowercase)"
        fi
    fi
done

echo ""
echo "✅ Case sensitivity check completed!"
