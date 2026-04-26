# Scraper Çalıştırma Komutları

Tüm komutlar `backend/` klasöründen çalıştırılmalıdır.

---

## 1. Amazon Scraper

```bash
cd backend
venv/Scripts/python.exe services/amazon_scraper.py
```

---

## 2. IKEA Scraper

```bash
cd backend
venv/Scripts/python.exe services/ikea_scraper.py
```

---

## 3. Modalife Scraper

```bash
cd backend
venv/Scripts/python.exe services/modalife_scraper.py
```

### Tek ürün test modu (backend'e kaydeder):

```bash
venv/Scripts/python.exe services/modalife_scraper.py --once
```

---

## Hepsini Aynı Anda Çalıştır

```bash
venv/Scripts/python.exe services/run_all_scrapers.py
```

Durdurmak için `CTRL+C`.
