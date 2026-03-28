from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from database import get_db
from models.schemas import Product, Favorite, SearchHistory, User
from schemas.product import (
    ProductResponse,
    ProductCreate,
    ProductUpdate,
    FavoriteResponse,
    SearchHistoryResponse,
)
from auth import get_current_user, get_optional_user

router = APIRouter(prefix="/products", tags=["Products"])


# ─── Public Routes ───────────────────────────────────────────────────────

@router.get("/", response_model=list[ProductResponse])
async def list_products(
    category: str | None = Query(None, description="Kategoriye göre filtrele"),
    search: str | None = Query(None, description="İsme göre ara"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Tüm ürünleri listele (public)"""
    query = db.query(Product).filter(Product.is_active == True)

    if category:
        query = query.filter(Product.category == category)

    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))

    products = query.order_by(Product.created_at.desc()).offset(skip).limit(limit).all()
    return [ProductResponse.model_validate(p) for p in products]


@router.get("/categories", response_model=list[str])
async def list_categories(db: Session = Depends(get_db)):
    """Mevcut kategorileri listele"""
    categories = (
        db.query(Product.category)
        .filter(Product.is_active == True, Product.category.isnot(None))
        .distinct()
        .all()
    )
    return [c[0] for c in categories]


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str, db: Session = Depends(get_db)):
    """Tek ürün detayını getir (public)"""
    product = db.query(Product).filter(
        Product.id == product_id, Product.is_active == True
    ).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ürün bulunamadı"
        )
    return ProductResponse.model_validate(product)


# ─── Admin / Ürün Yönetimi ───────────────────────────────────────────────

@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Yeni ürün ekle (auth gerekli)"""
    product = Product(
        name=product_data.name,
        source_url=product_data.source_url,
        price=product_data.price,
        dimensions=product_data.dimensions.model_dump() if product_data.dimensions else None,
        image_url=product_data.image_url,
        model_url=product_data.model_url,
        colors=product_data.colors,
        category=product_data.category,
        description=product_data.description,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return ProductResponse.model_validate(product)


# ─── Favoriler ────────────────────────────────────────────────────────────

@router.get("/user/favorites", response_model=list[ProductResponse])
async def get_favorites(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Kullanıcının favori ürünlerini getir"""
    favorites = (
        db.query(Product)
        .join(Favorite, Favorite.product_id == Product.id)
        .filter(Favorite.user_id == current_user.id, Product.is_active == True)
        .order_by(Favorite.created_at.desc())
        .all()
    )
    return [ProductResponse.model_validate(p) for p in favorites]


@router.post("/{product_id}/favorite", status_code=status.HTTP_201_CREATED)
async def add_favorite(
    product_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Ürünü favorilere ekle"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")

    existing = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.product_id == product_id,
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Ürün zaten favorilerde")

    fav = Favorite(user_id=current_user.id, product_id=product_id)
    db.add(fav)
    db.commit()
    return {"message": "Favorilere eklendi", "product_id": product_id}


@router.delete("/{product_id}/favorite", status_code=status.HTTP_200_OK)
async def remove_favorite(
    product_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Ürünü favorilerden kaldır"""
    fav = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.product_id == product_id,
    ).first()
    if not fav:
        raise HTTPException(status_code=404, detail="Favori bulunamadı")

    db.delete(fav)
    db.commit()
    return {"message": "Favorilerden kaldırıldı", "product_id": product_id}


@router.get("/{product_id}/is-favorite")
async def check_favorite(
    product_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Ürün favorilerde mi kontrol et"""
    existing = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.product_id == product_id,
    ).first()
    return {"is_favorite": existing is not None}


# ─── Arama Geçmişi ────────────────────────────────────────────────────────

@router.get("/user/search-history", response_model=list[SearchHistoryResponse])
async def get_search_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = Query(20, ge=1, le=100),
):
    """Kullanıcının arama geçmişini getir"""
    history = (
        db.query(SearchHistory)
        .filter(SearchHistory.user_id == current_user.id)
        .order_by(SearchHistory.searched_at.desc())
        .limit(limit)
        .all()
    )
    return [SearchHistoryResponse.model_validate(h) for h in history]


@router.post("/user/search-history", status_code=status.HTTP_201_CREATED)
async def add_search_history(
    search_url: str,
    product_id: str | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Arama geçmişine kayıt ekle"""
    entry = SearchHistory(
        user_id=current_user.id,
        search_url=search_url,
        product_id=product_id,
    )
    db.add(entry)
    db.commit()
    return {"message": "Arama kaydedildi"}
