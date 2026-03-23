@echo off
echo ==============================================
echo 🚀 NEXUS PROJESI BASLATILIYOR 🚀
echo ==============================================

:: 1. PostgreSQL Servisini Kontrol Et ve Baslat (Eger durmussa)
echo.
echo [1/3] Veritabani (PostgreSQL) kontrol ediliyor...
sc query "postgresql-x64-16" >nul 2>&1
if %errorlevel% neq 0 (
    echo ...PostgreSQL servisi zaten calisiyor.
) else (
    echo ...PostgreSQL baslatiliyor...
    net start postgresql-x64-16
)

:: 2. Python Backend'i Yeni Bir Pencerede Baslat
echo.
echo [2/3] FastAPI Backend baslatiliyor (Terminal 2)...
cd backend
start cmd /k "title FastAPI Backend && echo [FastAPI Backend] && .\venv\Scripts\activate && uvicorn main:app --reload --port 8000"
cd ..

:: 3. React Native / Expo Frontend'i Yeni Bir Pencerede Baslat
echo.
echo [3/3] React Native / Expo Frontend baslatiliyor (Terminal 3)...
echo Android Emulator icin port yonlendirmesi yapiliyor (adb reverse)...
%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe reverse tcp:8081 tcp:8081

cd projectnexus
start cmd /k "title Expo Frontend && echo [Expo Frontend] && npx expo start --go --localhost -c"
cd ..

echo.
echo ==============================================
echo ✅ TUM SERVISLER BASLATILDI
echo ==============================================
echo - Backend (Swagger): http://localhost:8000/docs
echo - Frontend (Metro): Yeni acilan pencereden 'a'ya basarak Android'i baslatabilirsiniz.
echo ==============================================
pause
