@echo off
cd /d "%~dp0"
where node >nul 2>nul
if %errorlevel%==0 (set "NODE_CMD=node") else (set "NODE_CMD=C:\Users\MAHESH\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe")
"%NODE_CMD%" test\smoke.js
pause
