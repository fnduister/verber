# Verber Build Script Usage

## Quick Start

```bash
# Build production environment
./build.sh prod

# Build staging environment
./build.sh stage

# Build development environment
./build.sh dev

# Build all environments
./build.sh all
```

## Details

The `build.sh` script performs a clean rebuild (no cache) of Docker containers for the specified environment.

### Options

- `prod` or `production` - Builds using `docker-compose.prod.yml`
- `stage` or `staging` - Builds using `docker-compose.staging.yml`
- `dev` or `development` - Builds using `docker-compose.dev.yml` or `docker-compose.yml`
- `all` - Builds all environments sequentially

### Examples

```bash
# After making changes to Dockerfile or dependencies
./build.sh prod

# Rebuild everything after major changes
./build.sh all

# Quick staging rebuild
./build.sh stage
```

### After Building

Don't forget to bring up the containers:

```bash
# For production
docker compose -f docker-compose.prod.yml up -d

# For staging
docker compose -f docker-compose.staging.yml up -d

# For development
docker compose up -d
```

### Combined Build and Start

```bash
# Production
./build.sh prod && docker compose -f docker-compose.prod.yml up -d

# Staging
./build.sh stage && docker compose -f docker-compose.staging.yml up -d
```

## SSL Certificates

All domains are covered by a single certificate:
- verber.sicole.com
- sicole.com
- verber.ca
- fnduister.com
- kemono.fnduister.com
- math.sicole.com

Certificate auto-renews via certbot. To manually renew:
```bash
sudo certbot renew
```
