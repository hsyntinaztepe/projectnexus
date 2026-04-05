from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
import os

from database import engine, Base
from routers import users, products

# Klasörleri oluştur
os.makedirs("media/models", exist_ok=True)

# Tabloları oluştur
try:
    Base.metadata.create_all(bind=engine)
    print("Veritabanı tabloları oluşturuldu!")
except Exception as e:
    print(f"Veritabanı bağlantı hatası: {e}")

app = FastAPI(
    title="Project Nexus API",
    description="3D Modelleme Destekli E-ticaret Platformu API",
    version="1.0.0",
)

# Statik dosyalar için media klasörünü dışarı aç
app.mount("/media", StaticFiles(directory="media"), name="media")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Production'da kısıtlanmalı
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router'ları ekle
app.include_router(users.router)
app.include_router(products.router)

@app.get("/", include_in_schema=False)
async def root():
    # Ana dizine gelindiğinde doğrudan Swagger arayüzüne yönlendir
    return RedirectResponse(url="/docs")


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "message": "Project Nexus API çalışıyor!",
        "version": "1.0.0",
    }
