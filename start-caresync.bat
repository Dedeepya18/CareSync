@echo off
title CareSync - Intelligent Preventive Healthcare Platform
echo ========================================================
echo  CareSync - Full Stack Healthcare & Patient Monitoring
echo ========================================================
echo.
echo Starting Backend API Server (Port 5000)...
start "CareSync Backend Server" cmd /k "cd /d %~dp0backend && npm start"

timeout /t 3 /nobreak >nul

echo Starting Frontend Web Application (Port 5173)...
start "CareSync Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 3 /nobreak >nul

echo Launching default web browser at http://localhost:5173 ...
start http://localhost:5173

echo.
echo ========================================================
echo CareSync is now running!
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:5000
echo.
echo DEMO LOGIN CREDENTIALS:
echo   Patient: john@caresync.health   / Password123!
echo   Doctor:  dr.chen@caresync.health  / Password123!
echo   Admin:   admin@caresync.health   / AdminPassword123!
echo ========================================================
pause

