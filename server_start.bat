@echo off
cd /d "%~dp0"
title VenzoSmart Server

echo ========================================================
echo           VenzoSmart Restaurant Server
echo ========================================================
echo.

IF NOT EXIST "dist\server\node-build.mjs" (
    echo [INFO] First time setup: Building application...
    call npm run build
    echo.
)

npm start

pause
