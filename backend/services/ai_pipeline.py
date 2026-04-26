import os
import asyncio
from dotenv import load_dotenv
from models.schemas import Product
from database import SessionLocal
from services.gemini_service import generate_3d_prompt_for_product
from services.tripo_service import create_tripo_task, download_model

load_dotenv()
BACKEND_BASE_URL = os.getenv("BACKEND_BASE_URL", "http://127.0.0.1:8000")

def generate_3d_model_for_product_task(product_id: str, product_name: str, image_url: str):
    """
    Arka planda çalışan entegrasyon asistanı. (Senkron olarak BackgroundTasks içinde çalışır)
    """
    db = SessionLocal()
    try:
        print(f"[{product_id}] 1. Adım: Gemini ile Prompt Üretiliyor...")
        prompt = generate_3d_prompt_for_product(product_name, image_url)
        print(f"[{product_id}] Üretilen Prompt: {prompt}")
        
        print(f"[{product_id}] 2. Adım: Tripo3D Task Oluşturuluyor...")
        task_id = create_tripo_task(prompt=prompt)
        
        if not task_id:
            print(f"[{product_id}] Tripo3D Task başlatılamadı.")
            return
            
        print(f"[{product_id}] Tripo3D Task ID Başladı: {task_id}")
        
        file_name = f"{product_id}.glb"
        output_path = os.path.join(os.getcwd(), "media", "models", file_name)
        
        print(f"[{product_id}] 3. Adım: Tripo3D'den Model Dönüşü Bekleniyor...")
        success = download_model(task_id, output_path)
        
        if success:
            print(f"[{product_id}] 4. Adım: Veritabanı Güncelleniyor...")
            product = db.query(Product).filter(Product.id == product_id).first()
            if product:
                new_model_url = f"{BACKEND_BASE_URL}/media/models/{file_name}"
                product.model_url = new_model_url
                db.commit()
                print(f"[{product_id}] ✅ Başarılı! Model {new_model_url} kaydedildi.")
            else:
                print(f"[{product_id}] Hata: Veritabanında ürün bulunamadı.")
        else:
            print(f"[{product_id}] ❌ Model oluşturulamadı.")
            
    except Exception as e:
        print(f"[{product_id}] Kritik Hata: {str(e)}")
    finally:
        db.close()

