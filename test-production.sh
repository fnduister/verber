#!/bin/bash

# 🔄 Verber Quick Deployment Script for Local Testing
# This script sets up the production environment locally for testing

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 Setting up Verber Production Environment Locally${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Docker is not running. Please start Docker Desktop first.${NC}"
    exit 1
fi

# Create production environment file for local testing
echo -e "${BLUE}📝 Creating production environment file...${NC}"
cat > .env.prod << EOF
# Local Production Test Environment
POSTGRES_USER=verber_user
POSTGRES_PASSWORD=verber_secure_password_123
POSTGRES_DB=verber_db
JWT_SECRET=verber-super-secure-jwt-secret-for-production-testing-123456789
FRONTEND_URL=http://localhost:3000
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_WS_URL=ws://localhost:8080
ENVIRONMENT=production
EOF

# Stop any running development containers
echo -e "${BLUE}🛑 Stopping development containers...${NC}"
docker-compose down 2>/dev/null || true

# Start production containers
echo -e "${BLUE}🐳 Starting production containers...${NC}"
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

# Wait for services to be ready
echo -e "${BLUE}⏳ Waiting for services to start...${NC}"
sleep 20

# Check service health
echo -e "${BLUE}🔍 Checking service health...${NC}"
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    echo -e "${GREEN}✅ All services are running!${NC}"
    echo ""
    echo -e "${GREEN}🎉 Production environment is ready!${NC}"
    echo -e "${BLUE}📱 Frontend: http://localhost:3000${NC}"
    echo -e "${BLUE}🔧 Backend:  http://localhost:8080${NC}"
    echo -e "${BLUE}💾 Database: localhost:5432${NC}"
    echo ""
    echo -e "${YELLOW}📋 Useful commands:${NC}"
    echo "  • View logs: docker-compose -f docker-compose.prod.yml logs -f"
    echo "  • Stop: docker-compose -f docker-compose.prod.yml down"
    echo "  • Restart: docker-compose -f docker-compose.prod.yml restart"
    echo ""
else
    echo -e "${YELLOW}⚠️  Some services may not be ready yet. Check logs:${NC}"
    echo "docker-compose -f docker-compose.prod.yml logs"
fi