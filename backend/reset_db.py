from database import engine, Base
from models.schemas import User, Product, SearchHistory, Favorite

def reset_database():
    print("Mevcut tablolar siliniyor...")
    Base.metadata.drop_all(bind=engine)
    print("Yeni şemaya göre tablolar oluşturuluyor...")
    Base.metadata.create_all(bind=engine)
    print("Veritabanı sıfırlama işlemi tamamlandı! Şimdi `python seed.py` çalıştırabilirsiniz.")

if __name__ == "__main__":
    reset_database()
