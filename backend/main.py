from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from models import schemas

# Create local tables (if they don't exist)
try:
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")
except Exception as e:
    print("Error connecting to database:", e)

app = FastAPI(title="Project Nexus API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # Production'da kısıtlanmalı
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "Backend is running and connected to DB!"}

