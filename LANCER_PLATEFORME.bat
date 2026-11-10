@echo off
title HUMA-LOG SURGICAL-VLA & CVAT AI Studio
color 0B

echo ===================================================================
echo     LANCEMENT EN 1 CLIC : HUMA-LOG SURGICAL-VLA & CVAT AI STUDIO
echo ===================================================================
echo.

:: Se positionner dans le dossier du projet
cd /d "%~dp0"

:: 1. Demarrage du Backend FastAPI (Port 8000)
echo [*] 1/3 Lancement du Backend FastAPI sur le port 8000...
start "HUMA-LOG Backend [FastAPI]" cmd /k "cd /d %~dp0backend && .venv\Scripts\python.exe -m uvicorn app.main:app --port 8000 --reload"

:: 2. Demarrage du Frontend Vite (Port 5173)
echo [*] 2/3 Lancement du Frontend Vite sur le port 5173...
start "HUMA-LOG Frontend [Vite React]" cmd /k "cd /d %~dp0 && npm run dev"

:: 3. Attente et ouverture automatique du navigateur
echo [*] 3/3 En attente de l'initialisation des serveurs...
timeout /t 4 /nobreak >nul

echo [*] Ouverture de l'application dans votre navigateur...
start http://localhost:5173

echo.
echo ===================================================================
echo   [OK] Plateforme prete et lancee avec succes !
echo.
echo   - Interface Web (Studio & 3D) : http://localhost:5173
echo   - Documentation API Backend   : http://127.0.0.1:8000/docs
echo.
echo   (Pour fermer la plateforme, fermez les fenetres ou lancez
echo    ARRETER_PLATEFORME.bat)
echo ===================================================================
echo.
pause
