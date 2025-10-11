#!/bin/bash

# ============================================================================
# French Verb Import Script
# ============================================================================
# Description: Import French verbs into the database for any environment
# Usage: ./scripts/import_verbs.sh [dev|staging|prod]
# Default: dev
# ============================================================================

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# Parse environment argument (default: dev)
ENVIRONMENT="${1:-dev}"

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    print_error "Invalid environment: $ENVIRONMENT"
    echo "Usage: $0 [dev|staging|prod]"
    exit 1
fi

print_header "🚀 French Verb Import - ${ENVIRONMENT^^} Environment"

# Set compose file and container names based on environment
case "$ENVIRONMENT" in
    dev)
        COMPOSE_FILE="docker-compose.yml"
        POSTGRES_CONTAINER="verber-postgres"
        BACKEND_CONTAINER="verber-backend"
        BACKEND_SERVICE="backend"
        DB_NAME="verber_db"
        ;;
    staging)
        COMPOSE_FILE="docker-compose.staging.yml"
        POSTGRES_CONTAINER="verber-postgres-staging"
        BACKEND_CONTAINER="verber-backend-staging"
        BACKEND_SERVICE="backend-staging"
        DB_NAME="verber_db"
        ;;
    prod)
        COMPOSE_FILE="docker-compose.prod.yml"
        POSTGRES_CONTAINER="verber-postgres-prod"
        BACKEND_CONTAINER="verber-backend-prod"
        BACKEND_SERVICE="backend"
        DB_NAME="verber_db"
        ;;
esac

print_info "Using compose file: $COMPOSE_FILE"
print_info "Target database: $DB_NAME in $POSTGRES_CONTAINER"

# Check if Docker is running
print_info "Checking Docker daemon..."
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi
print_success "Docker is running"

# Check if containers are running
print_info "Checking container status..."
if ! docker ps --format '{{.Names}}' | grep -q "^${POSTGRES_CONTAINER}$"; then
    print_warning "Database container not running. Starting services..."
    docker compose -f "$COMPOSE_FILE" up -d postgres
    
    print_info "Waiting for database to be ready..."
    sleep 5
    
    # Wait for health check
    MAX_WAIT=30
    WAITED=0
    while [ $WAITED -lt $MAX_WAIT ]; do
        if docker compose -f "$COMPOSE_FILE" ps postgres | grep -q "healthy"; then
            break
        fi
        sleep 2
        WAITED=$((WAITED + 2))
        echo -n "."
    done
    echo ""
    
    if [ $WAITED -ge $MAX_WAIT ]; then
        print_error "Database failed to become healthy within ${MAX_WAIT}s"
        exit 1
    fi
fi
print_success "Database container is running"

# Check if backend container exists and is suitable for import
BACKEND_RUNNING=false
USE_TEMP_CONTAINER=false

if docker ps --format '{{.Names}}' | grep -q "^${BACKEND_CONTAINER}$"; then
    # Check if it's a development container (has shell)
    if docker exec "$BACKEND_CONTAINER" sh -c "exit 0" 2>/dev/null; then
        BACKEND_RUNNING=true
        print_success "Backend container is running and accessible"
    else
        print_warning "Backend is running but using scratch image (no shell)"
        USE_TEMP_CONTAINER=true
    fi
else
    print_warning "Backend container not found"
    USE_TEMP_CONTAINER=true
fi

# Determine import method
if [ "$USE_TEMP_CONTAINER" = true ]; then
    print_info "Using temporary Go container for import (production method)"
    
    # Get database credentials from environment or use defaults
    source .env 2>/dev/null || true
    POSTGRES_USER="${POSTGRES_USER:-verber_user}"
    POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-verber_password}"
    
    if [ "$ENVIRONMENT" = "staging" ]; then
        source .env.staging 2>/dev/null || true
    fi
    
    # Build DATABASE_URL for the specific environment
    DATABASE_URL="postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_CONTAINER}:5432/${DB_NAME}?sslmode=disable"
    
    print_info "Running import via temporary container..."
    docker run --rm \
        -v "$(pwd)/backend:/app" \
        -w /app \
        --network "verber_verber-network" \
        -e "DATABASE_URL=${DATABASE_URL}" \
        golang:1.21-alpine \
        sh -c "go run scripts/import_verbs.go"
    
else
    # Use existing dev/staging backend container
    print_info "Running import via backend container..."
    docker compose -f "$COMPOSE_FILE" exec -T "$BACKEND_SERVICE" /bin/sh -c "cd /app && go run scripts/import_verbs.go"
fi

# Verify import
print_header "📊 Verifying Import"
VERB_COUNT=$(docker compose -f "$COMPOSE_FILE" exec -T postgres psql -U "${POSTGRES_USER:-verber_user}" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM verbs;" | tr -d ' ')

if [ "$VERB_COUNT" -gt 0 ]; then
    print_success "Import successful! $VERB_COUNT verbs in database"
    
    # Get conjugation count
    CONJ_COUNT=$(docker compose -f "$COMPOSE_FILE" exec -T postgres psql -U "${POSTGRES_USER:-verber_user}" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM verb_conjugations;" | tr -d ' ')
    print_success "$CONJ_COUNT conjugations in database"
else
    print_error "Import verification failed. No verbs found in database."
    exit 1
fi

print_header "🎉 Import Complete"
echo ""
print_info "Environment: ${ENVIRONMENT^^}"
print_info "Verbs: $VERB_COUNT"
print_info "Conjugations: $CONJ_COUNT"
echo ""

if [ "$ENVIRONMENT" = "dev" ]; then
    print_info "You can verify the data using:"
    echo "  - Adminer: http://localhost:8082"
    echo "  - API: http://localhost:8080/api/verbs"
elif [ "$ENVIRONMENT" = "staging" ]; then
    print_info "You can verify the data at:"
    echo "  - API: https://verber.stage.sicole.com/api/verbs"
else
    print_info "You can verify the data at:"
    echo "  - API: https://verber.sicole.com/api/verbs"
fi
echo ""