#!/bin/bash

# Verber Deployment Pipeline Script
# This script helps promote changes from staging to production

echo "🚀 Verber Deployment Pipeline"
echo "=============================="

case "$1" in
    "staging")
        echo "📦 Deploying to STAGING..."
        cd /home/fndui/projects/verber
        
        # Build and start staging
        ./staging.sh build
        
        echo "✅ Staging deployment complete!"
        echo "🌐 Test at: https://verber.stage.sicole.com"
        ;;
    
    "production")
        echo "⚠️  Deploying to PRODUCTION..."
        echo "This will update the live site at https://verber.sicole.com"
        read -p "Are you sure? (y/N): " confirm
        
        if [[ $confirm =~ ^[Yy]$ ]]; then
            cd /home/fndui/projects/verber
            
            # Build and restart production
            docker-compose build
            docker-compose up -d
            
            echo "✅ Production deployment complete!"
            echo "🌐 Live at: https://verber.sicole.com"
        else
            echo "❌ Production deployment cancelled"
        fi
        ;;
    
    "promote")
        echo "📈 Promoting STAGING to PRODUCTION..."
        echo "This will copy staging environment to production"
        read -p "Continue? (y/N): " confirm
        
        if [[ $confirm =~ ^[Yy]$ ]]; then
            cd /home/fndui/projects/verber
            
            # Stop production
            docker-compose down
            
            # Build and start production with latest code
            docker-compose build
            docker-compose up -d
            
            echo "✅ Staging promoted to production!"
            echo "🌐 Live at: https://verber.sicole.com"
        else
            echo "❌ Promotion cancelled"
        fi
        ;;
    
    "status")
        echo "📊 Environment Status:"
        echo ""
        echo "STAGING (verber.stage.sicole.com):"
        cd /home/fndui/projects/verber && ./staging.sh status
        echo ""
        echo "PRODUCTION (verber.sicole.com):"
        docker-compose ps
        ;;
    
    *)
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  staging     - Deploy to staging environment"
        echo "  production  - Deploy directly to production"
        echo "  promote     - Promote staging to production"
        echo "  status      - Show status of both environments"
        echo ""
        echo "Typical workflow:"
        echo "  1. ./deploy.sh staging    # Deploy and test changes"
        echo "  2. ./deploy.sh promote    # Promote to production"
        ;;
esac