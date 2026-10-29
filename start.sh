#!/bin/bash
clear

echo ""
echo " ██████╗ ███████╗██╗   ██╗ ██████╗ ██████╗  █████╗ "
echo " ██╔══██╗██╔════╝██║   ██║██╔═══██╗██╔══██╗██╔══██╗"
echo " ██████╔╝█████╗  ██║   ██║██║   ██║██████╔╝███████║"
echo " ██╔══██╗██╔══╝  ╚██╗ ██╔╝██║   ██║██╔══██╗██╔══██║"
echo " ██║  ██║███████╗ ╚████╔╝ ╚██████╔╝██║  ██║██║  ██║"
echo " ╚═╝  ╚═╝╚══════╝  ╚═══╝   ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝"
echo ""

# Go to bot folder
cd "/Users/dudley/Desktop/claude apps/revora-bot"

# Check Node is installed
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed. Get it at https://nodejs.org"
    read -p "Press enter to exit..."
    exit 1
fi

# Install packages if discord.js is missing
if [ ! -d "node_modules/discord.js" ]; then
    echo "[Setup] Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "[ERROR] npm install failed. See above for details."
        read -p "Press enter to exit..."
        exit 1
    fi
fi

echo " Starting Revora Bot..."
echo " Press Ctrl+C to stop."
echo ""

node index.js

echo ""
echo "[!] Bot stopped or crashed."
read -p "Press enter to exit..."
