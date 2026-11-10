@echo off
title Arret de HUMA-LOG Platform
color 0C

echo ===================================================================
echo     ARRET DES SERVEURS HUMA-LOG (FastAPI & Vite)
echo ===================================================================
echo.

echo [*] Fermeture du port 8000 (Backend FastAPI)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo [*] Fermeture du port 5173 (Frontend Vite)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo.
echo [OK] Tous les serveurs ont ete arretes proprement.
echo.
pause
