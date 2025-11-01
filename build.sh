#!/bin/bash

# Verber Build Script
# Builds Docker containers for different environments without cache

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to build for a specific environment
build_environment() {
    local env=$1
    local compose_file=$2
    
    print_info "Building $env environment..."
    
    if [ ! -f "$compose_file" ]; then
        print_error "Compose file $compose_file not found!"
        return 1
    fi
    
    print_info "Running docker compose build --no-cache..."
    docker compose -f "$compose_file" build --no-cache
    
    if [ $? -eq 0 ]; then
        print_info "$env build completed successfully!"
        return 0
    else
        print_error "$env build failed!"
        return 1
    fi
}

# Main script
print_info "Verber Docker Build Script"
print_info "=============================="

# Check if an environment was specified
if [ $# -eq 0 ]; then
    print_warning "No environment specified. Usage: ./build.sh [prod|stage|dev|all]"
    print_info "Building all environments by default..."
    BUILD_ENV="all"
else
    BUILD_ENV=$1
fi

# Build based on environment
case $BUILD_ENV in
    prod|production)
        print_info "Building PRODUCTION environment"
        build_environment "Production" "docker-compose.prod.yml"
        ;;
    stage|staging)
        print_info "Building STAGING environment"
        build_environment "Staging" "docker-compose.staging.yml"
        ;;
    dev|development)
        print_info "Building DEVELOPMENT environment"
        if [ -f "docker-compose.dev.yml" ]; then
            build_environment "Development" "docker-compose.dev.yml"
        elif [ -f "docker-compose.yml" ]; then
            build_environment "Development" "docker-compose.yml"
        else
            print_error "No development compose file found!"
            exit 1
        fi
        ;;
    all)
        print_info "Building ALL environments"
        echo ""
        
        # Build production
        build_environment "Production" "docker-compose.prod.yml"
        PROD_STATUS=$?
        echo ""
        
        # Build staging
        build_environment "Staging" "docker-compose.staging.yml"
        STAGE_STATUS=$?
        echo ""
        
        # Build development (if exists)
        if [ -f "docker-compose.dev.yml" ]; then
            build_environment "Development" "docker-compose.dev.yml"
            DEV_STATUS=$?
        elif [ -f "docker-compose.yml" ]; then
            build_environment "Development" "docker-compose.yml"
            DEV_STATUS=$?
        else
            print_warning "No development compose file found, skipping..."
            DEV_STATUS=0
        fi
        
        # Summary
        echo ""
        print_info "=============================="
        print_info "Build Summary:"
        [ $PROD_STATUS -eq 0 ] && print_info "✓ Production: SUCCESS" || print_error "✗ Production: FAILED"
        [ $STAGE_STATUS -eq 0 ] && print_info "✓ Staging: SUCCESS" || print_error "✗ Staging: FAILED"
        [ $DEV_STATUS -eq 0 ] && print_info "✓ Development: SUCCESS" || print_warning "✗ Development: SKIPPED/FAILED"
        print_info "=============================="
        
        # Exit with error if any build failed
        if [ $PROD_STATUS -ne 0 ] || [ $STAGE_STATUS -ne 0 ] || [ $DEV_STATUS -ne 0 ]; then
            exit 1
        fi
        ;;
    *)
        print_error "Invalid environment: $BUILD_ENV"
        print_info "Usage: ./build.sh [prod|stage|dev|all]"
        exit 1
        ;;
esac

print_info "Done!"
