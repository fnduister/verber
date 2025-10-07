#!/bin/bash

# 🔄 Simple Git Hook Deployment
# This script can be used as a post-receive hook or run manually
# to deploy changes when code is pushed to a Git repository

set -e

# Configuration
DEPLOY_DIR="/opt/verber"
BRANCH="main"
LOG_FILE="/var/log/verber-deploy.log"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log_success() {
    log "${GREEN}✅ $1${NC}"
}

log_error() {
    log "${RED}❌ $1${NC}"
}

log_info() {
    log "${BLUE}ℹ️ $1${NC}"
}

# Function to deploy
deploy() {
    local branch_name="$1"
    
    if [ "$branch_name" != "$BRANCH" ]; then
        log_info "Ignoring push to branch: $branch_name (only deploying $BRANCH)"
        return 0
    fi
    
    log_info "🚀 Starting deployment for branch: $branch_name"
    
    cd "$DEPLOY_DIR" || {
        log_error "Failed to change to deploy directory: $DEPLOY_DIR"
        exit 1
    }
    
    # Backup current deployment
    log_info "📦 Creating backup..."
    ./manage.sh backup || log_error "Backup failed but continuing..."
    
    # Reset to latest commit
    log_info "📥 Updating code..."
    git fetch origin
    git reset --hard "origin/$BRANCH"
    
    # Build and deploy
    log_info "🏗️ Building application..."
    
    # Stop services
    docker-compose -f docker-compose.prod.yml down
    
    # Rebuild containers
    docker-compose -f docker-compose.prod.yml build --no-cache
    
    # Start services
    docker-compose -f docker-compose.prod.yml up -d
    
    # Wait for services to be ready
    log_info "⏳ Waiting for services to start..."
    sleep 30
    
    # Health check
    if curl -f -s http://localhost/api/health > /dev/null; then
        log_success "🎉 Deployment completed successfully!"
    else
        log_error "❌ Health check failed!"
        
        # Try to restore backup
        log_info "🔄 Attempting to restore backup..."
        ./manage.sh restore-latest
        
        exit 1
    fi
}

# Main execution
if [ $# -eq 0 ]; then
    # Running as git hook - read from stdin
    while read oldrev newrev refname; do
        branch_name=$(echo "$refname" | sed 's|refs/heads/||')
        deploy "$branch_name"
    done
else
    # Running manually with branch name
    deploy "$1"
fi