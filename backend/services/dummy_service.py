import urllib.request
import json

def fetch_furniture():
    url = "https://dummyjson.com/products/category/furniture"
    print(f"Veri çekiliyor: {url}...")
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                data = json.loads(response.read().decode())
                products = data.get('products', [])
                print(f"Başarıyla {len(products)} adet mobilya ürünü çekildi!\n")
                
                # Konsolu çok doldurmamak adına ilk 3 ürünü örnek olarak gösterelim
                for i, product in enumerate(products[:3], start=1):
                    print(f"--- Örnek Ürün {i} ---")
                    print(f"ID: {product['id']}")
                    print(f"İsim: {product['title']}")
                    print(f"Fiyat: ${product['price']}")
                    print(f"Puan: {product['rating']} / 5")
                    print(f"Açıklama: {product['description'][:60]}...")
                    print(f"Görsel URL: {product['thumbnail']}\n")
            else:
                print(f"Veri çekilemedi. Hata kodu: {response.status}")
    except Exception as e:
        print(f"Hata oluştu: {e}")

if __name__ == "__main__":
    fetch_furniture()
