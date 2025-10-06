#!/bin/bash

# Verber Development Setup Script
# This script sets up the complete development environment

set -e

echo "🚀 Setting up Verber development environment..."

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating environment file..."
    cp .env.example .env
    echo "✅ Created .env file. Please review and update the values."
fi

# Build and start the development environment
echo "🔨 Building Docker images..."
docker-compose build

echo "🚀 Starting development environment..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check service health
echo "🏥 Checking service health..."

# Check PostgreSQL
if docker-compose exec -T postgres pg_isready -U verber_user -d verber_db; then
    echo "✅ PostgreSQL is ready"
else
    echo "❌ PostgreSQL failed to start"
fi

# Check Redis
if docker-compose exec -T redis redis-cli ping | grep -q "PONG"; then
    echo "✅ Redis is ready"
else
    echo "❌ Redis failed to start"
fi

# Check Backend
if curl -f http://localhost:8080/health &> /dev/null; then
    echo "✅ Backend is ready"
else
    echo "❌ Backend failed to start"
fi

# Check Frontend
if curl -f http://localhost:3000 &> /dev/null; then
    echo "✅ Frontend is ready"
else
    echo "❌ Frontend failed to start"
fi

echo ""
echo "🎉 Development environment is ready!"
echo ""
echo "📋 Services:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:8080"
echo "   Database:  localhost:5432"
echo "   Redis:     localhost:6379"
echo ""
echo "📊 Management:"
echo "   View logs:     docker-compose logs -f [service]"
echo "   Stop all:      docker-compose down"
echo "   Restart:       docker-compose restart [service]"
echo "   Rebuild:       docker-compose build [service]"
echo ""
echo "🔧 Development commands:"
echo "   Backend shell: docker-compose exec backend sh"
echo "   Database CLI:  docker-compose exec postgres psql -U verber_user -d verber_db"
echo "   Redis CLI:     docker-compose exec redis redis-cli"