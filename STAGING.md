# Verber Staging Environment

## Overview
This staging environment allows you to test changes before deploying to production.

## URLs
- **Production**: https://verber.sicole.com
- **Staging**: https://verber.stage.sicole.com

## Quick Commands

### Staging Management
```bash
# Start staging environment
./staging.sh up

# Stop staging environment  
./staging.sh down

# Restart staging
./staging.sh restart

# Rebuild staging
./staging.sh build

# View logs
./staging.sh logs
./staging.sh logs frontend  # specific service

# Check status
./staging.sh status

# Import verbs to staging DB
./staging.sh import-verbs

# Open shell in staging backend
./staging.sh shell backend
```

### Deployment Pipeline
```bash
# Deploy to staging
./deploy_pipeline.sh staging

# Deploy to production
./deploy_pipeline.sh production

# Promote staging to production
./deploy_pipeline.sh promote

# Check both environments
./deploy_pipeline.sh status
```

## Environment Details

### Staging Ports
- Frontend: localhost:3001 → https://verber.stage.sicole.com
- Backend: localhost:8081 → https://verber.stage.sicole.com/api  
- PostgreSQL: localhost:5433
- Redis: localhost:6380

### Production Ports  
- Frontend: localhost:3000 → https://verber.sicole.com
- Backend: localhost:8080 → https://verber.sicole.com/api
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## Workflow

1. **Make Changes**: Edit your code in the project
2. **Test Staging**: `./staging.sh build` 
3. **Verify**: Test at https://verber.stage.sicole.com
4. **Promote**: `./deploy_pipeline.sh promote`

## Environment Variables

**Staging** (`.env.staging`):
- Separate database: `verber_db_staging`  
- Different JWT secret
- Staging-specific API URLs
- `REACT_APP_ENVIRONMENT=staging`

**Production** (`.env`):
- Production database: `verber_db`
- Production JWT secret  
- Production API URLs
- `REACT_APP_ENVIRONMENT=production`

## Features

- ✅ Separate databases (no staging/prod data conflicts)
- ✅ SSL certificates for both environments  
- ✅ No-cache headers for development
- ✅ Environment indicators in responses
- ✅ Easy promotion workflow
- ✅ Independent container stacks