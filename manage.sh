#!/bin/bash

# 🔧 Verber Server Management Helper
# Quick commands for managing your deployed Verber application

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

DEPLOY_DIR="/opt/verber"

show_help() {
    echo "🔧 Verber Server Management Helper"
    echo ""
    echo "Usage: $0 <command>"
    echo ""
    echo "Commands:"
    echo "  status     - Show application status"
    echo "  logs       - Show application logs"
    echo "  restart    - Restart all services"
    echo "  update     - Update application"
    echo "  backup     - Create database backup"
    echo "  restore    - Restore from backup"
    echo "  ssl        - Check/renew SSL certificate"
    echo "  cleanup    - Clean up old Docker images"
    echo "  monitor    - Real-time monitoring"
    echo "  help       - Show this help message"
    echo ""
}

check_deploy_dir() {
    if [[ ! -d "$DEPLOY_DIR" ]]; then
        echo -e "${RED}❌ Deploy directory not found: $DEPLOY_DIR${NC}"
        echo "Make sure Verber is deployed using the deployment script."
        exit 1
    fi
    cd $DEPLOY_DIR
}

show_status() {
    echo -e "${BLUE}📊 Verber Application Status${NC}"
    echo "==============================="
    
    # Docker containers
    echo -e "\n${YELLOW}🐳 Docker Containers:${NC}"
    docker-compose -f docker-compose.prod.yml ps
    
    # System resources
    echo -e "\n${YELLOW}💾 System Resources:${NC}"
    echo "Disk Usage: $(df -h /opt/verber | tail -1 | awk '{print $5 " used of " $2}')"
    echo "Memory: $(free -h | grep '^Mem:' | awk '{print $3 " used of " $2}')"
    echo "Load: $(uptime | awk -F'load average:' '{print $2}')"
    
    # Service health
    echo -e "\n${YELLOW}🌐 Service Health:${NC}"
    if curl -s -o /dev/null -w "%{http_code}" localhost:3000 | grep -q "200\|301\|302"; then
        echo -e "${GREEN}✅ Frontend: OK${NC}"
    else
        echo -e "${RED}❌ Frontend: DOWN${NC}"
    fi
    
    if curl -s -o /dev/null -w "%{http_code}" localhost:8080/api/health | grep -q "200"; then
        echo -e "${GREEN}✅ Backend: OK${NC}"
    else
        echo -e "${RED}❌ Backend: DOWN${NC}"
    fi
    
    # SSL status
    echo -e "\n${YELLOW}🔒 SSL Certificate:${NC}"
    if command -v certbot &> /dev/null; then
        sudo certbot certificates 2>/dev/null | grep -A3 "Certificate Name" | head -4 || echo "No certificates found"
    else
        echo "Certbot not installed"
    fi
}

show_logs() {
    echo -e "${BLUE}📋 Application Logs${NC}"
    echo "==================="
    echo "Press Ctrl+C to exit"
    echo ""
    
    docker-compose -f docker-compose.prod.yml logs -f --tail=50
}

restart_services() {
    echo -e "${BLUE}🔄 Restarting Verber Services${NC}"
    echo "=============================="
    
    echo "Stopping services..."
    docker compose -f docker-compose.prod.yml down
    
    echo "Starting services..."
    docker compose -f docker-compose.prod.yml up --build -d
    
    echo "Waiting for services to start..."
    sleep 20
    
    echo -e "${GREEN}✅ Services restarted${NC}"
    show_status
}

update_app() {
    echo -e "${BLUE}🔄 Updating Verber Application${NC}"
    echo "==============================="
    
    # Create backup first
    echo "Creating backup..."
    ./backup.sh
    
    # Pull latest changes
    echo "Pulling latest code..."
    git pull
    
    # Rebuild containers
    echo "Rebuilding containers..."
    docker-compose -f docker-compose.prod.yml up -d --build
    
    # Wait and check
    echo "Waiting for services..."
    sleep 30
    
    if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        echo -e "${GREEN}✅ Update completed successfully${NC}"
    else
        echo -e "${RED}❌ Update failed. Check logs${NC}"
        exit 1
    fi
}

create_backup() {
    echo -e "${BLUE}📦 Creating Database Backup${NC}"
    echo "============================"
    
    ./backup.sh
}

restore_backup() {
    echo -e "${BLUE}🔙 Database Restore${NC}"
    echo "==================="
    
    # List available backups
    echo "Available backups:"
    ls -la /opt/verber-backups/*.sql.gz 2>/dev/null | tail -10 || {
        echo "No backups found in /opt/verber-backups/"
        exit 1
    }
    
    echo ""
    read -p "Enter backup filename (without path): " backup_file
    
    backup_path="/opt/verber-backups/$backup_file"
    if [[ ! -f "$backup_path" ]]; then
        echo -e "${RED}❌ Backup file not found: $backup_path${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}⚠️  This will overwrite the current database!${NC}"
    read -p "Are you sure? (yes/no): " confirm
    
    if [[ "$confirm" == "yes" ]]; then
        echo "Restoring backup..."
        gunzip -c "$backup_path" | docker exec -i verber-postgres-prod psql -U verber_user verber_db
        echo -e "${GREEN}✅ Backup restored${NC}"
    else
        echo "Restore cancelled"
    fi
}

check_ssl() {
    echo -e "${BLUE}🔒 SSL Certificate Management${NC}"
    echo "============================="
    
    if command -v certbot &> /dev/null; then
        echo "Current certificates:"
        sudo certbot certificates
        
        echo ""
        read -p "Renew certificates? (y/n): " renew
        if [[ "$renew" =~ ^[Yy]$ ]]; then
            sudo certbot renew
            sudo systemctl reload nginx
            echo -e "${GREEN}✅ Certificates renewed${NC}"
        fi
    else
        echo -e "${RED}❌ Certbot not installed${NC}"
    fi
}

cleanup_docker() {
    echo -e "${BLUE}🧹 Docker Cleanup${NC}"
    echo "================="
    
    echo "Current Docker usage:"
    docker system df
    
    echo ""
    read -p "Clean up unused Docker images? (y/n): " cleanup
    if [[ "$cleanup" =~ ^[Yy]$ ]]; then
        docker system prune -a -f
        docker volume prune -f
        echo -e "${GREEN}✅ Docker cleanup completed${NC}"
    fi
}

monitor_realtime() {
    echo -e "${BLUE}📊 Real-time Monitoring${NC}"
    echo "======================"
    echo "Press Ctrl+C to exit"
    echo ""
    
    while true; do
        clear
        show_status
        echo ""
        echo "🔄 Refreshing in 5 seconds..."
        sleep 5
    done
}

# Main script logic
case "${1:-}" in
    status|st)
        check_deploy_dir
        show_status
        ;;
    logs|log)
        check_deploy_dir
        show_logs
        ;;
    restart|rs)
        check_deploy_dir
        restart_services
        ;;
    update|up)
        check_deploy_dir
        update_app
        ;;
    backup|bk)
        check_deploy_dir
        create_backup
        ;;
    restore|rt)
        check_deploy_dir
        restore_backup
        ;;
    ssl)
        check_ssl
        ;;
    cleanup|clean)
        cleanup_docker
        ;;
    monitor|mon)
        check_deploy_dir
        monitor_realtime
        ;;
    help|--help|-h|"")
        show_help
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac