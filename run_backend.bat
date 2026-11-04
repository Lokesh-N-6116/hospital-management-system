@echo off
title CarePulse HMS - Backend Server (Port 5000)
cd /d "%~dp0backend"
echo ========================================================
echo   CarePulse Hospital Management System - Backend Server
echo ========================================================
echo Starting Express API on http://localhost:5000 ...
node src/server.js
pause
