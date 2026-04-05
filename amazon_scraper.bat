@echo off
echo ============================================
echo   Amazon Scraper Baslatiliyor...
echo ============================================
echo.

cd /d D:\contanier\nexus\backend

call venv\Scripts\activate.bat

echo [OK] Sanal ortam aktif edildi.
echo [OK] Amazon scraper baslatiliyor...
echo.

python services\amazon_scraper.py

pause
