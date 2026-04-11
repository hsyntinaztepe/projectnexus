import os
import time
import requests
import json
from dotenv import load_dotenv

load_dotenv()

TRIPO_API_KEY = os.getenv("TRIPO3D_API_KEY")
BASE_URL = "https://api.tripo3d.ai/v2/openapi"

def create_tripo_task(prompt: str, image_url: str = None):
    """
    Tripo3D API'ye model oluşturma görevi gönderir.
    Hem prompt hem de image verilirse, genellikle Tripo3D text_to_model veya image_to_model olarak çalışır.
    Şimdilik metin ağırlıklı (text_to_model) oluşturuyoruz. Gerekirse 'image_to_model' kullanılabilir.
    """
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {TRIPO_API_KEY}"
    }
    
    # Eğer API destekliyorsa hem resim hem text gönderebiliriz, ancak temel Tripo3D v2 endpoint'i
    # type: "text_to_model" şeklinde çalışır.
    # Alternatif: type: "image_to_model" ve file: { "type": "url", "value": image_url }
    
    # Kullanıcı hem prompt hem görsel dediği için, metin-tabanlı (text_to_model) başlatalım
    # veya eğer Tripo3D multimodal destekliyorsa model yapısına göre güncellenebilir.
    # Biz standart metin ile modelleme yapalım.
    
    payload = {
        "type": "text_to_model",
        "prompt": prompt
    }
    
    # Eğer görsel de verilmişse ve bunu kullanacaksak image_to_model'i de tercih edebiliriz.
    if image_url and not prompt:
        payload = {
            "type": "image_to_model",
            "file": {"type": "url", "value": image_url}
        }

    response = requests.post(f"{BASE_URL}/task", headers=headers, json=payload)
    if response.status_code == 200:
        return response.json().get("data", {}).get("task_id")
    else:
        print(f"Tripo3D Task Hatası: {response.text}")
        return None

def get_tripo_task_status(task_id: str):
    headers = {
        "Authorization": f"Bearer {TRIPO_API_KEY}"
    }
    response = requests.get(f"{BASE_URL}/task/{task_id}", headers=headers)
    if response.status_code == 200:
        return response.json().get("data", {})
    return None

def download_model(task_id: str, output_path: str, max_retries=60, sleep_time=5):
    """
    Görevin tamamlanmasını bekler ve modeli indirir.
    max_retries * sleep_time = maximum bekleme süresi (örneğin 60*5=300sn = 5dk)
    """
    for _ in range(max_retries):
        status_data = get_tripo_task_status(task_id)
        if not status_data:
            time.sleep(sleep_time)
            continue
            
        status = status_data.get("status")
        print(f"Tripo3D Task Status: {status}")
        
        if status == "success":
            # API v2 yapısına göre URL'i alalım
            model_url = None
            
            # Öncelikle 'result' -> 'pbr_model' -> 'url' yolunu kontrol edelim (Güncel v2 formatı)
            if "result" in status_data and "pbr_model" in status_data["result"]:
                model_url = status_data["result"]["pbr_model"]["url"]
            # Alternatif yapı
            elif "output" in status_data and "pbr_model" in status_data["output"]:
                model_url = status_data["output"]["pbr_model"]
            
            if model_url:
                # Modeli indir
                download_res = requests.get(model_url)
                if download_res.status_code == 200:
                    with open(output_path, 'wb') as f:
                        f.write(download_res.content)
                    return True
            break
        elif status in ["failed", "cancelled"]:
            print("Model oluşturma başarısız oldu veya iptal edildi.")
            break
            
        time.sleep(sleep_time)
    
    return False
