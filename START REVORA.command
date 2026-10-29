#!/bin/bash
clear
cd "/Users/dudley/Desktop/claude apps/revora-bot"

echo ""
echo " ██████╗ ███████╗██╗   ██╗ ██████╗ ██████╗  █████╗ "
echo " ██╔══██╗██╔════╝██║   ██║██╔═══██╗██╔══██╗██╔══██╗"
echo " ██████╔╝█████╗  ██║   ██║██║   ██║██████╔╝███████║"
echo " ██╔══██╗██╔══╝  ╚██╗ ██╔╝██║   ██║██╔══██╗██╔══██║"
echo " ██║  ██║███████╗ ╚████╔╝ ╚██████╔╝██║  ██║██║  ██║"
echo " ╚═╝  ╚═╝╚══════╝  ╚═══╝   ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝"
echo ""
echo " Starting Revora Bot..."
echo ""

if [ ! -d "node_modules" ]; then
    echo "[Setup] Installing dependencies first..."
    npm install
    echo ""
fi

node index.js

echo ""
echo "[!] Bot stopped."
read -p "Press enter to close..."
