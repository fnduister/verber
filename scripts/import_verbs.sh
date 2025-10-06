#!/bin/bash

# Script to import French verbs into the database

echo "🚀 Starting French Verb Import Process"
echo "========================================"

# Check if Docker is running
echo "📋 Checking Docker containers..."
docker-compose ps

# Make sure the database is running
echo "🗄️ Starting database if needed..."
docker-compose up -d postgres

# Wait a moment for the database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# Run the migration script first
echo "🔧 Running database migration..."
docker-compose exec postgres psql -U verber_user -d verber_db -f /docker-entrypoint-initdb.d/create_french_verbs_tables.sql

# Check if Go dependencies are up to date
echo "📦 Checking Go dependencies..."
cd backend && go mod tidy && cd ..

# Compile and run the import script
echo "📊 Compiling and running import script..."
cd backend/scripts
go mod init import-verbs 2>/dev/null || true
go get gorm.io/driver/postgres
go get gorm.io/gorm
go run import_verbs.go

echo "✅ Import process completed!"
echo "You can now verify the data by connecting to the database."