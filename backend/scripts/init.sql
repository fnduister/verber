-- Verber Database Initialization Script
-- This file is automatically executed when the PostgreSQL container starts for the first time

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- The tables will be created by the Go application using GORM migrations
-- This file is mainly for any initial setup, extensions, or seed data

-- Set timezone
SET timezone = 'UTC';