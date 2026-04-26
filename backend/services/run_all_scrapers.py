"""
run_all_scrapers.py — Tüm Scraper Servislerini Paralel Çalıştırıcı
====================================================================
Her scraper ayrı bir thread'de çalışır; biri çökse diğerleri etkilenmez.
Çalıştırma:
    python run_all_scrapers.py              # tümü
    python run_all_scrapers.py modalife     # sadece modalife
    python run_all_scrapers.py amazon ikea  # seçimli
"""

import sys
import logging
import threading
import time
import random

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(threadName)-12s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("orchestrator")

sys.stdout.reconfigure(encoding="utf-8") if hasattr(sys.stdout, "reconfigure") else None


def _run_with_guard(name: str, fn, *args, **kwargs):
    """Scraper fonksiyonunu sonsuz döngüde çalıştırır; çökerse loglayıp yeniden başlatır."""
    while True:
        try:
            log.info("[%s] Scraper başlatılıyor...", name)
            fn(*args, **kwargs)
        except KeyboardInterrupt:
            log.info("[%s] Durduruldu.", name)
            break
        except Exception as exc:
            log.exception("[%s] Beklenmedik çökme: %s — 30 sn sonra yeniden başlatılıyor.", name, exc)
            time.sleep(30)


def start_modalife():
    from services.modalife_scraper import run_service as modalife_run
    _run_with_guard("Modalife", modalife_run, min_delay=35, max_delay=75)


def start_amazon():
    from services.amazon_scraper import run_service as amazon_run
    _run_with_guard("Amazon", amazon_run)


def start_ikea():
    from services.ikea_scraper import run_expert_service as ikea_run
    _run_with_guard("IKEA", ikea_run)


def start_trendyol():
    from services.trendyol_scraper import run_service as trendyol_run
    _run_with_guard("Trendyol", trendyol_run)


SCRAPERS: dict[str, callable] = {
    "modalife": start_modalife,
    "amazon":   start_amazon,
    "ikea":     start_ikea,
    "trendyol": start_trendyol,
}


def main():
    requested = [a.lower() for a in sys.argv[1:]] if len(sys.argv) > 1 else list(SCRAPERS.keys())
    selected = {k: v for k, v in SCRAPERS.items() if k in requested}

    if not selected:
        log.error("Geçersiz scraper adları: %s", sys.argv[1:])
        log.error("Geçerli seçenekler: %s", list(SCRAPERS.keys()))
        sys.exit(1)

    log.info("=" * 60)
    log.info("Başlatılan scraper'lar: %s", list(selected.keys()))
    log.info("=" * 60)

    threads: list[threading.Thread] = []
    for name, fn in selected.items():
        # Her scraper başlangıçta rastgele gecikmeyle başlasın (aynı anda hepsinin istek atmasını önle)
        start_delay = random.uniform(0, 10)
        t = threading.Thread(
            target=lambda f=fn, d=start_delay: (time.sleep(d), f()),
            name=name.capitalize(),
            daemon=True,
        )
        t.start()
        threads.append(t)
        log.info("Thread başlatıldı: %s (%.1f sn gecikmeyle)", name, start_delay)

    try:
        # Ana thread'i canlı tut; tüm daemon thread'ler çalıştığı sürece devam eder
        while any(t.is_alive() for t in threads):
            time.sleep(5)
    except KeyboardInterrupt:
        log.info("\nTüm servisler durduruldu (CTRL+C).")


if __name__ == "__main__":
    main()
