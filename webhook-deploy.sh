#!/bin/bash

# 🎣 GitHub Webhook Deployment Handler
# This script handles GitHub webhook payloads and triggers deployments
# Place this on your server and configure GitHub webhook to call it

set -e

# Configuration
WEBHOOK_SECRET="${WEBHOOK_SECRET:-your-webhook-secret-here}"
DEPLOY_DIR="/opt/verber"
LOG_FILE="/var/log/verber-deploy.log"
BRANCH_TO_DEPLOY="${DEPLOY_BRANCH:-main}"

# Colors for logging
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging function
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

log_warning() {
    log "${YELLOW}⚠️ $1${NC}"
}

# Verify webhook signature (GitHub HMAC-SHA256)
verify_signature() {
    local payload="$1"
    local signature="$2"
    
    if [ -z "$WEBHOOK_SECRET" ] || [ "$WEBHOOK_SECRET" = "your-webhook-secret-here" ]; then
        log_warning "Webhook secret not configured - skipping signature verification"
        return 0
    fi
    
    local expected_signature=$(echo -n "$payload" | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" | sed 's/^.* //')
    local received_signature=$(echo "$signature" | sed 's/^sha256=//')
    
    if [ "$expected_signature" = "$received_signature" ]; then
        log_success "Webhook signature verified"
        return 0
    else
        log_error "Invalid webhook signature"
        return 1
    fi
}

# Deploy function
deploy() {
    log_info "🚀 Starting deployment process..."
    
    cd "$DEPLOY_DIR" || {
        log_error "Failed to navigate to deploy directory: $DEPLOY_DIR"
        exit 1
    }
    
    # Create backup before deployment
    log_info "📦 Creating backup..."
    ./manage.sh backup
    
    # Pull latest changes
    log_info "📥 Pulling latest changes..."
    git fetch origin
    git reset --hard "origin/$BRANCH_TO_DEPLOY"
    
    # Deploy using the existing deploy script
    log_info "🔄 Running deployment..."
    ./deploy.sh --skip-setup --skip-interactive
    
    # Health check
    log_info "🏥 Performing health check..."
    sleep 30
    
    if curl -f -s http://localhost/api/health > /dev/null; then
        log_success "🎉 Deployment completed successfully!"
        
        # Send success notification
        send_notification "success" "Deployment completed successfully"
    else
        log_error "Health check failed - rolling back..."
        
        # Rollback using backup
        ./manage.sh restore-latest
        
        send_notification "failure" "Deployment failed and rolled back"
        exit 1
    fi
}

# Send notification (optional)
send_notification() {
    local status="$1"
    local message="$2"
    
    # Discord webhook (if configured)
    if [ -n "$DISCORD_WEBHOOK_URL" ]; then
        local color
        if [ "$status" = "success" ]; then
            color=65280  # Green
        else
            color=16711680  # Red
        fi
        
        curl -H "Content-Type: application/json" \
             -X POST \
             -d "{
                \"embeds\": [{
                    \"title\": \"Verber Deployment\",
                    \"description\": \"$message\",
                    \"color\": $color,
                    \"fields\": [
                        {\"name\": \"Branch\", \"value\": \"$BRANCH_TO_DEPLOY\", \"inline\": true},
                        {\"name\": \"Server\", \"value\": \"$(hostname)\", \"inline\": true},
                        {\"name\": \"Time\", \"value\": \"$(date)\", \"inline\": false}
                    ]
                }]
             }" \
             "$DISCORD_WEBHOOK_URL"
    fi
    
    # Slack webhook (if configured)
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        local emoji
        if [ "$status" = "success" ]; then
            emoji=":white_check_mark:"
        else
            emoji=":x:"
        fi
        
        curl -X POST -H 'Content-type: application/json' \
             --data "{
                \"text\": \"$emoji Verber Deployment: $message\",
                \"attachments\": [{
                    \"fields\": [
                        {\"title\": \"Branch\", \"value\": \"$BRANCH_TO_DEPLOY\", \"short\": true},
                        {\"title\": \"Server\", \"value\": \"$(hostname)\", \"short\": true}
                    ]
                }]
             }" \
             "$SLACK_WEBHOOK_URL"
    fi
}

# Main webhook handler
main() {
    log_info "🎣 Webhook received"
    
    # Read the payload
    local payload
    if [ -t 0 ]; then
        # Interactive mode for testing
        payload='{"ref": "refs/heads/'$BRANCH_TO_DEPLOY'", "repository": {"name": "verber"}}'
        log_warning "Running in test mode"
    else
        # Read from stdin (webhook)
        payload=$(cat)
    fi
    
    # Verify signature if provided
    if [ -n "$HTTP_X_HUB_SIGNATURE_256" ]; then
        verify_signature "$payload" "$HTTP_X_HUB_SIGNATURE_256" || exit 1
    fi
    
    # Parse the payload
    local ref=$(echo "$payload" | jq -r '.ref // empty')
    local repo_name=$(echo "$payload" | jq -r '.repository.name // empty')
    
    log_info "Repository: $repo_name"
    log_info "Reference: $ref"
    
    # Check if this is a push to the deployment branch
    if [ "$ref" = "refs/heads/$BRANCH_TO_DEPLOY" ]; then
        log_info "✅ Push to deployment branch detected - triggering deployment"
        deploy
    else
        log_info "ℹ️ Push to different branch ($ref) - ignoring"
    fi
}

# Handle different execution modes
case "${1:-webhook}" in
    "webhook")
        main
        ;;
    "test")
        log_info "🧪 Running in test mode"
        BRANCH_TO_DEPLOY="${2:-main}"
        deploy
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [webhook|test|help]"
        echo ""
        echo "Modes:"
        echo "  webhook  - Handle GitHub webhook (default)"
        echo "  test     - Test deployment manually"
        echo "  help     - Show this help"
        echo ""
        echo "Environment variables:"
        echo "  WEBHOOK_SECRET     - GitHub webhook secret"
        echo "  DEPLOY_BRANCH      - Branch to deploy (default: main)"
        echo "  DISCORD_WEBHOOK_URL - Discord webhook for notifications"
        echo "  SLACK_WEBHOOK_URL   - Slack webhook for notifications"
        ;;
    *)
        log_error "Unknown command: $1"
        exit 1
        ;;
esac