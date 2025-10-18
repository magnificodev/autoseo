# Contributing Guidelines

## File Naming Conventions

### UI Components

-   **ALWAYS use lowercase** for component files: `button.tsx`, `card.tsx`, `dialog.tsx`
-   **NEVER use UPPERCASE** for component files: ❌ `Button.tsx`, `Card.tsx`, `Dialog.tsx`
-   **Component names** can be PascalCase in code: `export const Button = ...`

### Import Paths

-   **ALWAYS use absolute imports** with `@` alias: `@/components/ui/button`
-   **AVOID relative imports** for UI components: ❌ `../../components/ui/button`

### Git Operations

-   **When renaming files**: Use `git mv` instead of manual rename
-   **Example**: `git mv Button.tsx button.tsx`
-   **Verify**: Check `git status` to ensure rename is tracked

## Docker Build Best Practices

### Case Sensitivity

-   **Test locally**: Use WSL or Linux VM for testing
-   **Verify files**: Check file names in Docker container during build
-   **Clean builds**: Use `--no-cache` when debugging case issues

### Cache Strategy

-   **Development**: Use cache for faster builds
-   **Production**: Use `--no-cache` for consistency
-   **Debugging**: Always use `--no-cache` when fixing case issues

## Pre-commit Checklist

-   [ ] All UI component files are lowercase
-   [ ] All imports use `@` alias
-   [ ] No relative imports for UI components
-   [ ] Git tracks files with correct case
-   [ ] Docker build passes locally (if possible)

## Troubleshooting

### Case Sensitivity Issues

1. Check `git ls-files` for actual tracked names
2. Use `git mv` to rename files
3. Verify with `git status`
4. Test Docker build with `--no-cache`

### Module Not Found

1. Verify file exists in correct case
2. Check import paths use `@` alias
3. Ensure `tsconfig.json` has correct paths
4. Test with `--no-cache` Docker build
