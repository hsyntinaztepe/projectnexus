# Project Nexus

**3D Model Destekli Mobilya E-Ticaret Platformu**

Kullanıcıların mobilya ürünlerini satın almadan önce gerçekçi 3D modeller üzerinden inceleyebildiği, yapay zeka destekli mobil alışveriş uygulaması.

---

## Ekran Görüntüleri & Demo Videoları

- [1. Video](https://youtu.be/s_AgQE6saCg?si=dMSRsZu1EZIWWoVh)
- [2. Video](https://youtu.be/4GDhD2OwIdk)
- [3. Video](https://youtu.be/w26JGkCnsYU)
- [4. Video](https://youtu.be/yAME32_o2lk)
- [5. Video](https://youtu.be/7MbYdMEvBH0)
- [6. Video](https://youtu.be/D-1F6KgSk1U)


---

## Özellikler

- **3D Ürün Görüntüleyici** — Her ürün için AI tarafından üretilmiş `.glb` modeli; parmakla döndürme ve yakınlaştırma desteği
- **AI Pipeline** — Ürün görseli → Gemini 2.5 Flash (prompt üretimi) → Tripo3D API (3D model) → otomatik veritabanı güncellemesi
- **Çok Platform Veri Kazıma** — Amazon, IKEA, Trendyol ve Modalife'den otomatik ürün çekimi
- **Affiliate Takip Sistemi** — "Satın Al" tıklamaları platform bazında kaydedilir
- **Admin Paneli** — Tıklama istatistikleri, 7 günlük trend grafiği ve platform dağılımı
- **Kullanıcı Sistemi** — JWT tabanlı kimlik doğrulama, favoriler ve arama geçmişi
- **Koyu / Açık Tema** — Sistem teması ile uyumlu, manuel değiştirilebilir

---

## Teknoloji Yığını

### Backend
| Teknoloji | Kullanım |
|---|---|
| Python 3.13 | Ana dil |
| FastAPI | REST API çerçevesi |
| SQLAlchemy 2 | ORM |
| PostgreSQL | Veritabanı |
| bcrypt + JWT | Kimlik doğrulama |
| Google Gemini 2.5 Flash | 3D prompt üretimi |
| Tripo3D API | Text-to-3D model oluşturma |
| BeautifulSoup4 | Web kazıma |
| Playwright | JS tabanlı site kazıma (Trendyol) |

### Frontend
| Teknoloji | Kullanım |
|---|---|
| React Native 0.83 | Mobil uygulama |
| Expo SDK 55 | Geliştirme platformu |
| Expo Router | Dosya tabanlı navigasyon |
| Zustand | Global state yönetimi |
| @react-three/fiber | 3D render motoru |
| @react-three/drei | 3D yardımcı bileşenler |
| Three.js | 3D grafik kütüphanesi |
| Axios | HTTP istemcisi |
| TanStack Query | Sunucu durumu yönetimi |

---

## Proje Yapısı

```
nexus/
├── backend/                  # FastAPI Python backend
│   ├── main.py               # Uygulama giriş noktası
│   ├── database.py           # SQLAlchemy bağlantısı
│   ├── auth.py               # JWT kimlik doğrulama
│   ├── models/
│   │   └── schemas.py        # Veritabanı modelleri
│   ├── routers/
│   │   ├── users.py          # Auth endpoint'leri
│   │   ├── products.py       # Ürün & favori endpoint'leri
│   │   └── admin.py          # Admin / affiliate endpoint'leri
│   ├── schemas/              # Pydantic istek/yanıt modelleri
│   ├── services/
│   │   ├── ai_pipeline.py    # Gemini → Tripo3D arka plan görevi
│   │   ├── gemini_service.py # Görsel → 3D prompt üretimi
│   │   ├── tripo_service.py  # Tripo3D API entegrasyonu
│   │   ├── amazon_scraper.py # Amazon.com.tr kazıyıcı
│   │   ├── ikea_scraper.py   # IKEA Türkiye kazıyıcı
│   │   ├── trendyol_scraper.py # Trendyol kazıyıcı (Playwright)
│   │   ├── modalife_scraper.py # Modalife.com kazıyıcı
│   │   └── run_all_scrapers.py # Paralel scraper yöneticisi
│   ├── media/models/         # AI tarafından üretilen .glb dosyaları
│   ├── SCRAPERS.md           # Scraper çalıştırma komutları
│   └── requirements.txt
│
└── projectnexus/             # React Native / Expo mobil uygulama
    ├── app/
    │   ├── (tabs)/
    │   │   ├── index.tsx     # Ana sayfa (kategoriler, öne çıkanlar)
    │   │   ├── products.tsx  # Ürün listesi (arama, filtre, sıralama)
    │   │   ├── favorites.tsx # Favoriler
    │   │   └── profile.tsx   # Profil & ayarlar
    │   ├── product/[id].tsx  # Ürün detayı
    │   ├── viewer/[id].tsx   # 3D model görüntüleyici
    │   ├── login.tsx         # Giriş
    │   ├── register.tsx      # Kayıt
    │   └── admin.tsx         # Admin paneli
    ├── components/
    │   ├── ModelViewer.tsx   # Three.js 3D canvas bileşeni
    │   ├── ProductCard.tsx   # Ürün kartı
    │   └── URLInput.tsx      # URL / arama girişi
    ├── store/
    │   ├── authStore.ts      # Kimlik doğrulama state'i
    │   ├── productStore.ts   # Ürün & favori state'i
    │   └── themeStore.ts     # Tema state'i
    └── services/
        └── api.ts            # Axios API istemcisi
```

---

## Kurulum

### Gereksinimler
- Python 3.11+
- Node.js 18+
- PostgreSQL
- Expo Go (fiziksel cihaz) veya Android Emulator

### Backend

```bash
cd backend

# Sanal ortam oluştur
python -m venv venv
venv/Scripts/activate       # Windows
source venv/bin/activate    # Linux/macOS

# Bağımlılıkları yükle
pip install -r requirements.txt

# Ortam değişkenlerini ayarla
# .env dosyasını düzenle:
# DATABASE_URL=postgresql://kullanici:sifre@localhost:5432/nexusdb
# SECRET_KEY=guclu-bir-secret-key
# GEMINI_API_KEY=...
# TRIPO3D_API_KEY=...

# Sunucuyu başlat
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Backend başladığında admin kullanıcısı otomatik oluşturulur:
- **E-posta:** `admin@demo.com`
- **Şifre:** `admin1234`

API dokümantasyonu: `http://localhost:8000/docs`

### Frontend

```bash
cd projectnexus

npm install

# Android emulator için (varsayılan)
npm start

# Fiziksel cihaz için services/api.ts dosyasında
# API_BASE_URL değerini yerel IP adresinizle güncelleyin
# Örnek: 'http://192.168.x.x:8000'
```

---

## API Endpoint'leri

### Kimlik Doğrulama
| Method | Endpoint | Açıklama |
|---|---|---|
| POST | `/auth/register` | Yeni kullanıcı kaydı |
| POST | `/auth/login` | Giriş (JWT token döner) |
| GET | `/auth/me` | Mevcut kullanıcı bilgisi |
| PUT | `/auth/me` | Profil güncelleme |

### Ürünler
| Method | Endpoint | Açıklama |
|---|---|---|
| GET | `/products/` | Ürün listesi (filtre & arama destekli) |
| GET | `/products/{id}` | Ürün detayı |
| GET | `/products/categories` | Kategori listesi |
| POST | `/products/external-sync` | Dış kaynak ürün ekle + AI pipeline başlat |
| POST | `/products/sync-dummy` | DummyJSON test verisi yükle |
| POST | `/products/{id}/click` | Affiliate tıklaması kaydet |
| GET | `/products/user/favorites` | Kullanıcı favorileri |
| POST | `/products/{id}/favorite` | Favoriye ekle |
| DELETE | `/products/{id}/favorite` | Favoriden kaldır |

### Admin
| Method | Endpoint | Açıklama |
|---|---|---|
| GET | `/admin/clicks` | Tıklama istatistikleri + platform dağılımı |
| GET | `/admin/clicks/list` | Sayfalanmış tıklama listesi |

---

## AI Pipeline

```
Kullanıcı URL girer veya scraper çalışır
        ↓
POST /products/external-sync
        ↓
Ürün DB'ye kaydedilir (model_url = null)
        ↓
BackgroundTask başlar
        ↓
Gemini 2.5 Flash
  - Ürün görseli + ismi analiz eder
  - İngilizce, detaylı 3D modelleme prompt'u üretir
        ↓
Tripo3D API (text_to_model)
  - Her 5 saniyede durum yoklaması (~5 dakika)
  - Model tamamlanınca .glb indirilir
        ↓
media/models/{product_id}.glb olarak kaydedilir
        ↓
DB'de model_url güncellenir
        ↓
Mobil uygulamada 3D viewer otomatik yeni modeli gösterir
```

---

## Scraper'lar

| Platform | Yöntem | Gecikme |
|---|---|---|
| Amazon | requests + BeautifulSoup | 20–45 sn |
| IKEA | requests.Session + JSON API | 35–85 sn |
| Trendyol | Playwright (headless Chrome) | 20–40 sn |
| Modalife | requests.Session + BeautifulSoup | 35–75 sn |

Ayrıntılı çalıştırma komutları için: [`backend/SCRAPERS.md`](backend/SCRAPERS.md)

---

## Geliştirici

**Hüseyin Tınaztepe** — 21290360

---

*Project Nexus © 2026*
