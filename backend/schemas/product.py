from pydantic import BaseModel, ConfigDict
from datetime import datetime


class DimensionsSchema(BaseModel):
    width: float
    height: float
    depth: float


class ProductResponse(BaseModel):
    id: str
    name: str
    source_url: str
    price: float | None = None
    dimensions: DimensionsSchema | None = None
    image_url: str | None = None
    model_url: str | None = None
    colors: list[str] = []
    category: str | None = None
    description: str | None = None
    created_at: datetime
    
    model_config = ConfigDict(protected_namespaces=(), from_attributes=True)


class ProductCreate(BaseModel):
    name: str
    source_url: str
    price: float | None = None
    dimensions: DimensionsSchema | None = None
    image_url: str | None = None
    model_url: str | None = None
    colors: list[str] = []
    category: str | None = None
    description: str | None = None

    model_config = ConfigDict(protected_namespaces=())


class ProductUpdate(BaseModel):
    name: str | None = None
    price: float | None = None
    dimensions: DimensionsSchema | None = None
    image_url: str | None = None
    model_url: str | None = None
    colors: list[str] | None = None
    category: str | None = None
    description: str | None = None

    model_config = ConfigDict(protected_namespaces=())


class FavoriteResponse(BaseModel):
    id: int
    product_id: str
    product: ProductResponse
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SearchHistoryResponse(BaseModel):
    id: int
    search_url: str | None = None
    product_id: str | None = None
    searched_at: datetime

    model_config = ConfigDict(from_attributes=True)
