@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  Torneo Los Cerezos — servidor local
echo  Abre en el navegador: http://localhost:3456
echo  (Así evitas avisos de origen con file://)
echo.
npx --yes serve@14 . -p 3456
