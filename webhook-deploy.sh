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

# Health check configuration
HEALTH_CHECK_URL="${HEALTH_CHECK_URL:-http://localhost/api/health}"
HEALTH_CHECK_TIMEOUT="${HEALTH_CHECK_TIMEOUT:-30}"
HEALTH_CHECK_RETRIES="${HEALTH_CHECK_RETRIES:-5}"

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
    
    # Security: Require a proper webhook secret in production
    if [ -z "$WEBHOOK_SECRET" ] || [ "$WEBHOOK_SECRET" = "your-webhook-secret-here" ]; then
        log_error "SECURITY ERROR: Webhook secret not configured properly!"
        log_error "Set WEBHOOK_SECRET environment variable to a secure random string (32+ characters)"
        log_error "Example: export WEBHOOK_SECRET=\$(openssl rand -hex 32)"
        exit 1
    fi
    
    # Validate secret length for security
    if [ ${#WEBHOOK_SECRET} -lt 16 ]; then
        log_error "SECURITY ERROR: Webhook secret too short! Must be at least 16 characters"
        log_error "Current length: ${#WEBHOOK_SECRET} characters"
        exit 1
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

# Security validation function
validate_security() {
    log_info "🔐 Performing security validation..."
    
    # Check webhook secret
    if [ -z "$WEBHOOK_SECRET" ] || [ "$WEBHOOK_SECRET" = "your-webhook-secret-here" ]; then
        log_error "CRITICAL: Webhook secret not configured!"
        log_error "This is a major security risk - deployments cannot continue"
        exit 1
    fi
    
    # Check secret strength
    if [ ${#WEBHOOK_SECRET} -lt 32 ]; then
        log_warning "Webhook secret is shorter than recommended 32 characters"
        log_warning "Current length: ${#WEBHOOK_SECRET} characters"
    fi
    
    # Check if running with appropriate permissions
    if [ "$(id -u)" -eq 0 ]; then
        log_warning "Running as root - this is not recommended for security"
    fi
    
    # Check deploy directory permissions
    if [ ! -w "$DEPLOY_DIR" ]; then
        log_error "No write permission to deploy directory: $DEPLOY_DIR"
        exit 1
    fi
    
    # Validate deployment environment
    if [ ! -f "$DEPLOY_DIR/deploy.sh" ]; then
        log_error "Deploy script not found: $DEPLOY_DIR/deploy.sh"
        exit 1
    fi
    
    if [ ! -f "$DEPLOY_DIR/manage.sh" ]; then
        log_error "Management script not found: $DEPLOY_DIR/manage.sh"
        exit 1
    fi
    
    # Validate health check configuration
    if [[ ! "$HEALTH_CHECK_URL" =~ ^https?:// ]]; then
        log_error "Invalid health check URL format: $HEALTH_CHECK_URL"
        log_error "URL must start with http:// or https://"
        exit 1
    fi
    
    # Validate numeric parameters
    if ! [[ "$HEALTH_CHECK_TIMEOUT" =~ ^[0-9]+$ ]] || [ "$HEALTH_CHECK_TIMEOUT" -lt 5 ] || [ "$HEALTH_CHECK_TIMEOUT" -gt 300 ]; then
        log_error "Invalid HEALTH_CHECK_TIMEOUT: $HEALTH_CHECK_TIMEOUT (must be 5-300 seconds)"
        exit 1
    fi
    
    if ! [[ "$HEALTH_CHECK_RETRIES" =~ ^[0-9]+$ ]] || [ "$HEALTH_CHECK_RETRIES" -lt 1 ] || [ "$HEALTH_CHECK_RETRIES" -gt 20 ]; then
        log_error "Invalid HEALTH_CHECK_RETRIES: $HEALTH_CHECK_RETRIES (must be 1-20 attempts)"
        exit 1
    fi
    
    log_success "Security and configuration validation passed"
}

# Deploy function
deploy() {
    log_info "🚀 Starting deployment process..."
    
    # Run security validation first
    validate_security
    
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
    
    # Health check with configurable endpoint and retries
    log_info "🏥 Performing health check on: $HEALTH_CHECK_URL"
    log_info "⏱️ Waiting $HEALTH_CHECK_TIMEOUT seconds for services to stabilize..."
    sleep "$HEALTH_CHECK_TIMEOUT"
    
    # Perform health check with retries
    local health_check_passed=false
    for i in $(seq 1 "$HEALTH_CHECK_RETRIES"); do
        log_info "🔍 Health check attempt $i/$HEALTH_CHECK_RETRIES..."
        
        if curl -f -s --connect-timeout 10 --max-time 30 "$HEALTH_CHECK_URL" > /dev/null 2>&1; then
            log_success "✅ Health check passed on attempt $i"
            health_check_passed=true
            break
        else
            if [ "$i" -lt "$HEALTH_CHECK_RETRIES" ]; then
                log_warning "⚠️ Health check attempt $i failed, retrying in 10 seconds..."
                sleep 10
            else
                log_error "❌ All health check attempts failed ($HEALTH_CHECK_RETRIES/$HEALTH_CHECK_RETRIES)"
            fi
        fi
    done
    
    if [ "$health_check_passed" = true ]; then
        log_success "🎉 Deployment completed successfully!"
        send_notification "success" "Deployment completed successfully - Health check passed"
    else
        log_error "🚨 Health check failed after $HEALTH_CHECK_RETRIES attempts - rolling back..."
        
        # Rollback using backup
        ./manage.sh restore-latest
        
        send_notification "failure" "Deployment failed - Health check unsuccessful after $HEALTH_CHECK_RETRIES attempts"
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
                        {\"name\": \"Health Check\", \"value\": \"$HEALTH_CHECK_URL\", \"inline\": true},
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
    
    # Perform initial security validation
    if [ -z "$WEBHOOK_SECRET" ] || [ "$WEBHOOK_SECRET" = "your-webhook-secret-here" ]; then
        log_error "SECURITY BREACH ATTEMPT: Webhook secret not configured!"
        log_error "Rejecting webhook request for security reasons"
        exit 1
    fi
    
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
    "generate-secret")
        log_info "🔐 Generating secure webhook secret..."
        secret=$(openssl rand -hex 32)
        echo ""
        echo "Generated secure webhook secret (64 characters):"
        echo "WEBHOOK_SECRET=$secret"
        echo ""
        echo "Setup instructions:"
        echo "1. Set this secret on your server:"
        echo "   export WEBHOOK_SECRET=$secret"
        echo "   # Or add to /etc/environment or systemd service file"
        echo ""
        echo "2. Configure the same secret in GitHub:"
        echo "   Repository → Settings → Webhooks → Add/Edit webhook"
        echo "   Secret field: $secret"
        echo ""
        log_success "Keep this secret secure and never commit it to version control!"
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [webhook|test|generate-secret|help]"
        echo ""
        echo "Modes:"
        echo "  webhook        - Handle GitHub webhook (default)"
        echo "  test          - Test deployment manually"
        echo "  generate-secret - Generate secure webhook secret"
        echo "  help          - Show this help"
        echo ""
        echo "Environment variables:"
        echo "  WEBHOOK_SECRET      - GitHub webhook secret (REQUIRED, 32+ chars)"
        echo "  DEPLOY_BRANCH       - Branch to deploy (default: main)"
        echo "  HEALTH_CHECK_URL    - Health check endpoint (default: http://localhost/api/health)"
        echo "  HEALTH_CHECK_TIMEOUT - Seconds to wait before health check (default: 30)"
        echo "  HEALTH_CHECK_RETRIES - Number of health check attempts (default: 5)"
        echo "  DISCORD_WEBHOOK_URL - Discord webhook for notifications"
        echo "  SLACK_WEBHOOK_URL   - Slack webhook for notifications"
        echo ""
        echo "Security Setup:"
        echo "  Generate secure webhook secret:"
        echo "    export WEBHOOK_SECRET=\$(openssl rand -hex 32)"
        echo "  Or use a password manager to generate a 64+ character secret"
        echo ""
        echo "  Configure in GitHub:"
        echo "    Repository → Settings → Webhooks → Add webhook"
        echo "    Set the same secret in the webhook configuration"
        echo ""
        echo "Environment Examples:"
        echo "  # Local development"
        echo "    export HEALTH_CHECK_URL=\"http://localhost:3000/api/health\""
        echo ""
        echo "  # Production with domain"
        echo "    export HEALTH_CHECK_URL=\"https://verber.yourdomain.com/api/health\""
        echo ""
        echo "  # Docker internal network"
        echo "    export HEALTH_CHECK_URL=\"http://verber-backend:8080/api/health\""
        echo ""
        echo "  # Custom health check settings"
        echo "    export HEALTH_CHECK_TIMEOUT=60"
        echo "    export HEALTH_CHECK_RETRIES=10"
        ;;
    *)
        log_error "Unknown command: $1"
        exit 1
        ;;
esac