#!/bin/bash

# Verber Staging Environment Management Script
# Usage: ./staging.sh [up|down|restart|build|logs|status]

COMPOSE_FILE="docker-compose.staging.yml"
ENV_FILE=".env.staging"

cd /home/fndui/projects/verber

case "$1" in
    "up")
        echo "🚀 Starting staging environment..."
        docker-compose --env-file $ENV_FILE -f $COMPOSE_FILE up -d
        echo "✅ Staging environment started"
        echo "🌐 Staging URL: https://verber.stage.sicole.com"
        ;;
    
    "down")
        echo "⏹️  Stopping staging environment..."
        docker-compose --env-file $ENV_FILE -f $COMPOSE_FILE down
        echo "✅ Staging environment stopped"
        ;;
    
    "restart")
        echo "🔄 Restarting staging environment..."
        docker-compose --env-file $ENV_FILE -f $COMPOSE_FILE restart
        echo "✅ Staging environment restarted"
        ;;
    
    "build")
        echo "🔧 Building staging environment..."
        docker-compose --env-file $ENV_FILE -f $COMPOSE_FILE build
        docker-compose --env-file $ENV_FILE -f $COMPOSE_FILE up -d
        echo "✅ Staging environment built and started"
        ;;
    
    "logs")
        SERVICE=${2:-""}
        if [ -z "$SERVICE" ]; then
            echo "📊 Showing all staging logs..."
            docker-compose --env-file $ENV_FILE -f $COMPOSE_FILE logs -f
        else
            echo "📊 Showing logs for $SERVICE..."
            docker-compose --env-file $ENV_FILE -f $COMPOSE_FILE logs -f $SERVICE-staging
        fi
        ;;
    
    "status")
        echo "📈 Staging environment status:"
        docker-compose --env-file $ENV_FILE -f $COMPOSE_FILE ps
        ;;
    
    "import-verbs")
        echo "📚 Importing verbs to staging database..."
        docker-compose --env-file $ENV_FILE -f $COMPOSE_FILE exec backend-staging sh -c 'cd /app && go run scripts/import_verbs.go'
        echo "✅ Verbs imported to staging"
        ;;
    
    "shell")
        SERVICE=${2:-"backend"}
        echo "🐚 Opening shell in staging $SERVICE..."
        docker-compose --env-file $ENV_FILE -f $COMPOSE_FILE exec $SERVICE-staging sh
        ;;
    
    *)
        echo "Verber Staging Environment Manager"
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  up           - Start staging environment"
        echo "  down         - Stop staging environment"  
        echo "  restart      - Restart all services"
        echo "  build        - Build and start services"
        echo "  logs [svc]   - Show logs (optionally for specific service)"
        echo "  status       - Show container status"
        echo "  import-verbs - Import verb data to staging DB"
        echo "  shell [svc]  - Open shell in service (default: backend)"
        echo ""
        echo "🌐 Staging URL: https://verber.stage.sicole.com"
        echo "📊 Production URL: https://verber.sicole.com"
        ;;
esac