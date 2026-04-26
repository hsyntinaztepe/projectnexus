"""
modalife_scraper.py — Modalife.com Mobilya Scraper
=======================================================
Gerçek site analizi sonucu belirlenen kesin CSS seçiciler:
  - Kart konteyner : div.showcase
  - İsim           : div.showcase-title a
  - Fiyat (yeni)   : div.showcase-price-new
  - Fiyat (eski)   : div.showcase-price-old
  - Görsel         : img.lazyload[data-src]   ← lazy-load, src değil!
  - Ürün linki     : div.showcase-title a[href]
  - Ürün ID        : a.add-to-cart-button[data-product-id]

URL yapısı:
  Kategori : https://www.modalife.com/kategori/<slug>
  Ürün     : https://www.modalife.com/urun/<slug>

Pipeline: scrape → POST /products/external-sync
          → Gemini 2.5 Flash (görsel → 3D prompt)
          → Tripo3D API (text-to-model)
          → .glb kaydet → DB model_url güncelle
"""

import re
import sys
import time
import random
import logging
import requests
import urllib.parse
from dataclasses import dataclass, field
from typing import Optional
from bs4 import BeautifulSoup

# ─── Ortam Yapılandırması ─────────────────────────────────────────────────────

sys.stdout.reconfigure(encoding="utf-8") if hasattr(sys.stdout, "reconfigure") else None

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("modalife")

# ─── Sabitler ─────────────────────────────────────────────────────────────────

BASE_URL    = "https://www.modalife.com"
BACKEND_URL = "http://127.0.0.1:8000/products/external-sync"

# Gerçek kategori URL'leri (site analizi sonucu)
CATEGORIES: dict[str, str] = {
    "/kategori/koltuk-takimlari":             "Koltuk Takımı",
    "/kategori/kose-takimlari-mobilyalari":   "Köşe Takımı",
    "/kategori/kanepeler-yatakli-sandikli-cekyat": "Kanepe / Çekyat",
    "/kategori/berjer-tekli-koltuk":          "Berjer & Tekli Koltuk",
    "/kategori/sallanan-koltuk":              "Sallanan Koltuk",
    "/kategori/tv-uniteleri":                 "TV Ünitesi",
    "/kategori/yemek-masasi":                 "Yemek Masası",
    "/kategori/sandalye-1":                   "Sandalye",
    "/kategori/karyola-modelleri":            "Karyola",
    "/kategori/mutfak-masasi":                "Mutfak Masası",
    "/kategori/genc-odasi-komodin":           "Komodin",
    "/kategori/orta-puflar":                  "Puf & Sehpa",
    "/kategori/bahce-balkon-tekil-sandalye":  "Bahçe Sandalyesi",
}

USER_AGENTS: list[str] = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
]

# ─── Veri Modeli ──────────────────────────────────────────────────────────────

@dataclass
class ScrapedProduct:
    name: str
    source_url: str
    price: float
    image_url: Optional[str]
    category: str
    platform: str = "Modalife"
    model_url: Optional[str] = None
    description: Optional[str] = None
    colors: list[str] = field(default_factory=list)

# ─── Yardımcı Fonksiyonlar ────────────────────────────────────────────────────

def stealth_headers(referer: Optional[str] = None) -> dict:
    """
    Cloudflare/WAF bypass için tam tarayıcı profili.
    Modalife, Sec-Ch-Ua başlıkları olmadan da normal cevap veriyor (analiz sonucu).
    """
    ua = random.choice(USER_AGENTS)
    h = {
        "User-Agent": ua,
        "Accept": (
            "text/html,application/xhtml+xml,application/xml;"
            "q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8"
        ),
        "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
        "Accept-Encoding": "gzip, deflate",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
    }
    if referer:
        h["Referer"] = referer
    return h


def parse_price_tr(raw: str) -> float:
    """
    Türkçe fiyat formatını float'a çevirir.
    '36.111,00 TL' → 36111.0  |  '1.299,99 TL' → 1299.99
    """
    if not raw:
        return 0.0
    cleaned = re.sub(r"[^\d,.]", "", raw.strip())
    if not cleaned:
        return 0.0
    # Türkçe: 1.234,56  (nokta=binlik, virgül=ondalık)
    if re.search(r"\d{1,3}(\.\d{3})+,\d{2}$", cleaned):
        cleaned = cleaned.replace(".", "").replace(",", ".")
    # Sadece virgüllü ondalık: 1234,56
    elif "," in cleaned and "." not in cleaned:
        cleaned = cleaned.replace(",", ".")
    try:
        return round(float(cleaned), 2)
    except ValueError:
        return 0.0


def normalize_image_url(src: str) -> Optional[str]:
    """
    Modalife CDN URL'lerini normalize eder.
    '//www.modalife.com/...' → 'https://www.modalife.com/...'
    """
    if not src:
        return None
    if src.startswith("//"):
        src = "https:" + src
    if src.startswith("http") and "loader.gif" not in src and "placeholder" not in src:
        return src
    return None

# ─── Oturum Yöneticisi ────────────────────────────────────────────────────────

class ModalifeSession:
    """
    Session tabanlı bağlantı yöneticisi.
    - Çerez kalıcılığı (PHPSESSID, site_language vb.)
    - Kademeli geri çekilme (exponential backoff) 429/503 için
    - Tek seferlik ana sayfa ısınması
    """

    def __init__(self):
        self.session = requests.Session()
        self._warmed = False

    def warm_up(self):
        if self._warmed:
            return
        try:
            log.info("Oturum ısınıyor: modalife.com ana sayfa çerezleri alınıyor...")
            self.session.get(BASE_URL, headers=stealth_headers(), timeout=15)
            time.sleep(random.uniform(2.0, 4.0))
            self._warmed = True
            log.info("Oturum hazır.")
        except Exception as exc:
            log.warning("Isınma başarısız (devam ediliyor): %s", exc)

    def get(self, url: str, referer: Optional[str] = None, retries: int = 4) -> Optional[requests.Response]:
        base_delay = random.uniform(1.5, 3.0)
        for attempt in range(1, retries + 1):
            try:
                log.info("[%d/%d] GET %s", attempt, retries, url)
                resp = self.session.get(
                    url,
                    headers=stealth_headers(referer=referer or BASE_URL),
                    timeout=18,
                )
                if resp.status_code == 200:
                    return resp
                if resp.status_code in (429, 503):
                    wait = base_delay * (2 ** (attempt - 1)) + random.uniform(0, 3)
                    log.warning("HTTP %d — %.1f sn backoff bekleniyor...", resp.status_code, wait)
                    time.sleep(wait)
                    continue
                log.warning("HTTP %d döndü: %s", resp.status_code, url)
                return None
            except requests.exceptions.RequestException as exc:
                wait = base_delay * (2 ** (attempt - 1))
                log.error("Ağ hatası (%d/%d): %s — %.1f sn sonra tekrar...", attempt, retries, exc, wait)
                time.sleep(wait)
        return None

# ─── HTML Ayrıştırıcısı ───────────────────────────────────────────────────────

def parse_showcase_cards(soup: BeautifulSoup) -> list:
    """
    Modalife'ye özgü 'div.showcase' kart yapısını ayrıştırır.
    Her kart: isim, fiyat, görsel (data-src), link, ürün ID içerir.
    """
    return soup.select("div.showcase")


def extract_product_from_card(card, category: str) -> Optional[ScrapedProduct]:
    """
    Tek bir div.showcase kartından ScrapedProduct nesnesi üretir.
    Eksik kritik alan varsa None döner.
    """
    # ── İsim ──────────────────────────────────────────────────────────
    title_el = card.select_one("div.showcase-title a")
    if not title_el:
        return None
    name = title_el.get_text(strip=True)[:200]
    if not name:
        return None

    # ── Ürün URL'si ────────────────────────────────────────────────────
    href = title_el.get("href", "")
    source_url = (BASE_URL + href) if href.startswith("/") else href
    if not source_url or source_url == BASE_URL:
        return None

    # ── Fiyat (önce indirimli, yoksa normal) ──────────────────────────
    price_el = card.select_one("div.showcase-price-new") or card.select_one("div.showcase-price-old")
    price = parse_price_tr(price_el.get_text(strip=True)) if price_el else 0.0

    # ── Görsel (lazy-load → data-src kullan) ──────────────────────────
    img_el = card.select_one("img.lazyload[data-src]")
    image_url = None
    if img_el:
        raw_src = img_el.get("data-src", "")
        image_url = normalize_image_url(raw_src)

    # Görseli olmayan ürünler AI pipeline için işe yaramaz
    if not image_url:
        log.debug("Görsel yok, atlanıyor: %s", name)
        return None

    # ── İndirim yüzdesi (varsa açıklamaya ekle) ───────────────────────
    discount_el = card.select_one("div.discount-label")
    description = f"İndirim: {discount_el.get_text(strip=True)}" if discount_el else None

    return ScrapedProduct(
        name=name,
        source_url=source_url,
        price=price,
        image_url=image_url,
        category=f"Modalife - {category}",
        description=description,
    )

# ─── Sayfa Kazıyıcı ──────────────────────────────────────────────────────────

def scrape_category(session: ModalifeSession, path: str, category_name: str) -> Optional[ScrapedProduct]:
    """
    Belirtilen kategori sayfasından benzersiz ürünleri toplar,
    rastgele birini seçip döner.
    """
    url = BASE_URL + path
    resp = session.get(url, referer=BASE_URL)
    if not resp:
        log.error("Sayfa getirilemedi: %s", url)
        return None

    soup = BeautifulSoup(resp.content, "html.parser", from_encoding="utf-8")
    cards = parse_showcase_cards(soup)

    if not cards:
        log.warning("Ürün kartı bulunamadı: %s — Site yapısı değişmiş olabilir.", path)
        return None

    log.info("%d ürün kartı bulundu [%s]", len(cards), category_name)

    # Rastgele sırayla dene, geçerli ürün bulana kadar
    random.shuffle(cards)
    for card in cards[:15]:
        product = extract_product_from_card(card, category_name)
        if product:
            return product

    log.warning("15 kartın hiçbirinden geçerli ürün çıkarılamadı.")
    return None

# ─── Backend Entegrasyonu ─────────────────────────────────────────────────────

def push_to_backend(product: ScrapedProduct) -> bool:
    """
    Ürünü /products/external-sync endpoint'ine POST eder.
    Backend bu endpoint üzerinden AI pipeline'ı (Gemini → Tripo3D) başlatır.
    """
    payload = {
        "name": product.name,
        "source_url": product.source_url,
        "price": product.price,
        "image_url": product.image_url,
        "model_url": product.model_url,
        "category": product.category,
        "description": product.description,
        "platform": product.platform,
        "colors": product.colors,
    }
    try:
        resp = requests.post(BACKEND_URL, json=payload, timeout=10)
        data = resp.json()

        if resp.status_code == 201:
            status = data.get("status", "added")
            if status == "exists":
                log.info("⚠  Zaten kayıtlı, atlandı: '%s'", product.name)
            else:
                msg = data.get("message", "Eklendi.")
                log.info("✅ %s", msg)
            return True

        log.error("Backend hatası %d: %s", resp.status_code, resp.text[:200])
        return False

    except requests.exceptions.ConnectionError:
        log.error("Backend'e bağlanılamadı. Backend çalışıyor mu? (%s)", BACKEND_URL)
        return False
    except requests.exceptions.RequestException as exc:
        log.error("Backend isteği başarısız: %s", exc)
        return False

# ─── Servis Döngüsü ───────────────────────────────────────────────────────────

def run_service(
    min_delay: float = 35.0,
    max_delay: float = 75.0,
    max_consecutive_failures: int = 6,
):
    """
    Ana scraping servis döngüsü.

    Stealth strateji:
    - İstekler arası 35–75 saniye rastgele bekleme (insan taklidi)
    - Her döngüde farklı kategori seçilir (shuffle)
    - Arka arkaya 6 başarısız denemede servis durur

    Args:
        min_delay: Döngüler arası minimum bekleme süresi (saniye).
        max_delay: Döngüler arası maksimum bekleme süresi (saniye).
        max_consecutive_failures: Bu kadar ardışık başarısız sonuçta servis durur.
    """
    log.info("=" * 60)
    log.info(">>> MODALİFE.COM SCRAPER SERVİSİ BAŞLATILDI <<<")
    log.info("Pipeline: Kazı → Gemini Prompt → Tripo3D 3D Model → DB")
    log.info("Durdurmak için CTRL+C basın.")
    log.info("=" * 60)

    session = ModalifeSession()
    session.warm_up()

    consecutive_failures = 0
    category_items = list(CATEGORIES.items())

    while True:
        random.shuffle(category_items)
        path, category_name = category_items[0]

        try:
            log.info("-" * 40)
            log.info("Kategori: %s", category_name)

            product = scrape_category(session, path, category_name)

            if product:
                push_to_backend(product)
                consecutive_failures = 0
            else:
                consecutive_failures += 1
                log.warning(
                    "Ürün kazınamadı. Ardışık başarısız: %d/%d",
                    consecutive_failures,
                    max_consecutive_failures,
                )

            if consecutive_failures >= max_consecutive_failures:
                log.error(
                    "%d kez arka arkaya başarısız. "
                    "Site yapısı değişmiş olabilir. Servis durduruluyor.",
                    max_consecutive_failures,
                )
                break

            delay = random.uniform(min_delay, max_delay)
            log.info("Sonraki döngü: %.1f sn bekleniyor...", delay)
            time.sleep(delay)

        except KeyboardInterrupt:
            log.info("\nKullanıcı tarafından durduruldu.")
            break
        except Exception as exc:
            log.exception("Beklenmedik hata: %s", exc)
            consecutive_failures += 1
            time.sleep(random.uniform(10, 20))

# ─── Tek Seferlik Test Modu ───────────────────────────────────────────────────

def run_once(path: str = "/kategori/koltuk-takimlari") -> Optional[ScrapedProduct]:
    """
    Tek bir kategoriden bir ürün çekip backend'e gönderir.
    Test/debug için kullanılır.

    Örnek:
        python modalife_scraper.py --once
    """
    session = ModalifeSession()
    session.warm_up()
    category_name = CATEGORIES.get(path, "Mobilya")
    product = scrape_category(session, path, category_name)

    if product:
        log.info("\n%s", "=" * 50)
        log.info("KAZILAN ÜRÜN")
        log.info("=" * 50)
        log.info("İsim    : %s", product.name)
        log.info("Fiyat   : %.2f TL", product.price)
        log.info("Kategori: %s", product.category)
        log.info("Görsel  : %s", product.image_url)
        log.info("URL     : %s", product.source_url)
        log.info("Açıklama: %s", product.description or "-")
        log.info("=" * 50)
        push_to_backend(product)
    else:
        log.warning("Ürün kazınamadı.")

    return product


if __name__ == "__main__":
    if "--once" in sys.argv:
        run_once()
    else:
        run_service()
