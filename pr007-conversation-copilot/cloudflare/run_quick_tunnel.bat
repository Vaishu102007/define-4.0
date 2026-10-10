@echo off
title Nimad Copilot - Cloudflare Public Tunnel
cls
echo ==========================================================
echo    NIMAD COPILOT - CLOUDFLARE PUBLIC TUNNEL LAUNCHER
echo ==========================================================
echo.
echo [1/2] Checking local backend at http://127.0.0.1:8000 ...
curl -s -o nul http://127.0.0.1:8000/healthz 2>nul
if %errorlevel% neq 0 (
    echo  - Note: FastAPI backend on 127.0.0.1:8000 is starting or offline.
    echo    Make sure uvicorn is running: python -m uvicorn app.main:app --port 8000
) else (
    echo  - Backend is ONLINE and responding!
)
echo.
echo [2/2] Starting Cloudflare Quick Tunnel forwarding to http://127.0.0.1:8000 ...
echo ----------------------------------------------------------
echo Look for the public HTTPS link ending with .trycloudflare.com below!
echo Press Ctrl+C anytime to stop the tunnel.
echo ----------------------------------------------------------
echo.

if exist "%~dp0bin\cloudflared.exe" (
    "%~dp0bin\cloudflared.exe" tunnel --url http://127.0.0.1:8000
) else (
    powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0run_quick_tunnel.ps1"
)

pause
