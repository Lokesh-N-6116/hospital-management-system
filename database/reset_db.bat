@echo off
echo ========================================================
echo   Hospital Management System - Database Reset Utility
echo ========================================================
set MYSQL_EXE="C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
if not exist %MYSQL_EXE% (
    set MYSQL_EXE="C:\xampp\mysql\bin\mysql.exe"
)

echo Resetting hospital_db schema...
%MYSQL_EXE% -u root -p123456789 < "%~dp0schema.sql"
if %ERRORLEVEL% NEQ 0 (
    echo Error applying schema.sql
    pause
    exit /b %ERRORLEVEL%
)

echo Loading seed data...
%MYSQL_EXE% -u root -p123456789 < "%~dp0seed.sql"
if %ERRORLEVEL% NEQ 0 (
    echo Error applying seed.sql
    pause
    exit /b %ERRORLEVEL%
)

echo Database hospital_db reset and seeded successfully!
pause
