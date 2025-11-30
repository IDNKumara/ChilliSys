from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from .database import Base

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    SUPPLIER = "supplier"
    BUYER = "buyer"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(String, default=UserRole.BUYER)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    inventory_items = relationship("Inventory", back_populates="supplier")
    orders_placed = relationship("Transaction", back_populates="buyer", foreign_keys="Transaction.buyer_id")
    orders_received = relationship("Transaction", back_populates="supplier", foreign_keys="Transaction.supplier_id")
    sent_messages = relationship("Message", foreign_keys="Message.sender_id", back_populates="sender")
    received_messages = relationship("Message", foreign_keys="Message.receiver_id", back_populates="receiver")

class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey("users.id"))
    chilli_type = Column(String)
    quantity_kg = Column(Float)
    price_per_kg = Column(Float)
    description = Column(String, nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    supplier = relationship("User", back_populates="inventory_items")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("users.id"))
    supplier_id = Column(Integer, ForeignKey("users.id"))
    chilli_type = Column(String)
    quantity_kg = Column(Float)
    total_price = Column(Float)
    status = Column(String, default="pending") # pending, completed, cancelled
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    buyer = relationship("User", foreign_keys=[buyer_id], back_populates="orders_placed")
    supplier = relationship("User", foreign_keys=[supplier_id], back_populates="orders_received")

class PriceData(Base):
    __tablename__ = "price_data"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime)
    chilli_type = Column(String)
    price = Column(Float)
    is_predicted = Column(Boolean, default=False)

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer, ForeignKey("users.id"))
    content = Column(String)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    is_read = Column(Boolean, default=False)

    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="received_messages")
