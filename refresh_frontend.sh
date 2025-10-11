#!/bin/bash

# Frontend Development Refresh Script
# This script helps refresh the frontend without manual cache clearing

echo "🔄 Refreshing Frontend Development Environment..."

# Option 1: Restart just the frontend (fastest)
if [ "$1" == "quick" ]; then
    echo "⚡ Quick restart - frontend container only"
    cd /home/fndui/projects/verber
    docker-compose restart frontend
    echo "✅ Frontend restarted"

# Option 2: Rebuild and restart (most thorough)
elif [ "$1" == "rebuild" ]; then
    echo "🔧 Full rebuild - this may take a moment"
    cd /home/fndui/projects/verber
    docker-compose build frontend
    docker-compose up -d frontend
    echo "✅ Frontend rebuilt and restarted"

# Option 3: Clear everything (nuclear option)
elif [ "$1" == "clean" ]; then
    echo "🧹 Clean restart - removing containers and volumes"
    cd /home/fndui/projects/verber
    docker-compose stop frontend
    docker-compose rm -f frontend
    docker volume prune -f
    docker-compose up -d frontend
    echo "✅ Frontend completely refreshed"

# Default: smart restart
else
    echo "🔄 Smart restart - stopping and starting fresh"
    cd /home/fndui/projects/verber
    docker-compose stop frontend
    docker-compose up -d frontend
    echo "✅ Frontend refreshed"
    echo ""
    echo "💡 Usage options:"
    echo "  ./refresh_frontend.sh quick    - Quick restart"
    echo "  ./refresh_frontend.sh rebuild  - Full rebuild"
    echo "  ./refresh_frontend.sh clean    - Nuclear clean restart"
fi

echo "🌐 Site: https://verber.sicole.com"
echo "📊 Logs: docker-compose logs frontend -f"