from playwright.sync_api import sync_playwright
import time
import random
import urllib.parse
import sys
import requests

# Windows UTF-8 hatasını onarmak için
sys.stdout.reconfigure(encoding='utf-8') if hasattr(sys.stdout, 'reconfigure') else None

SEARCH_KEYWORDS = [
    "mobilya", "koltuk", "kitaplik", "calisma masasi",
    "sandalye", "gardirop", "televizyon unitesi", "sehpa"
]

def fetch_trendyol_furniture():
    keyword = random.choice(SEARCH_KEYWORDS)
    url = f"https://www.trendyol.com/sr?q={urllib.parse.quote(keyword)}"
    
    # 1) Playwright'i context olarak başlatıyoruz
    with sync_playwright() as p:
        # headless=True arkaplanda görünmez Chromium çalıştırır. (Trendyol WAF engelini böyle aşıyoruz!)
        browser = p.chromium.launch(headless=True)
        
        # Insan gibi gozukmek icin ozellikler:
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            locale="tr-TR",
            timezone_id="Europe/Istanbul",
            viewport={"width": 1920, "height": 1080}
        )
        page = context.new_page()
        
        try:
            print(f"> Trendyol'da araniyor: '{keyword}' (Playwright Zirh Aktif)")
            
            # 2) Trendyol sayfasina git
            # `wait_until="domcontentloaded"` yaparak tüm resimlerin inmesini beklemiyoruz, JS tetiklensin yeter
            page.goto(url, wait_until="domcontentloaded", timeout=20000)
            
            # Sayfayi asagi - yukari hafifce kaydirmak (insan taklidi - anti bot)
            page.mouse.wheel(0, 1000)
            time.sleep(1)
            page.mouse.wheel(0, -500)
            
            # 3) Ürünlerin olduğu div kutusunun gelmesini bekleyelim
            page.wait_for_selector(".p-card-wrppr", timeout=12000)
            
            # Bütün ürün kutularini sec
            items = page.query_selector_all(".p-card-wrppr")
            if not items:
                print("  [!] Sayfada urun karti bulunamadi (Javascript yuklenemedi veya engellendi).")
                return

            selected_item = random.choice(items)
            
            # 4) Elementleri DOM uzerinden ayiklayalim
            name_el = selected_item.query_selector(".prdct-desc-cntnr-name")
            title = name_el.inner_text().strip() if name_el else "Isim Bulunamadi"
            brand_el = selected_item.query_selector(".prdct-desc-cntnr-ttl")
            if brand_el and title != "Isim Bulunamadi":
                title = f"{brand_el.inner_text().strip()} {title}"

            price_el = selected_item.query_selector(".prc-box-dscntd")
            price = price_el.inner_text().strip() if price_el else "Fiyat Yok"
            
            cleaned_price = 0.0
            if price != "Fiyat Yok":
                try:
                    price_str = price.replace(" TL", "").replace(".", "").replace(",", ".")
                    cleaned_price = float(price_str)
                except ValueError:
                    cleaned_price = 0.0
                    
            img_el = selected_item.query_selector("img.p-card-img")
            img = img_el.get_attribute("src") if img_el else "Gorsel Yok"
            
            link_el = selected_item.query_selector("a")
            link = "https://www.trendyol.com" + link_el.get_attribute("href") if link_el else "Link Yok"
            
            print("\n" + "="*60)
            print("📦 TRENDYOL'DAN BIR URUN BASARIYLA KAZINDI (PLAYWRIGHT)")
            print("="*60)
            print(f"ISIM    : {title}")
            print(f"FIYAT   : {price}")
            print(f"KATEGORI: {keyword.capitalize()}")
            print("="*60)
            
            # 5) Backend'e API ile POST istegi atiyoruz
            payload = {
                "name": title[:200],
                "source_url": link,
                "price": cleaned_price,
                "image_url": img if img != "Gorsel Yok" else None,
                "model_url": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/SheenChair/glTF-Binary/SheenChair.glb",
                "category": f"Furniture - {keyword.capitalize()}",
                "platform": "Trendyol"
            }
            
            print("Backend sunucusuna (Veritabanina) kaydediliyor...")
            try:
                res = requests.post("http://127.0.0.1:8000/products/external-sync", json=payload, timeout=5)
                res_data = res.json()
                if res.status_code == 201:
                    print(f"[BASARILI] {res_data.get('message', 'Eklendi.')}")
                elif res_data.get('status') == 'exists':
                    print("[BILGI] Bu ürün zaten veritabaninda varmis, atlandi.")
                else:
                    print(f"[HATA] Backend kaydi basarisiz: {res.status_code}")
            except Exception as e:
                print(f"[HATA] Backend ulasilamadi! {e}")
                
            print("="*60 + "\n")
            
        except Exception as e:
            print(f"\n[HATA] Bot engeline takildik veya zaman asimi: {e}")
            
        finally:
            # Tarayıcıyı işimiz bitince mutlaka kapat
            browser.close()

def run_service():
    print(">>> TRENDYOL OTOMATIK VERI CEKME SERVISI BASLATILDI (PLAYWRIGHT MODU) <<<")
    print("Her ~30 saniyede bir gizli tarayici açarak urun secer. Durdurmak icin CTRL+C basin.\n")
    
    while True:
        fetch_trendyol_furniture()
        
        sleep_time = random.uniform(20.0, 40.0)
        print(f"[Yapay Zeka Modu] Trendyol'un bot olmadigimiza inanmasi için {sleep_time:.1f} sn dinleniliyor...\n")
        try:
            time.sleep(sleep_time)
        except KeyboardInterrupt:
            print("\n[BILGI] Servis durduruldu.")
            sys.exit(0)

if __name__ == "__main__":
    run_service()
