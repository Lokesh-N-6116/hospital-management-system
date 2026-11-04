@echo off
title CarePulse HMS - Frontend Client (Port 3000)
cd /d "%~dp0frontend"
echo ========================================================
echo   CarePulse Hospital Management System - Frontend App
echo ========================================================
echo Starting Vite Dev Server on http://localhost:3000 ...
npm run dev
pause
