@echo off
echo 🔧 QUICK SCHEMA FIX
echo.

echo Stopping any running processes...
taskkill /f /im java.exe 2>nul

echo Cleaning backend...
cd Gynassist-backend
call ./mvnw clean

echo Starting backend with schema fix...
start "Backend" cmd /k "./mvnw spring-boot:run"

echo Waiting for backend startup...
timeout /t 15

echo Testing connectivity...
node ../connectivity-probe.js

pause