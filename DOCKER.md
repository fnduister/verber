# 🐳 Verber - Containerized Setup Guide

This guide explains how to set up and run the Verber application using Docker containers.

## 📋 Prerequisites

- **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
- **Docker Compose** v2.0+
- **Git** for cloning the repository

### Install Docker Desktop:
- **Windows**: https://docs.docker.com/desktop/windows/install/
- **macOS**: https://docs.docker.com/desktop/mac/install/
- **Linux**: https://docs.docker.com/engine/install/

## 🚀 Quick Start

### 1. Clone and Setup
```bash
# Clone the repository
git clone <your-repo-url> verber
cd verber

# Run setup script (creates .env and starts containers)
# Windows:
scripts\setup.bat

# Linux/macOS:
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### 2. Manual Setup (Alternative)
```bash
# Create environment file
cp .env.example .env

# Edit .env with your preferred values (optional for development)
# nano .env

# Build and start all services
docker-compose up -d --build

# Check if everything is running
docker-compose ps
```

## 📊 Services Overview

| Service | Port | URL | Description |
|---------|------|-----|-------------|
| Frontend | 3000 | http://localhost:3000 | React development server |
| Backend | 8080 | http://localhost:8080 | Go API server |
| PostgreSQL | 5432 | localhost:5432 | Database |
| Redis | 6379 | localhost:6379 | Cache & sessions |

## 🛠️ Development Commands

### Container Management
```bash
# View running containers
docker-compose ps

# View logs (all services)
docker-compose logs -f

# View logs (specific service)
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
docker-compose logs -f redis

# Stop all services
docker-compose down

# Start services
docker-compose up -d

# Restart specific service
docker-compose restart backend

# Rebuild and restart
docker-compose up -d --build backend
```

### Database Operations
```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U verber_user -d verber_db

# View database tables
docker-compose exec postgres psql -U verber_user -d verber_db -c "\dt"

# Backup database
docker-compose exec postgres pg_dump -U verber_user verber_db > backup.sql

# Restore database
docker-compose exec -T postgres psql -U verber_user verber_db < backup.sql
```

### Redis Operations
```bash
# Connect to Redis CLI
docker-compose exec redis redis-cli

# View Redis info
docker-compose exec redis redis-cli info

# Flush Redis cache
docker-compose exec redis redis-cli flushall
```

### Backend Development
```bash
# Access backend shell
docker-compose exec backend sh

# View Go modules
docker-compose exec backend go list -m all

# Run tests
docker-compose exec backend go test ./...

# Install new Go package
docker-compose exec backend go get package-name
docker-compose exec backend go mod tidy
```

### Frontend Development
```bash
# Access frontend shell
docker-compose exec frontend sh

# Install new npm package
docker-compose exec frontend npm install package-name

# Run frontend tests
docker-compose exec frontend npm test

# Build production bundle
docker-compose exec frontend npm run build
```

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐
│  React Frontend │◄──►│   Nginx Proxy   │
│   (Port 3000)   │    │   (Port 80)     │
└─────────────────┘    └─────────────────┘
          │                      │
          ▼                      ▼
┌─────────────────┐    ┌─────────────────┐
│   Go Backend    │◄──►│   PostgreSQL    │
│   (Port 8080)   │    │   (Port 5432)   │
└─────────────────┘    └─────────────────┘
          │
          ▼
┌─────────────────┐
│      Redis      │
│   (Port 6379)   │
└─────────────────┘
```

## 📁 File Structure

```
verber/
├── docker-compose.yml          # Development containers
├── docker-compose.prod.yml     # Production containers
├── .env.example               # Environment template
├── scripts/
│   ├── setup.sh              # Linux/macOS setup
│   └── setup.bat             # Windows setup
├── backend/
│   ├── Dockerfile            # Multi-stage Go build
│   ├── .air.toml            # Live reload config
│   ├── .dockerignore        # Docker ignore rules
│   └── scripts/
│       └── init.sql         # Database initialization
└── frontend/
    ├── Dockerfile           # Multi-stage React build
    ├── nginx.conf          # Production Nginx config
    ├── docker-entrypoint.sh # Runtime environment injection
    └── .dockerignore       # Docker ignore rules
```

## 🎯 Production Deployment

### Using Production Compose
```bash
# Copy and edit production environment
cp .env.example .env.prod

# Edit production values
# - Strong JWT_SECRET
# - Production database password
# - Production URLs

# Build and start production containers
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

# View production logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Environment Variables (Production)
```bash
# Required for production
JWT_SECRET=very-long-random-secret-key-for-production
POSTGRES_PASSWORD=strong-database-password
FRONTEND_URL=https://yourdomain.com
REACT_APP_API_URL=https://api.yourdomain.com/api
REACT_APP_WS_URL=wss://api.yourdomain.com
```

## 🔧 Troubleshooting

### Common Issues

**Containers won't start:**
```bash
# Check Docker daemon
docker info

# Check port conflicts
netstat -tulpn | grep :3000
netstat -tulpn | grep :8080

# Clean up and rebuild
docker-compose down
docker system prune -f
docker-compose up -d --build
```

**Database connection errors:**
```bash
# Check PostgreSQL status
docker-compose exec postgres pg_isready -U verber_user

# Reset database
docker-compose down
docker volume rm verber_postgres_data
docker-compose up -d
```

**Frontend not updating:**
```bash
# Rebuild frontend
docker-compose build frontend
docker-compose up -d frontend

# Clear browser cache and hard refresh
```

**Backend compilation errors:**
```bash
# Check Go modules
docker-compose exec backend go mod tidy

# View build logs
docker-compose logs backend
```

### Performance Optimization

**Development:**
```bash
# Use bind mounts for faster file sync
# Already configured in docker-compose.yml

# Increase Docker resources in Docker Desktop
# Settings > Resources > Advanced
# - Memory: 4GB+
# - CPUs: 2+
```

**Production:**
```bash
# Use multi-stage builds (already implemented)
# Enable gzip in Nginx (already configured)
# Use Redis for session storage (already configured)
```

## 🔒 Security Notes

- Change default passwords in production
- Use strong JWT secrets
- Enable SSL/TLS certificates
- Update Docker images regularly
- Use secrets management for sensitive data

## 📝 Next Steps

1. **Complete the setup** using the setup script
2. **Develop features** with live reloading
3. **Test the application** at http://localhost:3000
4. **Check the API** at http://localhost:8080/api/verbs
5. **Monitor with logs** using `docker-compose logs -f`

Your containerized Verber application is now ready for development! 🎉