from sqlalchemy import Column, String, Float, JSON, DateTime, ForeignKey, Integer
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    searches = relationship("SearchHistory", back_populates="user")

class Product(Base):
    __tablename__ = "products"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    source_url = Column(String, nullable=False)
    price = Column(Float)
    dimensions = Column(JSON)           
    image_url = Column(String)
    model_url = Column(String)         
    colors = Column(JSON, default=list)
    category = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class SearchHistory(Base):
    __tablename__ = "search_history"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id"))
    product_id = Column(String, ForeignKey("products.id"))
    searched_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="searches")
