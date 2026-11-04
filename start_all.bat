@echo off
echo ========================================================
echo   CarePulse Hospital Management System - Complete Start
echo ========================================================
echo 1. Launching Backend Server on port 5000...
start "HMS Backend" cmd /c "%~dp0run_backend.bat"

timeout /t 3 /nobreak >nul

echo 2. Launching Frontend Dev Server on port 3000...
start "HMS Frontend" cmd /c "%~dp0run_frontend.bat"

timeout /t 3 /nobreak >nul

echo 3. Opening Application in your default browser...
start http://localhost:3000

echo.
echo Application is running!
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.
pause
