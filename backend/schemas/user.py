from pydantic import BaseModel, ConfigDict
from datetime import datetime


class UserResponse(BaseModel):
    id: str
    email: str
    username: str
    full_name: str | None = None
    avatar_url: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    full_name: str | None = None
    avatar_url: str | None = None
    username: str | None = None
