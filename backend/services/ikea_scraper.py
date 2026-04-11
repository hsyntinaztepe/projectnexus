import random
import time
import requests
import urllib.parse
from bs4 import BeautifulSoup
import sys

# Windows UTF-8 terminal hatalarını önlemek için
sys.stdout.reconfigure(encoding='utf-8') if hasattr(sys.stdout, 'reconfigure') else None

# IKEA Türkiye için özel kategoriler / arama kelimeleri
SEARCH_KEYWORDS = [
    "çalışma masası", "kitaplık", "ofis koltuğu", "televizyon ünitesi", 
    "orta sehpa", "gardırop", "komodin", "yemek masası"
]

# Çok daha kapsamlı ve gerçekçi User-Agent listesi
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/122.0.0.0 Safari/537.36"
]

def get_expert_headers():
    """
    Sadece User-Agent değil, eksiksiz tarayıcı başlıkları üreterek
    bot tespit sistemlerini (WAF/Cloudflare vb.) atlatmayı sağlar.
    """
    return {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
        "Accept-Encoding": "gzip, deflate, br",
        "Sec-Ch-Ua": '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        "Connection": "keep-alive"
    }

def fetch_ikea_furniture(session, retries=3):
    keyword = random.choice(SEARCH_KEYWORDS)
    # IKEA Türkiye Resmi Frontend (Mobil/Web) JSON API'si kullanıyoruz.
    # HTML Parsing'e (WAF ve SPA Render sorunlarına) takılmamak için mükemmel bir bypass noktası.
    url = f"https://frontendapi.ikea.com.tr/api/search/products?q={urllib.parse.quote(keyword)}"
    
    for attempt in range(retries):
        try:
            print(f"[{attempt+1}/{retries}] IKEA API'sinde aranıyor: '{keyword}' (Uzman API Modu)")
            
            time.sleep(random.uniform(2.5, 5.5))
            
            # En basitleştirilmiş gerçekçi başlık yeterli oluyor:
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Accept": "application/json, text/plain, */*"
            }
            
            response = session.get(url, headers=headers, timeout=15)
            
            if response.status_code != 200:
                print(f"  [!] HTTP {response.status_code} döndü. Tekrar deneniyor...")
                time.sleep(random.uniform(5, 10))
                continue
                
            # Boş dönme ihtimaline (veya json harici cloudflare dönmesine) karşı
            if not response.text.strip():
                print("  [!] API boş yanıt döndürdü.")
                continue
                
            try:
                data = response.json()
            except Exception as e:
                print(f"  [!] API geçersiz JSON döndürdü. (WAF koruması olabilir)")
                continue
            products = data.get("products", [])
            
            if not products:
                print("  [!] Bu kelimede API sonucu boş döndü.")
                return False
                
            # Rastgele bir ürünü al
            item = random.choice(products[:10])
            
            title = item.get("title", "IKEA Ürünü")
            # Tipi de (örn: divan, 80x200 cm) isme ekleyelim
            if item.get("subTitle"):
                title = f"{title} - {item['subTitle']}"
                
            cleaned_price = float(item.get("price", 0.0))
            
            # Görsel URL'sini al
            imgs = item.get("images", [])
            img_url = imgs[0].get("image") if imgs else "Gorsel Yok"
            
            # Ürün URL'si (API link formatı url veriyor, vermezse kendimiz id ile yaratırız)
            url_slug = item.get("url")
            source_url = f"https://www.ikea.com.tr{url_slug}" if url_slug else f"https://www.ikea.com.tr/arama?k={item.get('sprCode','')}"

            if img_url == "Gorsel Yok" or not cleaned_price:
                print("  [*] Detaylar eksik, atlanıyor...")
                return False

            print("\n" + "="*60)
            print("IKEA API: URUN BASARIYLA KAZINDI")
            print("="*60)
            print(f"ISIM    : {title}")
            print(f"FIYAT   : {cleaned_price} TL")
            print(f"KATEGORI: {keyword.capitalize()}")
            print("="*60)
            
            print("AI Pipeline için Backend'e yollanıyor (Tripo3D 3D Modelleme)...")
            payload = {
                "name": title[:200],
                "source_url": source_url,
                "price": cleaned_price,
                "image_url": img_url,
                "model_url": None,
                "category": f"IKEA - {keyword.capitalize()}",
                "platform": "IKEA"
            }
            
            try:
                res = requests.post("http://127.0.0.1:8000/products/external-sync", json=payload, timeout=10)
                res_data = res.json()
                if res.status_code == 201:
                    print(f"[BASARILI] {res_data.get('message', 'Eklendi.')}")
                elif res_data.get('status') == 'exists':
                    print("[BILGI] Bu ürün zaten veritabanında varmış, atlandı.")
                else:
                    print(f"[HATA] Kayıt yapılamadı: {res.text}")
            except Exception as e:
                print(f"[HATA] Backend sunucusuna ulaşılamadı! {e}")
                
            print("="*60 + "\n")
            return True
            
        except requests.exceptions.RequestException as e:
            print(f"  [HATA] Ağ bağlantısı sorunu: {e}")
            time.sleep(10)
            
    return False

def run_expert_service():
    print(">>> IKEA UZMAN VERI ÇEKME (STEALTH) SERVISI BASLATILDI <<<")
    print("Bot algılamasından kaçınmak için istekler arası süreler UZUN ve RASTGELE tutulmuştur.")
    print("Durdurmak için CTRL+C basın.\n")
    
    # 1. Oturum (Session) Yönetimi:
    # Requests Session kullanmak, IKEA'nın sunucusunun bize verdiği çerezleri (cookies)
    # saklamamızı sağlar. Bu, arka arkaya gelen istekleri "gerçek bir tarayıcı" gibi gösterir.
    session = requests.Session()
    
    # İlk girişte ana sayfayı ziyaret edip çerez (cookie) topluyoruz
    try:
        print("[*] Tarayıcı simülasyonu başlatılıyor, ana sayfa çerezleri toplanıyor...")
        session.get("https://www.ikea.com.tr/", headers=get_expert_headers(), timeout=15)
        time.sleep(random.uniform(3.0, 6.0))
    except Exception:
        pass
    
    while True:
        fetch_ikea_furniture(session)
        
        # UZMAN GİZLENME (STEALTH) BEKLEMESİ
        # Gerçek bir insanın bir ürünü incelemesi ve diğerine geçmesi vakit alır.
        # Bu yüzden agresif taramadan kaçınıp süreyi 35 saniye ile 85 saniye arası tutuyoruz.
        sleep_time = random.uniform(35.0, 85.0)
        print(f"[Stealth Mod] {sleep_time:.1f} saniye bekleniyor (Bot olarak işaretlenmemek için)...")
        try:
            time.sleep(sleep_time)
            print("\n" + "-"*60)
        except KeyboardInterrupt:
            print("\n[BILGI] Servis kullanıcı tarafından durduruldu.")
            sys.exit(0)

if __name__ == "__main__":
    run_expert_service()