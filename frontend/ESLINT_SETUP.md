# ESLint and Husky Setup

This project now has:

- ✅ ESLint configuration with React/TypeScript rules
- ✅ Auto-fix capability with `npm run lint:fix`
- ✅ Pre-commit hooks with Husky
- ✅ Lint-staged to run ESLint only on staged files

## Scripts Available

- `npm run lint` - Check for linting issues
- `npm run lint:fix` - Auto-fix linting issues where possible

## Pre-commit Hook

The pre-commit hook will automatically run ESLint with --fix on staged JavaScript/TypeScript files before each commit.