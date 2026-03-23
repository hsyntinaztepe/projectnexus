# 🚀 Project Nexus — Geliştirici Rehberi

> **BLM4538 - iOS ile Mobil Uygulama Geliştirme II**  
> 3D Modelleme Destekli E-ticaret Platformu  
> Hüseyin TINAZTEPE – 21290360

---

## 📋 İçindekiler

1. [Proje Genel Bakış](#1-proje-genel-bakış)
2. [Teknoloji Yığını](#2-teknoloji-yığını)
3. [Kurulum ve Ortam Hazırlığı](#3-kurulum-ve-ortam-hazırlığı)
4. [Proje Yapısı](#4-proje-yapısı)
5. [Haftalık Geliştirme Planı](#5-haftalık-geliştirme-planı)
   - [Hafta 1 — Proje Mimarisi, UI Tasarımı ve Temel İskelet](#hafta-1--proje-mimarisi-ui-tasarımı-ve-temel-iskelet)
   - [Hafta 2 — 3D Görüntüleyici Entegrasyonu](#hafta-2--3d-görüntüleyici-entegrasyonu)
   - [Hafta 3 — Manuel Veri Gömme ve Ürün Sayfası](#hafta-3--manuel-veri-gömme-ve-ürün-sayfası)
   - [Hafta 4 — NLP Tabanlı Boyut Ayrıştırma Motoru](#hafta-4--nlp-tabanlı-boyut-ayrıştırma-motoru)
   - [Hafta 5 — Image-to-3D AI Entegrasyonu](#hafta-5--image-to-3d-ai-entegrasyonu)
   - [Hafta 6 — Backend ve Veri Altyapısı](#hafta-6--backend-ve-veri-altyapısı)
   - [Hafta 7 — Affiliate Link Sistemi ve Satın Alma Akışı](#hafta-7--affiliate-link-sistemi-ve-satın-alma-akışı)
   - [Hafta 8 — Gelişmiş Özellikler: Kişiselleştirme ve Karşılaştırma](#hafta-8--gelişmiş-özellikler-kişiselleştirme-ve-karşılaştırma)
   - [Hafta 9 — Entegrasyon ve Uçtan Uca Akış Testleri](#hafta-9--entegrasyon-ve-uçtan-uca-akış-testleri)
   - [Hafta 10 — Performans Optimizasyonu ve Final Raporu](#hafta-10--performans-optimizasyonu-ve-final-raporu)
6. [Modüller: Detaylı Teknik Rehber](#6-modüller-detaylı-teknik-rehber)
7. [API Entegrasyonları](#7-api-entegrasyonları)
8. [Test Stratejisi](#8-test-stratejisi)
9. [Sık Karşılaşılan Sorunlar](#9-sık-karşılaşılan-sorunlar)

---

## 1. Proje Genel Bakış

Project Nexus, online mobilya ve dekorasyon alışverişinde kullanıcıların karşılaştığı **ölçek belirsizliği** ve **görsel uyumsuzluk** sorunlarını çözmek amacıyla geliştirilmiş yapay zeka destekli bir cross-platform mobil uygulamadır.

### Kullanıcı Akışı

```
① Link Gir  →  ② Veri Çek  →  ③ Model Al  →  ④ 3D İncele  →  ⑤ Satın Al
(URL girişi)   (boyut/görsel)  (GLB/USDZ)   (360° viewer)   (Affiliate)
```

### Temel Modüller

| Modül | Açıklama |
|-------|----------|
| **Modül A** | Ürün Verisi Çekme (URL → görsel + boyut) |
| **Modül B** | 3D Model Üretimi ve Otomatik Ölçekleme |
| **Modül C** | İnteraktif 3D Görüntüleyici + Satın Alma |

---

## 2. Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| Mobil Framework | React Native (Expo) |
| 3D Görüntüleme | `expo-gl`, `expo-three`, `react-native-3d-model-view` veya `@react-three/fiber` |
| 3D Model Formatları | `.glb` (Android/iOS) · `.usdz` (iOS AR) |
| AI Model Üretimi | TripoSR API · Meshy API |
| NLP Boyut Ayrıştırma | OpenAI GPT-4o API · Google Gemini API |
| Backend | Python (FastAPI) |
| Veritabanı | PostgreSQL · Redis (önbellek) |
| Kimlik Doğrulama | JWT |
| State Yönetimi | Zustand · React Query |
| Navigasyon | Expo Router (file-based) |

---

## 3. Kurulum ve Ortam Hazırlığı

### 3.1 Gereksinimler

- Node.js >= 18.x
- Python >= 3.11
- Expo CLI (`npm install -g expo-cli`)
- iOS: Xcode 15+ (macOS)
- Android: Android Studio + emülatör
- Git

### 3.2 Repo Klonlama

```bash
git clone https://github.com/hsyntinaztepe/projectnexus.git
cd projectnexus
```

### 3.3 Mobil Uygulama Kurulumu

```bash
cd mobile
npm install
npx expo start
```

### 3.4 Backend Kurulumu

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### 3.5 Ortam Değişkenleri

`mobile/.env` dosyası oluştur:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000
EXPO_PUBLIC_OPENAI_API_KEY=sk-...
EXPO_PUBLIC_MESHY_API_KEY=...
```

`backend/.env` dosyası oluştur:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/nexusdb
OPENAI_API_KEY=sk-...
MESHY_API_KEY=...
TRIPOSR_API_KEY=...
SECRET_KEY=super-secret-jwt-key
```

---

## 4. Proje Yapısı

```
projectnexus/
├── mobile/                      # React Native (Expo) uygulaması
│   ├── app/                     # Expo Router — ekranlar
│   │   ├── (tabs)/
│   │   │   ├── index.tsx        # Ana Sayfa
│   │   │   ├── favorites.tsx    # Favoriler
│   │   │   └── profile.tsx      # Profil
│   │   ├── product/
│   │   │   └── [id].tsx         # Ürün Detay Sayfası
│   │   └── viewer/
│   │       └── [id].tsx         # 3D Görüntüleyici
│   ├── components/
│   │   ├── ProductCard.tsx
│   │   ├── ModelViewer.tsx      # 3D model bileşeni
│   │   ├── URLInput.tsx
│   │   └── BuyButton.tsx
│   ├── store/
│   │   └── productStore.ts      # Zustand store
│   ├── hooks/
│   │   ├── useProduct.ts
│   │   └── use3DModel.ts
│   ├── services/
│   │   ├── api.ts               # Backend API çağrıları
│   │   └── affiliate.ts
│   └── assets/
│       └── models/              # Prototip için gömülü .glb dosyaları
│
├── backend/                     # FastAPI
│   ├── main.py
│   ├── routers/
│   │   ├── products.py
│   │   ├── models.py
│   │   └── users.py
│   ├── services/
│   │   ├── scraper.py           # Ürün verisi çekme
│   │   ├── nlp_parser.py        # NLP boyut ayrıştırma
│   │   └── model_generator.py   # TripoSR / Meshy entegrasyonu
│   ├── models/
│   │   └── schemas.py
│   └── requirements.txt
│
└── README.md
```

---

## 5. Haftalık Geliştirme Planı

---

### Hafta 1 — Proje Mimarisi, UI Tasarımı ve Temel İskelet

**Hedef:** Çalışan navigasyon yapısı, temel ekranlar ve UI bileşenleri.

#### ✅ Görevler

- [ ] Expo projesi oluştur, Expo Router kur
- [ ] Tab navigasyonu yapılandır (Ana Sayfa, Favoriler, Profil)
- [ ] `ProductCard` bileşenini oluştur
- [ ] `URLInput` bileşenini oluştur (URL girişi + "Ara" butonu)
- [ ] Ana Sayfa grid layout'unu tasarla
- [ ] Renk paleti ve tema dosyasını (`theme.ts`) oluştur
- [ ] Temel Zustand store iskeletini kur

#### 💻 Başlangıç Kodu

**Expo kurulumu:**
```bash
npx create-expo-app mobile --template tabs
cd mobile
npx expo install expo-router react-native-safe-area-context react-native-screens
```

**Tema dosyası (`mobile/constants/theme.ts`):**
```typescript
export const Colors = {
  primary: '#1A73E8',
  background: '#F8F9FA',
  card: '#FFFFFF',
  text: '#1C1C1E',
  textSecondary: '#6B7280',
  accent: '#34C759',
  border: '#E5E7EB',
};

export const Spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32,
};
```

**URLInput bileşeni (`mobile/components/URLInput.tsx`):**
```typescript
import { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/theme';

export default function URLInput({ onSubmit }: { onSubmit: (url: string) => void }) {
  const [url, setUrl] = useState('');
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Ürün linkini yapıştır..."
        value={url}
        onChangeText={setUrl}
        autoCapitalize="none"
        keyboardType="url"
      />
      <TouchableOpacity style={styles.button} onPress={() => onSubmit(url)}>
        <Text style={styles.buttonText}>→</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 8, marginHorizontal: 16 },
  input: { flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: 12,
    padding: 12, backgroundColor: Colors.card },
  button: { backgroundColor: Colors.primary, borderRadius: 12, padding: 12,
    justifyContent: 'center', alignItems: 'center', width: 48 },
  buttonText: { color: '#FFF', fontSize: 18 },
});
```

#### 📦 Bağımlılıklar (Bu hafta)
```bash
npm install zustand @tanstack/react-query axios
```

---

### Hafta 2 — 3D Görüntüleyici Entegrasyonu

**Hedef:** Statik `.glb` model dosyalarını uygulama içinde döndürülebilir/yakınlaştırılabilir şekilde görüntüle.

#### ✅ Görevler

- [ ] `expo-gl` ve `expo-three` kütüphanelerini kur
- [ ] `ModelViewer.tsx` bileşenini oluştur
- [ ] Assets klasörüne en az 2 adet örnek `.glb` dosyası ekle (ücretsiz kaynak: [sketchfab.com](https://sketchfab.com))
- [ ] Döndürme jesti (pan gesture) ekle
- [ ] Yakınlaştırma jesti (pinch gesture) ekle
- [ ] Yükleme animasyonu (loading spinner) ekle
- [ ] `viewer/[id].tsx` ekranını oluştur

#### 📦 Bağımlılıklar
```bash
npx expo install expo-gl expo-three three
npm install @react-three/fiber @react-three/drei
npx expo install react-native-gesture-handler
```

> **Not:** `react-native-gesture-handler` için `app/_layout.tsx` dosyasına `<GestureHandlerRootView>` wrapper'ı eklemeyi unutma.

#### 💻 Temel ModelViewer Bileşeni (`mobile/components/ModelViewer.tsx`)

```typescript
import { Canvas } from '@react-three/fiber/native';
import { Suspense } from 'react';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei/native';
import { View, ActivityIndicator } from 'react-native';

function Model({ uri }: { uri: string }) {
  const { scene } = useGLTF(uri);
  return <primitive object={scene} />;
}

export default function ModelViewer({ modelUri }: { modelUri: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Suspense fallback={null}>
          <Model uri={modelUri} />
          <Environment preset="city" />
        </Suspense>
        <OrbitControls enableZoom={true} enablePan={false} />
      </Canvas>
    </View>
  );
}
```

#### 🔍 Test Adımları
1. `assets/models/sofa.glb` dosyasını projeye ekle
2. Simulator'da 3D görüntüleyici ekranını aç
3. Parmakla döndürme ve zoom çalışıyor mu kontrol et
4. iOS ve Android'de ayrı ayrı test et

---

### Hafta 3 — Manuel Veri Gömme ve Ürün Sayfası

**Hedef:** Statik ürün verisiyle çalışan tam ürün sayfası; "3D İncele" butonu görüntüleyiciye bağlansın.

#### ✅ Görevler

- [ ] Mock ürün verisini tanımla (`data/mockProducts.ts`)
- [ ] `product/[id].tsx` ürün detay ekranını oluştur
- [ ] Ürün görseli, isim, fiyat, renk seçici UI'ı ekle
- [ ] "3D İncele" butonunu `viewer/[id].tsx`'e bağla
- [ ] "Satın Al" butonu için placeholder oluştur
- [ ] Ana sayfada ürün gridini mock veriye bağla
- [ ] Zustand store'a ürün state'i ekle

#### 💻 Mock Ürün Verisi (`mobile/data/mockProducts.ts`)

```typescript
export interface Product {
  id: string;
  name: string;
  price: number;
  dimensions: { width: number; height: number; depth: number }; // cm
  imageUrl: string;
  modelPath: string; // local .glb path
  colors: string[];
  category: string;
  sourceUrl: string; // affiliate hedef URL
}

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Üçlü Koltuk Takımı',
    price: 4299,
    dimensions: { width: 200, height: 90, depth: 80 },
    imageUrl: require('../assets/images/sofa.png'),
    modelPath: require('../assets/models/sofa.glb'),
    colors: ['#2C2C2C', '#8B7355', '#F5F5F5', '#1A3A5C'],
    category: 'Koltuk',
    sourceUrl: 'https://www.trendyol.com/...',
  },
  {
    id: '2',
    name: 'Çalışma Masası',
    price: 2150,
    dimensions: { width: 120, height: 75, depth: 60 },
    imageUrl: require('../assets/images/desk.png'),
    modelPath: require('../assets/models/desk.glb'),
    colors: ['#F5DEB3', '#8B4513', '#FFFFFF'],
    category: 'Masa',
    sourceUrl: 'https://www.hepsiburada.com/...',
  },
  // Daha fazla ürün eklenebilir...
];
```

#### 💻 Ürün Detay Ekranı (`mobile/app/product/[id].tsx`)

```typescript
import { useLocalSearchParams, router } from 'expo-router';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { mockProducts } from '../../data/mockProducts';
import { Colors } from '../../constants/theme';

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = mockProducts.find(p => p.id === id);

  if (!product) return <Text>Ürün bulunamadı</Text>;

  return (
    <ScrollView style={styles.container}>
      <Image source={product.imageUrl} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.dimensions}>
          {product.dimensions.width} cm × {product.dimensions.height} cm × {product.dimensions.depth} cm
        </Text>
        <Text style={styles.price}>{product.price.toLocaleString('tr-TR')} TL</Text>

        {/* Renk Seçici */}
        <View style={styles.colorRow}>
          {product.colors.map(color => (
            <TouchableOpacity key={color}
              style={[styles.colorDot, { backgroundColor: color }]} />
          ))}
        </View>

        {/* Butonlar */}
        <TouchableOpacity style={styles.primaryBtn}
          onPress={() => router.push(`/viewer/${product.id}`)}>
          <Text style={styles.primaryBtnText}>3D İncele</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn}>
          <Text style={styles.secondaryBtnText}>Satın Al</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
```

---

### Hafta 4 — NLP Tabanlı Boyut Ayrıştırma Motoru

**Hedef:** Ürün açıklamasından boyut bilgisini otomatik çek ve 3D modeli gerçek ölçülere göre ölçekle.

#### ✅ Görevler

- [ ] FastAPI backend'inde `/parse-dimensions` endpoint'ini oluştur
- [ ] OpenAI API ile boyut entity extraction'ı yaz
- [ ] Matematiksel rescaling motorunu yaz (cm → Three.js units)
- [ ] `ModelViewer` bileşenini `scale` prop alacak şekilde güncelle
- [ ] 3D görüntüleyicide boyut göstergesi (ölçü çizgileri) ekle
- [ ] Backend ile mobil arasında API bağlantısını test et

#### 💻 Backend — NLP Ayrıştırma Servisi (`backend/services/nlp_parser.py`)

```python
from openai import AsyncOpenAI
import json, re

client = AsyncOpenAI()

PROMPT_TEMPLATE = """
Aşağıdaki ürün açıklamasından boyut bilgilerini çıkar.
Yanıtı SADECE JSON formatında ver, başka hiçbir şey yazma.
Format: {{"width_cm": number, "height_cm": number, "depth_cm": number}}
Boyut bulunamazsa null döndür.

Ürün açıklaması:
{description}
"""

async def parse_dimensions(description: str) -> dict | None:
    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": PROMPT_TEMPLATE.format(description=description)}],
        response_format={"type": "json_object"},
    )
    try:
        data = json.loads(response.choices[0].message.content)
        if all(data.get(k) for k in ("width_cm", "height_cm", "depth_cm")):
            return data
    except Exception:
        pass
    return None
```

#### 💻 Rescaling Motoru (`mobile/utils/rescale.ts`)

```typescript
// Three.js'de 1 birim = 1 metre kabul edilir
// Ürün boyutları cm cinsinden gelir

export interface Dimensions {
  width_cm: number;
  height_cm: number;
  depth_cm: number;
}

export function calculateScale(
  modelBoundingBox: { x: number; y: number; z: number },
  realDimensions: Dimensions
): [number, number, number] {
  const scaleX = (realDimensions.width_cm / 100) / modelBoundingBox.x;
  const scaleY = (realDimensions.height_cm / 100) / modelBoundingBox.y;
  const scaleZ = (realDimensions.depth_cm / 100) / modelBoundingBox.z;
  return [scaleX, scaleY, scaleZ];
}
```

#### 💻 Backend Endpoint (`backend/routers/products.py`)

```python
from fastapi import APIRouter
from services.nlp_parser import parse_dimensions
from pydantic import BaseModel

router = APIRouter(prefix="/products", tags=["products"])

class DimensionRequest(BaseModel):
    description: str

@router.post("/parse-dimensions")
async def extract_dimensions(req: DimensionRequest):
    result = await parse_dimensions(req.description)
    if result is None:
        return {"error": "Boyut bilgisi bulunamadı"}
    return result
```

---

### Hafta 5 — Image-to-3D AI Entegrasyonu

**Hedef:** Ürün fotoğrafından otomatik 3D model üretimi. API kullanılamıyorsa prototip için gömülü modelle devam et.

#### ✅ Görevler

- [ ] Meshy API entegrasyonunu yaz
- [ ] TripoSR API entegrasyonunu (alternatif) yaz
- [ ] Model kalite doğrulama mekanizmasını tasarla
- [ ] "Model üretiliyor..." loading state'ini mobilge ekle
- [ ] Üretilen modeli backend'de geçici olarak sakla
- [ ] API maliyeti aşılırsa gömülü fallback modelini kullan

#### 💻 Meshy API Entegrasyonu (`backend/services/model_generator.py`)

```python
import httpx, asyncio, os

MESHY_API_KEY = os.getenv("MESHY_API_KEY")
MESHY_BASE_URL = "https://api.meshy.ai/v2"

async def generate_3d_from_image(image_url: str) -> str | None:
    """
    Ürün görselinden 3D model üretir.
    Başarılı olursa .glb dosyasının URL'ini döndürür.
    """
    headers = {"Authorization": f"Bearer {MESHY_API_KEY}"}

    # 1. Task oluştur
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{MESHY_BASE_URL}/image-to-3d",
            headers=headers,
            json={"image_url": image_url, "enable_pbr": True}
        )
        task_id = response.json().get("result")

    if not task_id:
        return None

    # 2. Task tamamlanana kadar bekle (polling)
    for _ in range(30):  # max 5 dakika
        await asyncio.sleep(10)
        async with httpx.AsyncClient() as client:
            status_response = await client.get(
                f"{MESHY_BASE_URL}/image-to-3d/{task_id}",
                headers=headers
            )
        data = status_response.json()
        if data.get("status") == "SUCCEEDED":
            return data.get("model_urls", {}).get("glb")
        elif data.get("status") == "FAILED":
            return None

    return None  # timeout

async def get_model_for_product(image_url: str, product_name: str) -> str:
    """
    Önce API'dan model çekmeyi dene, hata alırsan fallback döndür.
    """
    try:
        model_url = await generate_3d_from_image(image_url)
        if model_url:
            return model_url
    except Exception as e:
        print(f"Model generation failed: {e}")
    
    # Fallback: kategori bazlı gömülü model
    return get_fallback_model(product_name)

def get_fallback_model(product_name: str) -> str:
    """Ürün adına göre en uygun gömülü modeli döndür."""
    name_lower = product_name.lower()
    if any(w in name_lower for w in ["koltuk", "sofa", "sandalye"]):
        return "/static/models/fallback_sofa.glb"
    elif any(w in name_lower for w in ["masa", "sehpa"]):
        return "/static/models/fallback_table.glb"
    return "/static/models/fallback_generic.glb"
```

#### ⚠️ Önemli Notlar
- Meshy API ücretsiz planı: 200 kredi/ay
- TripoSR açık kaynak alternatif — kendi sunucunda çalıştırılabilir
- Prototip için [Sketchfab](https://sketchfab.com/3d-models?features=downloadable&sort_by=-likeCount&cursor=0) üzerinden ücretsiz `.glb` modeller indir

---

### Hafta 6 — Backend ve Veri Altyapısı

**Hedef:** Tam işlevsel FastAPI backend; veritabanı şeması, kullanıcı yönetimi ve API endpoint'leri.

#### ✅ Görevler

- [ ] PostgreSQL veritabanını kur
- [ ] SQLAlchemy modelleri oluştur (User, Product, SearchHistory)
- [ ] JWT tabanlı kimlik doğrulama yaz
- [ ] `/products`, `/users`, `/history` endpoint'lerini tamamla
- [ ] Redis ile 3D model önbelleğini kur
- [ ] API endpoint'lerini Postman/Thunder Client ile test et
- [ ] CORS ayarlarını mobilge uygun yapılandır

#### 💻 Veritabanı Şeması (`backend/models/schemas.py`)

```python
from sqlalchemy import Column, String, Float, JSON, DateTime, ForeignKey, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    searches = relationship("SearchHistory", back_populates="user")

class Product(Base):
    __tablename__ = "products"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    source_url = Column(String, nullable=False)
    price = Column(Float)
    dimensions = Column(JSON)           # {"width_cm": 200, "height_cm": 90, "depth_cm": 80}
    image_url = Column(String)
    model_url = Column(String)          # .glb dosyasının URL'i
    colors = Column(JSON, default=list)
    category = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class SearchHistory(Base):
    __tablename__ = "search_history"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id"))
    product_id = Column(String, ForeignKey("products.id"))
    searched_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="searches")
```

#### 💻 FastAPI Ana Dosyası (`backend/main.py`)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import products, users

app = FastAPI(title="Project Nexus API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # Production'da kısıtla
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router)
app.include_router(users.router)

@app.get("/health")
async def health_check():
    return {"status": "ok"}
```

#### 📦 Backend Bağımlılıkları (`backend/requirements.txt`)
```
fastapi==0.115.0
uvicorn[standard]==0.30.0
sqlalchemy==2.0.36
alembic==1.13.3
asyncpg==0.30.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
httpx==0.27.2
openai==1.54.0
redis==5.2.0
python-dotenv==1.0.1
pydantic==2.9.2
```

---

### Hafta 7 — Affiliate Link Sistemi ve Satın Alma Akışı

**Hedef:** "Satın Al" butonunu affiliate link sistemiyle entegre et; uçtan uca satın alma akışını test et.

#### ✅ Görevler

- [ ] Affiliate link oluşturucu servisi yaz
- [ ] Platform tespiti (Trendyol, Hepsiburada, Amazon TR) yap
- [ ] `Linking.openURL()` ile dış tarayıcıya yönlendirme yap
- [ ] Tıklama takibi için backend'e log kaydet
- [ ] "Satın Al" butonuna loading state ekle
- [ ] Affiliate tıklama analitik endpoint'ini oluştur

#### 💻 Affiliate Servis (`mobile/services/affiliate.ts`)

```typescript
import { Linking } from 'react-native';
import api from './api';

interface AffiliateConfig {
  trendyol: string;      // Trendyol partner ID
  hepsiburada: string;   // HB partner ID
  amazon: string;        // Amazon Associates tag
}

const AFFILIATE_CONFIG: AffiliateConfig = {
  trendyol: 'YOUR_TRENDYOL_PARTNER_ID',
  hepsiburada: 'YOUR_HB_PARTNER_ID',
  amazon: 'nexus-21',
};

export function buildAffiliateUrl(originalUrl: string): string {
  if (originalUrl.includes('trendyol.com')) {
    return `${originalUrl}${originalUrl.includes('?') ? '&' : '?'}partnerId=${AFFILIATE_CONFIG.trendyol}`;
  }
  if (originalUrl.includes('hepsiburada.com')) {
    return `${originalUrl}?magaza=${AFFILIATE_CONFIG.hepsiburada}`;
  }
  if (originalUrl.includes('amazon.com.tr') || originalUrl.includes('amazon.com')) {
    return `${originalUrl}${originalUrl.includes('?') ? '&' : '?'}tag=${AFFILIATE_CONFIG.amazon}`;
  }
  return originalUrl; // Bilinmeyen platform — orijinal URL
}

export async function openProductPage(productId: string, originalUrl: string) {
  const affiliateUrl = buildAffiliateUrl(originalUrl);

  // Tıklamayı backend'e logla
  try {
    await api.post('/analytics/click', { product_id: productId, url: affiliateUrl });
  } catch (e) {
    // Log hatası satın almayı engellemesin
  }

  await Linking.openURL(affiliateUrl);
}
```

---

### Hafta 8 — Gelişmiş Özellikler: Kişiselleştirme ve Karşılaştırma

**Hedef:** 3D görüntüleyicide renk/malzeme değiştirme ve yan yana ürün karşılaştırma.

#### ✅ Görevler

- [ ] `ModelViewer`'a `activeColor` prop'u ekle
- [ ] Three.js `MeshStandardMaterial` ile renk değiştirmeyi entegre et
- [ ] Malzeme seçici UI bileşenini oluştur (Kumaş / Deri / Ahşap)
- [ ] "Karşılaştır" özelliği için `compare/[id1]/[id2].tsx` ekranı oluştur
- [ ] Split-screen 3D görüntüleyici tasarımını yap
- [ ] Favorilere ekleme ve listeden karşılaştırmayı başlatma özelliği ekle

#### 💻 Renk Değiştirme (Three.js)

```typescript
// ModelViewer.tsx içinde kullanım
import { useRef, useEffect } from 'react';
import * as THREE from 'three';

function ColoredModel({ uri, color }: { uri: string; color: string }) {
  const { scene } = useGLTF(uri);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const mat = child.material as THREE.MeshStandardMaterial;
        mat.color.set(color);
        mat.needsUpdate = true;
      }
    });
  }, [color]);

  return <primitive ref={groupRef} object={scene} />;
}
```

#### 💻 Karşılaştırma Ekranı (`mobile/app/compare/[id1]/[id2].tsx`)

```typescript
// Split-screen: sol ürün / sağ ürün
import { View, StyleSheet } from 'react-native';
import ModelViewer from '../../../components/ModelViewer';
import { mockProducts } from '../../../data/mockProducts';
import { useLocalSearchParams } from 'expo-router';

export default function CompareScreen() {
  const { id1, id2 } = useLocalSearchParams<{ id1: string; id2: string }>();
  const productA = mockProducts.find(p => p.id === id1);
  const productB = mockProducts.find(p => p.id === id2);

  return (
    <View style={styles.container}>
      <View style={styles.half}>
        {productA && <ModelViewer modelUri={productA.modelPath} label={productA.name} />}
      </View>
      <View style={[styles.half, styles.rightPanel]}>
        {productB && <ModelViewer modelUri={productB.modelPath} label={productB.name} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row' },
  half: { flex: 1 },
  rightPanel: { borderLeftWidth: 1, borderLeftColor: '#E5E7EB' },
});
```

---

### Hafta 9 — Entegrasyon ve Uçtan Uca Akış Testleri

**Hedef:** Tüm modülleri birbirine bağla; iOS ve Android'de tam akışı test et.

#### ✅ Görevler

- [ ] Tüm API servis çağrılarını gerçek backend ile bağla
- [ ] `React Query` ile veri yönetimini iyileştir (cache, loading, error states)
- [ ] Hata mesajlarını kullanıcı dostu hale getir
- [ ] Offline / ağ hatası durumlarını handle et
- [ ] Fiziksel iOS cihazda TestFlight ile test et
- [ ] Android fiziksel cihazda APK testi yap
- [ ] Crash loglarını incele (Expo Crash Reporting veya Sentry)
- [ ] Erişilebilirlik (accessibility) kontrolü yap

#### 💻 Global Error Boundary (`mobile/components/ErrorBoundary.tsx`)

```typescript
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode }, State
> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Bir şeyler ters gitti 😕</Text>
          <Text style={styles.message}>{this.state.error?.message}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => this.setState({ hasError: false })}>
            <Text style={styles.buttonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}
```

#### 🧪 Test Kontrol Listesi

```
✅ URL girişinden ürün detayına navigasyon
✅ 3D modelin doğru ölçekte görüntülenmesi
✅ Döndürme ve zoom jestlerinin çalışması
✅ Renk değiştirme
✅ "Satın Al" → tarayıcı yönlendirmesi
✅ Favorilere ekleme / çıkarma
✅ Karşılaştırma ekranı
✅ Ağ hatası senaryosu (uçak modu)
✅ Farklı ekran boyutları (iPhone SE, Pro Max, Android tablet)
✅ Dark mode desteği (opsiyonel)
```

---

### Hafta 10 — Performans Optimizasyonu ve Final Raporu

**Hedef:** Uygulama performansını optimize et, final raporunu tamamla, projeyi teslim et.

#### ✅ Görevler

- [ ] 3D model yükleme sürelerini ölç ve optimize et
- [ ] Büyük `.glb` dosyaları için lazy loading uygula
- [ ] Resim önbelleğini iyileştir (FlashList, React Query cache)
- [ ] `FlatList` → `FlashList` migrasyonu (daha hızlı liste renderı)
- [ ] Bundle size analizi yap (`npx expo export --analyze`)
- [ ] Final raporu yaz (proje PDF şablonuna uygun)
- [ ] GitHub repo'yu temizle (gereksiz dosyaları sil, README güncelle)
- [ ] Demo videosu çek (opsiyonel ama tavsiye edilir)

#### 💻 Performans İyileştirmeleri

**FlashList kurulumu:**
```bash
npm install @shopify/flash-list
```

**Görsel önbelleği:**
```bash
npx expo install expo-image
```

```typescript
// Image yerine expo-image kullan
import { Image } from 'expo-image';

<Image
  source={product.imageUrl}
  style={styles.image}
  contentFit="cover"
  transition={200}
  cachePolicy="memory-disk"
/>
```

**3D Model Lazy Loading:**
```typescript
import { lazy, Suspense } from 'react';
const ModelViewer = lazy(() => import('../components/ModelViewer'));

// Kullanım
<Suspense fallback={<LoadingSpinner />}>
  <ModelViewer modelUri={uri} />
</Suspense>
```

---

## 6. Modüller: Detaylı Teknik Rehber

### Modül A — Ürün Verisi Çekme

> **Prototip:** Manuel veri gömülü  
> **Canlı:** Web scraping veya platform API

```
Kullanıcı URL girer
    ↓
Platform tespiti (Trendyol / HB / Amazon)
    ↓
[Prototip] Mock data döndür
[Canlı] Platform API veya scraper çalıştır
    ↓
Ürün: isim, fiyat, görsel URL, açıklama metni
    ↓
NLP boyut ayrıştırma (Hafta 4)
```

### Modül B — 3D Model Üretimi ve Ölçekleme

```
Ürün görseli → Meshy/TripoSR API
    ↓
.glb model dosyası
    ↓
Bounding box hesapla (Three.js Box3)
    ↓
Gerçek boyutlar / bounding box = ölçek faktörü
    ↓
model.scale.set(scaleX, scaleY, scaleZ)
```

### Modül C — İnteraktif 3D Görüntüleyici

```
ModelViewer bileşeni
├── Canvas (React Three Fiber)
│   ├── Camera (perspektif, fov: 50)
│   ├── Lights (ambient + directional)
│   ├── Model (useGLTF + primitive)
│   ├── Environment (preset: city)
│   └── OrbitControls (döndür + zoom)
├── UI Overlay
│   ├── Renk seçici
│   ├── Malzeme seçici
│   ├── Ölçü göstergesi
│   └── "Satın Al" butonu
```

---

## 7. API Entegrasyonları

### Meshy API

| Özellik | Değer |
|---------|-------|
| Endpoint | `https://api.meshy.ai/v2/image-to-3d` |
| Auth | `Authorization: Bearer {API_KEY}` |
| Input | `image_url` + `enable_pbr: true` |
| Output | `.glb`, `.obj`, `.fbx` URL'leri |
| Süre | ~2-5 dakika / model |
| Ücretsiz | 200 kredi/ay |
| Kayıt | [meshy.ai](https://www.meshy.ai) |

### OpenAI API (NLP)

| Özellik | Değer |
|---------|-------|
| Model | `gpt-4o-mini` (maliyet düşük) |
| Görev | JSON formatında boyut entity extraction |
| Maliyet | ~$0.002 / 1K token |
| Kayıt | [platform.openai.com](https://platform.openai.com) |

### TripoSR (Alternatif — Açık Kaynak)

```bash
# Kendi sunucunda çalıştırma
git clone https://github.com/VAST-AI-Research/TripoSR
cd TripoSR
pip install -r requirements.txt
python run.py --image product.jpg --output output/
```

---

## 8. Test Stratejisi

### Birim Testler
```bash
# Jest ile
npm test

# Örnek test: rescaling motoru
describe('calculateScale', () => {
  it('200cm genişliği doğru ölçekler', () => {
    const result = calculateScale({ x: 1, y: 0.9, z: 0.8 }, { width_cm: 200, height_cm: 90, depth_cm: 80 });
    expect(result[0]).toBeCloseTo(2); // 200cm = 2m = 2 unit
  });
});
```

### Backend Testler
```bash
cd backend
pytest tests/ -v
```

### Cihaz Testi
```bash
# iOS Simulator
npx expo run:ios

# Android Emulator
npx expo run:android

# Fiziksel cihaz (USB)
npx expo start --tunnel
```

---

## 9. Sık Karşılaşılan Sorunlar

| Sorun | Çözüm |
|-------|-------|
| `.glb` dosyası yüklenmiyor | Dosya yolunu `require()` ile değil, `{ uri: '...' }` ile ver |
| `OrbitControls` jestleri çakışıyor | `GestureHandlerRootView` wrapper'ını kontrol et |
| iOS'ta 3D model görünmüyor | `expo-gl` ve `expo-three` sürümlerinin uyumlu olduğunu kontrol et |
| CORS hatası (backend) | `allow_origins=["*"]` olduğundan emin ol (geliştirme için) |
| Meshy API timeout | `asyncio.sleep(10)` polling aralığını artır |
| Android'de uydz açılmıyor | `.usdz` yalnızca iOS'a özeldir; Android için `.glb` kullan |
| NLP boyut ayrıştırma yanlış | Prompt'a daha fazla örnek ekle (few-shot prompting) |
| Bundle çok büyük | `.glb` dosyalarını CDN'e taşı, local'den kaldır |

---

## 📎 Faydalı Kaynaklar

- [Expo Dökümanı](https://docs.expo.dev)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [FastAPI Dökümanı](https://fastapi.tiangolo.com)
- [Meshy API Dökümanı](https://docs.meshy.ai)
- [Sketchfab — Ücretsiz 3D Modeller](https://sketchfab.com/3d-models?features=downloadable)
- [Zustand Dökümanı](https://zustand-demo.pmnd.rs)
- [React Query Dökümanı](https://tanstack.com/query/latest)

---

*Project Nexus — BLM4538 | Hüseyin TINAZTEPE – 21290360*
