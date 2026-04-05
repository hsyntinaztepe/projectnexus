"""
Veritabanına başlangıç ürünlerini ekler.
Kullanım: python seed.py
"""
from database import SessionLocal, engine, Base
from models.schemas import Product
import uuid


SEED_PRODUCTS = [
    {
        "id": "1",
        "name": "Üçlü Koltuk Takımı",
        "price": 4299,
        "dimensions": {"width": 200, "height": 90, "depth": 80},
        "image_url": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1000",
        "model_url": "http://192.168.0.3:8000/media/models/Koltuk.glb",
        "colors": ["#2C2C2C", "#8B7355", "#F5F5F5", "#1A3A5C"],
        "category": "Koltuk",
        "source_url": "https://www.unknown.com/",
        "platform": "Unknown",
        "description": "Modern tasarımlı, konforlu üçlü koltuk takımı. Yumuşak kumaş döşeme."
    },
    {
        "id": "2",
        "name": "Çalışma Masası",
        "price": 2150,
        "dimensions": {"width": 120, "height": 75, "depth": 60},
        "image_url": "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=1000",
        "model_url": "http://192.168.0.3:8000/media/models/Koltuk.glb",
        "colors": ["#F5DEB3", "#8B4513", "#FFFFFF"],
        "category": "Masa",
        "source_url": "https://www.unknown.com/",
        "platform": "Unknown",
        "description": "Ergonomik çalışma masası, geniş çalışma alanı."
    },
    {
        "id": "3",
        "name": "TV Ünitesi",
        "price": 1890,
        "dimensions": {"width": 180, "height": 55, "depth": 40},
        "image_url": "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1000",
        "model_url": "http://192.168.0.3:8000/media/models/Koltuk.glb",
        "colors": ["#FFFFFF", "#333333", "#D2B48C"],
        "category": "Ünite",
        "source_url": "https://www.unknown.com/",
        "platform": "Unknown",
        "description": "Modern TV ünitesi, geniş depolama alanı."
    },
    {
        "id": "4",
        "name": "Berjer",
        "price": 1350,
        "dimensions": {"width": 75, "height": 100, "depth": 70},
        "image_url": "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1000",
        "model_url": "http://192.168.0.3:8000/media/models/Koltuk.glb",
        "colors": ["#556B2F", "#8B7355", "#F0E68C"],
        "category": "Koltuk",
        "source_url": "https://www.amazon.com.tr/",
        "platform": "Amazon",
        "description": "Rahat ve şık berjer koltuk, okuma köşesi için ideal."
    },
    {
        "id": "5",
        "name": "Yemek Masası Seti",
        "price": 5490,
        "dimensions": {"width": 160, "height": 76, "depth": 90},
        "image_url": "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1000",
        "model_url": "http://192.168.0.3:8000/media/models/Koltuk.glb",
        "colors": ["#8B4513", "#D2691E", "#F5F5DC"],
        "category": "Masa",
        "source_url": "https://www.unknown.com/",
        "platform": "Unknown",
        "description": "6 kişilik yemek masası seti, masif ahşap."
    },
    {
        "id": "6",
        "name": "Kitaplık",
        "price": 1299,
        "dimensions": {"width": 80, "height": 180, "depth": 30},
        "image_url": "https://images.unsplash.com/photo-1594620302200-9a762244a156?w=1000",
        "model_url": "http://192.168.0.3:8000/media/models/Koltuk.glb",
        "colors": ["#FFFFFF", "#2C2C2C", "#8B7355"],
        "category": "Ünite",
        "source_url": "https://www.unknown.com/",
        "platform": "Unknown",
        "description": "5 raflı modern kitaplık, dekoratif tasarım."
    },
]


def seed_database():
    """Veritabanına başlangıç verilerini ekler"""
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        existing_count = db.query(Product).count()
        if existing_count > 0:
            print(f"Veritabanında zaten {existing_count} ürün var. Seed atlanıyor.")
            return

        for product_data in SEED_PRODUCTS:
            product = Product(**product_data)
            db.add(product)

        db.commit()
        print(f"✅ {len(SEED_PRODUCTS)} ürün başarıyla eklendi!")
    except Exception as e:
        db.rollback()
        print(f"❌ Seed hatası: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
