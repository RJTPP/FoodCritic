from pydantic import BaseModel, EmailStr, constr
from typing import Optional

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    phone: Optional[constr(max_length=20)] = None
    role: Optional[str] = "user"

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    user_id: int
    username: str
    email: EmailStr
    phone: Optional[str]

    class Config:
        from_attributes = True  # Allows ORM-to-Pydantic conversion