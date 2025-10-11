# Verber Scripts Documentation

## Import Verbs Script

The `import_verbs.sh` script is a unified tool for importing French verb data into the database across all environments.

### Features

- ✅ Supports development, staging, and production environments
- ✅ Automatically detects container types (scratch vs alpine)
- ✅ Uses temporary containers for production imports
- ✅ Colored output with progress indicators
- ✅ Automatic verification of import success
- ✅ Environment-specific configuration loading

### Usage

```bash
# Import to development (default)
./scripts/import_verbs.sh
./scripts/import_verbs.sh dev

# Import to staging
./scripts/import_verbs.sh staging

# Import to production
./scripts/import_verbs.sh prod
```

### How It Works

#### Development & Staging
- Uses the running backend container (has shell and Go runtime)
- Executes `go run scripts/import_verbs.go` directly in the container
- Fast and efficient for dev/staging workflows

#### Production
- Detects scratch-based backend containers (no shell)
- Spins up a temporary `golang:1.21-alpine` container
- Mounts the backend directory as a volume
- Connects to the production database via Docker network
- Runs the import and automatically cleans up

### Environment Detection

The script automatically:
1. Checks if Docker is running
2. Detects which compose file to use based on environment
3. Determines container names (verber-backend, verber-backend-staging, verber-backend-prod)
4. Loads environment variables from `.env` or `.env.staging`
5. Waits for database health checks
6. Selects the appropriate import method

### Configuration

The script reads configuration from:
- `.env` for development and production
- `.env.staging` for staging environment

Required environment variables:
- `POSTGRES_USER` (default: verber_user)
- `POSTGRES_PASSWORD` (default: verber_password)

### Verification

After import, the script:
1. Queries the database for verb count
2. Queries for conjugation count
3. Reports success/failure with colored output
4. Provides URLs to verify the data

### Integration

The script is integrated into:
- `staging.sh import-verbs` - Uses the unified import script
- Can be called from deploy pipelines
- Compatible with CI/CD workflows

### Troubleshooting

**Error: "Docker is not running"**
- Start Docker daemon before running the script

**Error: "Database failed to become healthy"**
- Check database container logs
- Verify database credentials in .env file

**Error: "Import verification failed"**
- Check backend logs for import errors
- Verify the `conjugations.json` file exists in `backend/data/`
- Check database connectivity

**Production import seems slow**
- First run downloads Go dependencies (cached afterward)
- Subsequent runs are faster

### Example Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🚀 French Verb Import - PROD Environment
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ℹ️  Using compose file: docker-compose.prod.yml
ℹ️  Target database: verber_db in verber-postgres-prod
✅ Docker is running
✅ Database container is running
⚠️  Backend is running but using scratch image (no shell)
ℹ️  Using temporary Go container for import (production method)
...
✅ Import successful! 956 verbs in database
✅ 956 conjugations in database

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🎉 Import Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ℹ️  Environment: PROD
ℹ️  Verbs: 956
ℹ️  Conjugations: 956
```

## Other Scripts

### staging.sh
Management script for staging environment operations.

```bash
./staging.sh up              # Start staging
./staging.sh down            # Stop staging
./staging.sh import-verbs    # Import verbs (calls import_verbs.sh staging)
./staging.sh logs            # View logs
```

### deploy_pipeline.sh
Deployment pipeline for promoting changes from staging to production.

```bash
./deploy_pipeline.sh deploy    # Deploy to production
./deploy_pipeline.sh rollback  # Rollback production
./deploy_pipeline.sh status    # Check deployment status
```
