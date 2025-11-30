from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from .models import UserRole

class UserBase(BaseModel):
    email: str
    full_name: str
    role: UserRole = UserRole.BUYER

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class InventoryBase(BaseModel):
    chilli_type: str
    quantity_kg: float
    price_per_kg: float
    description: Optional[str] = None

class InventoryCreate(InventoryBase):
    pass

class Inventory(InventoryBase):
    id: int
    supplier_id: int
    updated_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class MessageBase(BaseModel):
    content: str

class MessageCreate(MessageBase):
    receiver_id: int

class Message(MessageBase):
    id: int
    sender_id: int
    receiver_id: int
    timestamp: datetime
    is_read: bool

    class Config:
        from_attributes = True

class TransactionBase(BaseModel):
    chilli_type: str
    quantity_kg: float
    total_price: float

class TransactionCreate(TransactionBase):
    supplier_id: int

class Transaction(TransactionBase):
    id: int
    buyer_id: int
    supplier_id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
