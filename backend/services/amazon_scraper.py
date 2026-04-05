import random
import time
import requests
import urllib.parse
from bs4 import BeautifulSoup
import sys

# Windows UTF-8 hatasını düzeltmek için (opsiyonel)
sys.stdout.reconfigure(encoding='utf-8') if hasattr(sys.stdout, 'reconfigure') else None

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
]

SEARCH_KEYWORDS = [
    "mobilya", "koltuk", "kitaplik", "calisma masasi", 
    "sandalye", "gardirop", "televizyon unitesi", "sehpa"
]

REFERERS = [
    "https://www.google.com.tr/",
    "https://www.bing.com/",
    "https://yandex.com.tr/",
    "https://www.amazon.com.tr/",
    "https://duckduckgo.com/",
]

def fetch_amazon_furniture(retries=3):
    # 1. Anti-Bot Önlemi: Hep "mobilya" aramak yerine rastgele aramalar yap
    keyword = random.choice(SEARCH_KEYWORDS)
    url = f"https://www.amazon.com.tr/s?k={urllib.parse.quote(keyword)}"
    
    for attempt in range(retries):
        headers = {
            "User-Agent": random.choice(USER_AGENTS),
            "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Referer": random.choice(REFERERS), # 2. Anti-Bot Önlemi: Referans siteyi sürekli değiştir
            "Connection": "keep-alive"
        }
        
        try:
            print(f"[{attempt+1}/{retries}] Amazon'da araniyor: '{keyword}' (Gizlenme aktif)")
            time.sleep(random.uniform(1.2, 3.1))
            
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 503:
                print("  [!] Amazon 503 HTTP dondu. Tarayici profili degistiriliyor...")
                time.sleep(5)
                continue
            elif response.status_code != 200:
                print(f"  [!] Beklenmeyen donus: {response.status_code}")
                continue
                
            soup = BeautifulSoup(response.content, "html.parser")
            items = soup.find_all("div", {"data-component-type": "s-search-result"})
            
            if not items:
                print("  [!] Urun bulunamadi veya CAPTCHA cikti. Sonraki kelime deneniyor...")
                continue
            
            selected_item = random.choice(items)
            
            title_el = selected_item.find("h2").find("span") if selected_item.find("h2") else None
            title = title_el.text.strip() if title_el else "Isim Bulunamadi"
            
            price_whole = selected_item.find("span", class_="a-price-whole")
            price_frac = selected_item.find("span", class_="a-price-fraction")
            if price_whole:
                try:
                    price_str = price_whole.text.strip().replace(".", "").replace(",", "")
                    cleaned_price = float(price_str)
                    price = f"{price_whole.text.strip()}{price_frac.text.strip() if price_frac else ''} TL"
                except ValueError:
                    cleaned_price = 0.0
                    price = "Fiyat Hatali"
            else:
                price = "Fiyat veya Stok Yok"
                cleaned_price = 0.0
                
            link_el = selected_item.find("a", class_="a-link-normal")
            link = "https://www.amazon.com.tr" + link_el["href"] if link_el and "href" in link_el.attrs else "Link Yok"
            
            img_el = selected_item.find("img", class_="s-image")
            img = (img_el.get("src") or img_el.get("data-src", "Gorsel Yok")) if img_el else "Gorsel Yok"
            
            print("\n" + "="*60)
            print("BIR URUN BASARIYLA KAZINDI (SCRAPED)")
            print("="*60)
            print(f"ISIM    : {title}")
            print(f"FIYAT   : {price}")
            print(f"KATEGORI: {keyword.capitalize()}")
            print("="*60)
            
            print("Backend sunucusuna (Veritabanina) kaydediliyor...")
            payload = {
                "name": title[:200],
                "source_url": link,
                "price": cleaned_price,
                "image_url": img if img != "Gorsel Yok" else None,
                "model_url": "http://192.168.0.3:8000/media/models/Koltuk.glb",
                "category": f"Furniture - {keyword.capitalize()}", # Kategoriye aranilan kelimeyi de ekleyelim
                "platform": "Amazon"
            }
            
            try:
                res = requests.post("http://127.0.0.1:8000/products/external-sync", json=payload, timeout=5)
                res_data = res.json()
                if res.status_code == 201:
                    print(f"[BASARILI] {res_data.get('message', 'Eklendi.')}")
                elif res_data.get('status') == 'exists':
                    print("[BILGI] Bu ürün zaten veritabaninda varmis, kayit atlandi.")
                else:
                    print(f"[HATA] Backend kaydi basarisiz: {res.status_code} - {res.text}")
            except Exception as e:
                print(f"[HATA] Backend sunucusuna ulasilamadi! {e}")
                
            print("="*60 + "\n")
            return
            
        except requests.exceptions.RequestException as e:
            print(f"Baglanti koptu: {e}")
            
    print("\n[HATA] Bu turda bot korumasi asilamadi.")

def run_service():
    print(">>> AMAZON OTOMATIK VERI CEKME SERVISI BASLATILDI <<<")
    print("Her ~30 saniyede bir calisacak. Durdurmak icin CTRL+C basin.\n")
    
    while True:
        fetch_amazon_furniture()
        
        # 3. Anti-Bot Önlemi: Asla tam 30.0 saniyede bir istek atma.
        # İnsan taklidi yapmak için gecikmeleri 20 ila 45 saniye arasında rastgele seç.
        sleep_time = random.uniform(20.0, 45.0)
        print(f"[Yapay Zeka Modu] Sürekli takip edilmemek için {sleep_time:.1f} saniye gözetleniyor...")
        try:
            time.sleep(sleep_time)
            print("\n" + "-"*60)
        except KeyboardInterrupt:
            print("\n[BILGI] Servis kullanici tarafindan durduruldu.")
            sys.exit(0)

if __name__ == "__main__":
    run_service()
