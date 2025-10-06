@echo off
echo 🚀 Starting French Verb Import Process
echo ========================================

echo 📋 Checking Docker containers...
docker-compose ps

echo 🗄️ Starting database if needed...
docker-compose up -d postgres

echo ⏳ Waiting for database to be ready...
timeout /t 5 /nobreak >nul

echo 🔧 Running database migration...
docker-compose exec postgres psql -U verber_user -d verber_db -f /docker-entrypoint-initdb.d/create_french_verbs_tables.sql

echo 📦 Checking Go dependencies...
cd backend
go mod tidy
cd ..

echo 📊 Compiling and running import script...
cd backend\scripts
go mod init import-verbs 2>nul
go get gorm.io/driver/postgres
go get gorm.io/gorm
go run import_verbs.go

echo ✅ Import process completed!
echo You can now verify the data by connecting to the database.
pause