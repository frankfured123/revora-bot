@echo off
title Revora Bot
color 04

cd /d "%~dp0"

:: Check Node is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Get it at https://nodejs.org
    pause
    exit /b
)

:: Install packages if node_modules missing
if not exist "node_modules" (
    echo [Setup] Installing dependencies...
    npm install
)

:: Write .env if it doesn't exist
if not exist ".env" (
    echo [Setup] Creating .env — fill in your values then restart.
    (
        echo DISCORD_TOKEN=PASTE_YOUR_NEW_TOKEN_HERE
        echo CLIENT_ID=your_client_id_here
        echo CLIENT_SECRET=your_client_secret_here
        echo REDIRECT_URI=http://localhost:3000/verify
        echo PORT=3000
        echo GUILD_ID=your_guild_id_here
    ) > .env
    echo [Setup] .env created. Open it and fill in your details, then run this file again.
    pause
    exit /b
)

echo.
echo  ██████╗ ███████╗██╗   ██╗ ██████╗ ██████╗  █████╗
echo  ██╔══██╗██╔════╝██║   ██║██╔═══██╗██╔══██╗██╔══██╗
echo  ██████╔╝█████╗  ██║   ██║██║   ██║██████╔╝███████║
echo  ██╔══██╗██╔══╝  ╚██╗ ██╔╝██║   ██║██╔══██╗██╔══██║
echo  ██║  ██║███████╗ ╚████╔╝ ╚██████╔╝██║  ██║██║  ██║
echo  ╚═╝  ╚═╝╚══════╝  ╚═══╝   ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝
echo.
echo  Starting Revora Bot...
echo  Press Ctrl+C to stop.
echo.

node index.js

echo.
echo [!] Bot stopped or crashed.
pause
