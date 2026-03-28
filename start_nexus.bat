@echo off
title Project Nexus Baslatici
color 0a

echo ==================================================
echo.
echo          PROJECT NEXUS BASLATILIYOR 
echo.
echo ==================================================
echo.

echo [1/2] Backend (FastAPI) Sunucusu ayaga kaldiriliyor...
start "Nexus Backend (FastAPI)" cmd /k "cd backend && call venv\Scripts\activate.bat && python -m uvicorn main:app --reload"

timeout /t 3 /nobreak >nul

echo [2/2] Frontend (React Native/Expo) ayaga kaldiriliyor...
start "Nexus Frontend (Expo)" cmd /k "cd projectnexus && npm start -- -c"

echo.
echo ==================================================
echo islem tamamlandi! 
echo.
echo 1. Backend penceresinde FastAPI loglarini gorebilirsiniz.
echo 2. Frontend penceresinde Metro Bundler (Expo) loglari yer almakta.
echo 3. Emulatorde uygulamayi calistirmak icin Frontend penceresine gecip 'a' (Android) veya 'i' (iOS) tusuna basabilirsiniz.
echo ==================================================
echo.
pause
