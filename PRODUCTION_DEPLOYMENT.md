# Verber Production Deployment - Issue Resolution

## Date: October 19, 2025

## Issues Encountered

### 1. Permission Denied on manage.sh
**Problem:** Could not execute the manage.sh script
**Solution:** Made the script executable
```bash
chmod +x manage.sh
```

### 2. Port 80 Already in Use
**Problem:** 
```
Error: failed to bind host port for 0.0.0.0:80:172.20.0.5:80/tcp: address already in use
```

**Root Cause:** System nginx was already running on port 80 as a reverse proxy for multiple projects

**Architecture:**
- Host nginx (port 80) → routes to Docker containers
- Verber frontend: `localhost:3000` (mapped from container port 80)
- Verber backend: `localhost:8080`

**Solution:** The docker-compose.prod.yml was correctly configured to map frontend to `3000:80`, not `80:80`. The error was caused by stale containers. Fixed by stopping and restarting:
```bash
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d
```

### 3. Nginx Configuration Error in Frontend Container
**Problem:**
```
nginx: [emerg] invalid value "must-revalidate" in /etc/nginx/nginx.conf:28
```

**Root Cause:** Invalid `gzip_proxied` directive value in `frontend/nginx.conf`:
```nginx
gzip_proxied expired no-cache no-store private auth;  # ❌ Invalid syntax
```

**Solution:** Fixed the gzip_proxied directive:
```nginx
gzip_proxied any;  # ✅ Valid value
```

**File Changed:** `/home/fndui/projects/verber/frontend/nginx.conf` (line 28)

**Rebuild Command:**
```bash
docker compose -f docker-compose.prod.yml up -d --build frontend
```

## Final Configuration

### Docker Compose Services
```yaml
services:
  postgres:       # Internal only (no external port)
  redis:          # Internal only (no external port)
  backend:        # Port 8080:8080
  frontend:       # Port 3000:80
```

### Port Mapping
- **Host Nginx:** Port 80 (HTTPS handled by Certbot)
  - Routes `verber.sicole.com` → `localhost:3000` (frontend)
  - Routes `verber.sicole.com/api` → `localhost:8080` (backend API)
  - Routes `verber.sicole.com/ws` → `localhost:8080/ws` (WebSocket)

- **Frontend Container:** 
  - Container port: 80
  - Host port: 3000
  - Internal nginx serves React build

- **Backend Container:**
  - Container port: 8080
  - Host port: 8080
  - Go API server

### Current Status

```
✅ verber-postgres-prod    Up 5 hours (healthy)   5432/tcp
✅ verber-redis-prod       Up 5 hours (healthy)   6379/tcp
✅ verber-backend-prod     Up 6 minutes           0.0.0.0:8080->8080/tcp
✅ verber-frontend-prod    Up 6 minutes           0.0.0.0:3000->80/tcp
```

### Access URLs
- **Public:** https://verber.sicole.com (via nginx reverse proxy)
- **Direct Frontend:** http://localhost:3000 (for debugging)
- **Direct Backend:** http://localhost:8080 (for debugging)

## Commands Reference

### Start Production
```bash
cd /home/fndui/projects/verber
docker compose -f docker-compose.prod.yml up -d
```

### Stop Production
```bash
docker compose -f docker-compose.prod.yml down
```

### Rebuild Specific Service
```bash
docker compose -f docker-compose.prod.yml up -d --build <service_name>
```

### View Logs
```bash
docker compose -f docker-compose.prod.yml logs -f <service_name>
```

### Check Status
```bash
docker ps --filter "name=verber.*prod"
```

## Nginx Configuration Files

### Host Nginx
- Config: `/etc/nginx/sites-available/multi-projects`
- Enabled: `/etc/nginx/sites-enabled/multi-projects` (symlink)

### Frontend Container Nginx
- Config: `/home/fndui/projects/verber/frontend/nginx.conf`
- Copied to container: `/etc/nginx/nginx.conf`

## Environment Details
- **Server:** srv591276
- **OS:** Linux
- **Docker Compose:** Latest (warning about obsolete `version` attribute)
- **Nginx:** System nginx + container nginx
- **SSL:** Managed by Certbot (for verber.sicole.com)

## Notes
- Staging environment running in parallel on different ports
- Both production and staging share the same host nginx reverse proxy
- Frontend build time: ~111 seconds
- No health check on backend (scratch-based image limitation)
