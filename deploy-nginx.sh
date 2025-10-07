#!/bin/bash

# Verber Production Deployment Script for Nginx Proxy Setup
# This script deploys Verber using nginx as a reverse proxy

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_header() {
    echo -e "\n${BLUE}================================${NC}"
    echo -e "${BLUE} $1${NC}"
    echo -e "${BLUE}================================${NC}\n"
}

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_error ".env file not found! Please create it with the following variables:"
    echo "POSTGRES_USER=verber_user"
    echo "POSTGRES_PASSWORD=your_secure_password"
    echo "POSTGRES_DB=verber_db"
    echo "JWT_SECRET=your_jwt_secret"
    echo "FRONTEND_URL=https://verber.sicole.com"
    echo "REACT_APP_API_URL=https://verber.sicole.com/api"
    echo "REACT_APP_WS_URL=wss://verber.sicole.com"
    exit 1
fi

print_header "VERBER NGINX PROXY DEPLOYMENT"

# Check if nginx is running
if ! systemctl is-active --quiet nginx; then
    print_error "Nginx is not running. Please start nginx first."
    exit 1
fi

print_success "Nginx is running"

# Stop any existing containers
print_info "Stopping existing containers..."
docker-compose -f docker-compose.nginx.yml down || true

# Pull latest images and build
print_info "Building and starting services..."
docker-compose -f docker-compose.nginx.yml up --build -d

# Wait for services to be healthy
print_info "Waiting for services to start..."
sleep 10

# Check if containers are running
if docker-compose -f docker-compose.nginx.yml ps | grep -q "Up"; then
    print_success "Services are running!"
    
    print_header "DEPLOYMENT SUMMARY"
    echo -e "${BLUE}🌐 Application URL:${NC} https://verber.sicole.com"
    echo -e "${BLUE}🔧 Frontend Port:${NC} 3001 (proxied by nginx)"
    echo -e "${BLUE}🏗️  Backend:${NC} Internal port 8080"
    echo -e "${BLUE}🗄️  Database:${NC} Internal port 5432"
    echo -e "${BLUE}🎯 Redis:${NC} Internal port 6379"
    
    print_info "Nginx is routing traffic from https://verber.sicole.com to port 3001"
    print_success "Deployment completed successfully!"
else
    print_error "Some services failed to start. Check logs with:"
    echo "docker-compose -f docker-compose.nginx.yml logs"
    exit 1
fi