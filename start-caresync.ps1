# CareSync 1-Click PowerShell Startup Script
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " CareSync - Intelligent Preventive Healthcare Platform" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Starting Backend API Server on Port 5000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir\backend'; npm start"

Start-Sleep -Seconds 3

Write-Host "Starting Frontend Vite Development Server on Port 5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir\frontend'; npm run dev"

Start-Sleep -Seconds 3

Write-Host "Launching CareSync in default browser..." -ForegroundColor Green
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "CareSync is actively running!" -ForegroundColor Green
Write-Host "Frontend:    http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend API: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "DEMO CREDENTIALS:" -ForegroundColor Yellow
Write-Host "  Patient: john@caresync.health   / Password123!"
Write-Host "  Doctor:  dr.chen@caresync.health  / Password123!"
Write-Host "  Admin:   admin@caresync.health   / AdminPassword123!"

