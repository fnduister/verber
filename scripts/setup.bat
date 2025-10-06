@echo off
REM Verber Development Setup Script for Windows
REM This script sets up the complete development environment

echo 🚀 Setting up Verber development environment...

REM Change to project root directory (parent of scripts)
cd /d "%~dp0\.."

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

echo ✅ Docker and Docker Compose are available

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating environment file...
    copy .env.example .env >nul
    if %errorlevel% equ 0 (
        echo ✅ Created .env file from .env.example
    ) else (
        echo ❌ Failed to create .env file
        pause
        exit /b 1
    )
) else (
    echo ✅ .env file already exists
)

REM Build and start the development environment
echo 🔨 Building Docker images...
docker-compose build
if %errorlevel% neq 0 (
    echo ❌ Failed to build Docker images
    pause
    exit /b 1
)

echo 🚀 Starting development environment...
docker-compose up -d
if %errorlevel% neq 0 (
    echo ❌ Failed to start containers
    pause
    exit /b 1
)

REM Wait for services to be ready
echo ⏳ Waiting for services to start...
timeout /t 15 /nobreak >nul

REM Check service health
echo 🏥 Checking service health...

echo Checking PostgreSQL...
docker-compose exec -T postgres pg_isready -U verber_user -d verber_db >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PostgreSQL is ready
) else (
    echo ❌ PostgreSQL failed to start - checking logs...
    docker-compose logs postgres | findstr /C:"ERROR" /C:"FATAL"
)

echo Checking Redis...
docker-compose exec -T redis redis-cli ping >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Redis is ready
) else (
    echo ❌ Redis failed to start - checking logs...
    docker-compose logs redis | findstr /C:"ERROR" /C:"FATAL"
)

echo Checking Backend...
REM Use PowerShell for HTTP requests since curl might not be available
powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:8080/health' -UseBasicParsing | Out-Null; exit 0 } catch { exit 1 }" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is ready
) else (
    echo ❌ Backend failed to start - checking logs...
    docker-compose logs backend | findstr /C:"ERROR" /C:"FATAL"
)

echo Checking Frontend...
powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:3000' -UseBasicParsing | Out-Null; exit 0 } catch { exit 1 }" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend is ready
) else (
    echo ❌ Frontend failed to start - checking logs...
    docker-compose logs frontend | findstr /C:"ERROR" /C:"FATAL"
)

echo.
echo 🎉 Development environment setup complete!
echo.
echo 📋 Services:
echo    Frontend:  http://localhost:3000
echo    Backend:   http://localhost:8080
echo    Database:  localhost:5432
echo    Redis:     localhost:6379
echo.
echo 📊 Management Commands:
echo    View all logs:      docker-compose logs -f
echo    View service logs:  docker-compose logs -f [service]
echo    Stop all services:  docker-compose down
echo    Restart service:    docker-compose restart [service]
echo    Rebuild service:    docker-compose build [service]
echo    Check status:       docker-compose ps
echo.
echo 🔧 Development Commands:
echo    Backend shell:      docker-compose exec backend sh
echo    Database CLI:       docker-compose exec postgres psql -U verber_user -d verber_db
echo    Redis CLI:          docker-compose exec redis redis-cli
echo.
echo 🚨 If services are not ready, wait a few moments and check:
echo    docker-compose logs -f
echo.
echo Press any key to exit...
pause >nul