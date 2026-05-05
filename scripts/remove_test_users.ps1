#!/usr/bin/env pwsh
# Remove test users created by multiplayer test scripts
# Test users are identified by @example.com email addresses

$container = "verber-postgres"
$dbUser = "verber_user"
$dbName = "verber_db"

Write-Host "=== Test User Cleanup ===" -ForegroundColor Cyan

# Preview what will be removed
Write-Host "`nTest users to be removed:" -ForegroundColor Yellow
docker exec $container psql -U $dbUser -d $dbName -c `
    "SELECT id, username, email, created_at FROM users WHERE email LIKE '%@example.com' ORDER BY created_at;"

$count = docker exec $container psql -U $dbUser -d $dbName -t -c `
    "SELECT COUNT(*) FROM users WHERE email LIKE '%@example.com';"
$count = $count.Trim()

if ($count -eq "0") {
    Write-Host "`nNo test users found. Nothing to do." -ForegroundColor Green
    exit 0
}

Write-Host "`nFound $count test user(s) to remove." -ForegroundColor Yellow
$confirm = Read-Host "Proceed with deletion? (y/N)"

if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "Aborted." -ForegroundColor Red
    exit 0
}

# Run the SQL cleanup script
Write-Host "`nRemoving test users..." -ForegroundColor Cyan
$scriptPath = Join-Path $PSScriptRoot "remove_test_users.sql"
Get-Content $scriptPath | docker exec -i $container psql -U $dbUser -d $dbName

Write-Host "`nDone." -ForegroundColor Green
