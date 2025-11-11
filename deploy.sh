#!/bin/bash

# 🚀 Verber Application Deployment Script
# This script deploys the Verber application to a production server
# Author: GitHub Copilot
# Date: October 2025

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEPLOY_DIR="/opt/verber"
DOMAIN=""
EMAIL=""
DB_PASSWORD=""
JWT_SECRET=""
BACKUP_DIR="/opt/verber-backups"

# Parse command line arguments
SKIP_SETUP=false
SKIP_INTERACTIVE=false
AUTO_DEPLOY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-setup)
            SKIP_SETUP=true
            shift
            ;;
        --skip-interactive)
            SKIP_INTERACTIVE=true
            shift
            ;;
        --auto-deploy)
            AUTO_DEPLOY=true
            SKIP_SETUP=true
            SKIP_INTERACTIVE=true
            shift
            ;;
        --domain)
            DOMAIN="$2"
            shift 2
            ;;
        --email)
            EMAIL="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --skip-setup        Skip system setup (dependencies, Docker, etc.)"
            echo "  --skip-interactive  Skip interactive prompts (use env vars)"
            echo "  --auto-deploy       Full automatic deployment (implies above options)"
            echo "  --domain DOMAIN     Set domain name"
            echo "  --email EMAIL       Set email for SSL certificate"
            echo "  --help, -h          Show this help message"
            echo ""
            echo "Environment variables:"
            echo "  VERBER_DOMAIN       Domain name"
            echo "  VERBER_EMAIL        Email for SSL"
            echo "  VERBER_DB_PASSWORD  Database password"
            echo "  VERBER_JWT_SECRET   JWT secret"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Helper functions
print_header() {
    echo -e "\n${BLUE}================================${NC}"
    echo -e "${BLUE} $1${NC}"
    echo -e "${BLUE}================================${NC}\n"
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

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_warning "Running as root - this is not recommended for production"
        print_info "Proceeding with deployment..."
        # exit 1
    fi
}

# Collect deployment information
collect_info() {
    if [ "$SKIP_INTERACTIVE" = true ]; then
        print_header "LOADING CONFIGURATION FROM ENVIRONMENT"
        
        # Load from environment variables
        DOMAIN="${VERBER_DOMAIN:-${DOMAIN}}"
        EMAIL="${VERBER_EMAIL:-${EMAIL}}"
        DB_PASSWORD="${VERBER_DB_PASSWORD:-${DB_PASSWORD}}"
        JWT_SECRET="${VERBER_JWT_SECRET:-${JWT_SECRET}}"
        
        # Check if all required variables are set
        if [[ -z "$DOMAIN" || -z "$EMAIL" || -z "$DB_PASSWORD" || -z "$JWT_SECRET" ]]; then
            print_error "Missing required environment variables for automatic deployment"
            print_info "Required: VERBER_DOMAIN, VERBER_EMAIL, VERBER_DB_PASSWORD, VERBER_JWT_SECRET"
            exit 1
        fi
        
        print_success "Configuration loaded from environment variables"
        return 0
    fi
    
    print_header "VERBER DEPLOYMENT CONFIGURATION"
    
    echo "Please provide the following information for your deployment:"
    echo ""
    
    # Domain name
    read -p "Enter your domain name (e.g., myverberapp.com): " DOMAIN
    while [[ -z "$DOMAIN" ]]; do
        print_warning "Domain name is required!"
        read -p "Enter your domain name: " DOMAIN
    done
    
    # Email for SSL
    read -p "Enter your email for SSL certificate (Let's Encrypt): " EMAIL
    while [[ -z "$EMAIL" ]]; do
        print_warning "Email is required for SSL certificate!"
        read -p "Enter your email: " EMAIL
    done
    
    # Database password
    echo ""
    print_info "Generate a secure database password (20+ characters)"
    read -s -p "Enter database password: " DB_PASSWORD
    echo ""
    while [[ ${#DB_PASSWORD} -lt 12 ]]; do
        print_warning "Password too short! Use at least 12 characters."
        read -s -p "Enter database password: " DB_PASSWORD
        echo ""
    done
    
    # JWT Secret
    echo ""
    print_info "Generate a secure JWT secret (64+ characters)"
    read -s -p "Enter JWT secret: " JWT_SECRET
    echo ""
    while [[ ${#JWT_SECRET} -lt 32 ]]; do
        print_warning "JWT secret too short! Use at least 32 characters."
        read -s -p "Enter JWT secret: " JWT_SECRET
        echo ""
    done
    
    echo ""
    print_success "Configuration collected successfully!"
}

# Install system dependencies
install_dependencies() {
    print_header "INSTALLING SYSTEM DEPENDENCIES"
    
    # Update system
    print_info "Updating system packages..."
    sudo apt update && sudo apt upgrade -y
    
    # Install basic tools
    print_info "Installing basic tools..."
    sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
    
    # Install Docker
    print_info "Installing Docker..."
    if ! command -v docker &> /dev/null; then
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        rm get-docker.sh
        print_success "Docker installed successfully"
    else
        print_success "Docker already installed"
    fi
    
    # Install Docker Compose
    print_info "Installing Docker Compose..."
    if ! command -v docker-compose &> /dev/null; then
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
        print_success "Docker Compose installed successfully"
    else
        print_success "Docker Compose already installed"
    fi
    
    # Install Nginx
    print_info "Installing Nginx..."
    if ! command -v nginx &> /dev/null; then
        sudo apt install -y nginx
        print_success "Nginx installed successfully"
    else
        print_success "Nginx already installed"
    fi
    
    # Install Certbot for SSL
    print_info "Installing Certbot for SSL..."
    if ! command -v certbot &> /dev/null; then
        sudo apt install -y certbot python3-certbot-nginx
        print_success "Certbot installed successfully"
    else
        print_success "Certbot already installed"
    fi
    
    print_success "All dependencies installed!"
}

# Setup firewall
setup_firewall() {
    print_header "CONFIGURING FIREWALL"
    
    # Configure UFW
    print_info "Setting up firewall rules..."
    sudo ufw --force reset
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    sudo ufw allow ssh
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw --force enable
    
    print_success "Firewall configured successfully!"
}

# Deploy application
deploy_application() {
    print_header "DEPLOYING VERBER APPLICATION"
    
    # Create deployment directory
    print_info "Creating deployment directory..."
    sudo mkdir -p $DEPLOY_DIR
    sudo chown $USER:$USER $DEPLOY_DIR
    
    # Create backup directory
    print_info "Creating backup directory..."
    sudo mkdir -p $BACKUP_DIR
    sudo chown $USER:$USER $BACKUP_DIR
    
    # Clone or update repository
    if [[ -d "$DEPLOY_DIR/.git" ]]; then
        print_info "Updating existing repository..."
        cd $DEPLOY_DIR
        git pull
    else
        print_info "Cloning repository..."
        # Note: You'll need to replace this with your actual git repository URL
        print_warning "Please manually clone your repository to $DEPLOY_DIR"
        print_info "Run: git clone <your-repo-url> $DEPLOY_DIR"
        print_info "Then re-run this script with --skip-clone flag"
        exit 1
    fi
    
    cd $DEPLOY_DIR
    
    # Create production environment file
    print_info "Creating production environment file..."
    create_production_env
    
    # Build and start services
    print_info "Building and starting Docker services..."
    docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
    docker-compose -f docker-compose.prod.yml up -d --build
    
    # Wait for services to be ready
    print_info "Waiting for services to start..."
    sleep 30
    
    # Check service health
    if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        print_success "Docker services started successfully!"
    else
        print_error "Some services failed to start. Check logs with:"
        print_info "docker-compose -f docker-compose.prod.yml logs"
        exit 1
    fi
}

# Create production environment file
create_production_env() {
    cat > .env << EOF
# Production Environment Configuration
# Generated by deployment script on $(date)

# Database Configuration
POSTGRES_USER=verber_user
POSTGRES_PASSWORD=$DB_PASSWORD
POSTGRES_DB=verber_db

# Security Configuration
JWT_SECRET=$JWT_SECRET

# Application URLs
FRONTEND_URL=https://$DOMAIN
REACT_APP_API_URL=https://$DOMAIN/api
REACT_APP_WS_URL=wss://$DOMAIN

# Environment
ENVIRONMENT=production
EOF

    print_success "Production environment file created"
}

# Setup Nginx reverse proxy
setup_nginx() {
    print_header "CONFIGURING NGINX REVERSE PROXY"
    
    # Create Nginx configuration
    print_info "Creating Nginx configuration..."
    sudo tee /etc/nginx/sites-available/verber > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Frontend
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 86400;
    }
    
    # WebSocket connections
    location /ws {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 86400;
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    # 'must-revalidate' is not a valid token for gzip_proxied in some nginx versions
    # remove it to avoid startup failures (was causing: invalid value "must-revalidate")
    gzip_proxied expired no-cache no-store private auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/x-javascript
        application/xml+rss
        application/javascript
        application/json;
}
EOF
    
    # Enable the site
    sudo ln -sf /etc/nginx/sites-available/verber /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test Nginx configuration
    if sudo nginx -t; then
        print_success "Nginx configuration is valid"
        sudo systemctl reload nginx
    else
        print_error "Nginx configuration is invalid"
        exit 1
    fi
    
    print_success "Nginx reverse proxy configured!"
}

# Setup SSL certificate
setup_ssl() {
    print_header "SETTING UP SSL CERTIFICATE"
    
    # Get SSL certificate
    print_info "Requesting SSL certificate from Let's Encrypt..."
    sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive
    
    if [[ $? -eq 0 ]]; then
        print_success "SSL certificate installed successfully!"
    else
        print_error "Failed to install SSL certificate"
        print_info "You can try manually with: sudo certbot --nginx -d $DOMAIN"
        return 1
    fi
    
    # Setup auto-renewal
    print_info "Setting up certificate auto-renewal..."
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
    
    print_success "SSL certificate auto-renewal configured!"
}

# Create management scripts
create_management_scripts() {
    print_header "CREATING MANAGEMENT SCRIPTS"
    
    # Create backup script
    cat > $DEPLOY_DIR/backup.sh << 'EOF'
#!/bin/bash
# Verber Database Backup Script

BACKUP_DIR="/opt/verber-backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/verber_backup_$DATE.sql"

echo "Creating database backup..."
docker exec verber-postgres-prod pg_dump -U verber_user verber_db > "$BACKUP_FILE"

if [[ $? -eq 0 ]]; then
    echo "✅ Backup created: $BACKUP_FILE"
    
    # Compress backup
    gzip "$BACKUP_FILE"
    echo "✅ Backup compressed: $BACKUP_FILE.gz"
    
    # Keep only last 7 days of backups
    find $BACKUP_DIR -name "verber_backup_*.sql.gz" -mtime +7 -delete
    echo "✅ Old backups cleaned up"
else
    echo "❌ Backup failed"
    exit 1
fi
EOF

    # Create update script
    cat > $DEPLOY_DIR/update.sh << 'EOF'
#!/bin/bash
# Verber Application Update Script

DEPLOY_DIR="/opt/verber"
cd $DEPLOY_DIR

echo "🔄 Updating Verber application..."

# Create backup before update
echo "📦 Creating backup..."
./backup.sh

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull

# Rebuild and restart containers
echo "🐳 Rebuilding containers..."
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for services
echo "⏳ Waiting for services to start..."
sleep 30

# Check health
if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    echo "✅ Update completed successfully!"
else
    echo "❌ Update failed. Check logs:"
    echo "docker-compose -f docker-compose.prod.yml logs"
    exit 1
fi
EOF

    # Create monitoring script
    cat > $DEPLOY_DIR/monitor.sh << 'EOF'
#!/bin/bash
# Verber Application Monitoring Script

echo "📊 Verber Application Status"
echo "========================="

# Check Docker containers
echo "🐳 Docker Containers:"
docker-compose -f /opt/verber/docker-compose.prod.yml ps

echo ""
echo "💾 Disk Usage:"
df -h /opt/verber

echo ""
echo "🧠 Memory Usage:"
free -h

echo ""
echo "⚡ CPU Usage:"
top -bn1 | grep "Cpu(s)"

echo ""
echo "🌐 Nginx Status:"
sudo systemctl status nginx --no-pager -l

echo ""
echo "🔒 SSL Certificate Status:"
sudo certbot certificates

echo ""
echo "📋 Recent Application Logs (last 10 lines):"
docker-compose -f /opt/verber/docker-compose.prod.yml logs --tail=10
EOF

    # Make scripts executable
    chmod +x $DEPLOY_DIR/backup.sh
    chmod +x $DEPLOY_DIR/update.sh
    chmod +x $DEPLOY_DIR/monitor.sh
    
    # Setup automated backups
    print_info "Setting up automated daily backups..."
    (crontab -l 2>/dev/null; echo "0 2 * * * $DEPLOY_DIR/backup.sh") | crontab -
    
    print_success "Management scripts created!"
    print_info "Available scripts:"
    print_info "  - $DEPLOY_DIR/backup.sh   - Manual database backup"
    print_info "  - $DEPLOY_DIR/update.sh   - Update application"
    print_info "  - $DEPLOY_DIR/monitor.sh  - Check system status"
}

# Print final instructions
print_final_instructions() {
    print_header "DEPLOYMENT COMPLETED SUCCESSFULLY! 🎉"
    
    echo "Your Verber application is now running at:"
    echo "🌐 https://$DOMAIN"
    echo ""
    
    echo "📋 Important Information:"
    echo "  • Application Directory: $DEPLOY_DIR"
    echo "  • Backup Directory: $BACKUP_DIR"
    echo "  • Nginx Config: /etc/nginx/sites-available/verber"
    echo "  • Environment File: $DEPLOY_DIR/.env"
    echo ""
    
    echo "🛠️  Management Commands:"
    echo "  • View logs: cd $DEPLOY_DIR && docker-compose -f docker-compose.prod.yml logs -f"
    echo "  • Restart services: cd $DEPLOY_DIR && docker-compose -f docker-compose.prod.yml restart"
    echo "  • Update app: $DEPLOY_DIR/update.sh"
    echo "  • Create backup: $DEPLOY_DIR/backup.sh"
    echo "  • Monitor status: $DEPLOY_DIR/monitor.sh"
    echo ""
    
    echo "🔧 Useful Docker Commands:"
    echo "  • Check containers: docker-compose -f docker-compose.prod.yml ps"
    echo "  • View specific logs: docker logs verber-frontend-prod"
    echo "  • Access database: docker exec -it verber-postgres-prod psql -U verber_user verber_db"
    echo ""
    
    print_warning "IMPORTANT SECURITY NOTES:"
    echo "  • Your database password and JWT secret are stored in $DEPLOY_DIR/.env"
    echo "  • Keep these credentials secure and backed up"
    echo "  • Regular backups are scheduled daily at 2:00 AM"
    echo "  • SSL certificate will auto-renew via cron job"
    echo ""
    
    print_success "Deployment completed! Your Verber application is ready for production use."
}

# Main deployment flow
main() {
    print_header "VERBER APPLICATION DEPLOYMENT"
    print_info "This script will deploy Verber to your production server"
    echo ""
    
    # Check if --skip-clone flag is provided
    SKIP_CLONE=false
    if [[ "$1" == "--skip-clone" ]]; then
        SKIP_CLONE=true
        print_info "Skipping repository clone step"
    fi
    
    # Confirm deployment
    read -p "Are you ready to proceed with deployment? (y/N): " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        print_info "Deployment cancelled"
        exit 0
    fi
    
    # Run deployment steps
    check_root
    collect_info
    install_dependencies
    setup_firewall
    
    if [[ "$SKIP_CLONE" == true ]]; then
        # Skip clone step, go directly to env setup
        cd $DEPLOY_DIR
        create_production_env
        docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
        docker-compose -f docker-compose.prod.yml up -d --build
    else
        deploy_application
    fi
    
    setup_nginx
    setup_ssl
    create_management_scripts
    print_final_instructions
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Verber Deployment Script"
        echo ""
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --skip-clone   Skip git clone step (use if repo already exists)"
        echo ""
        echo "Example:"
        echo "  $0                 # Full deployment"
        echo "  $0 --skip-clone    # Deploy without cloning repo"
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac