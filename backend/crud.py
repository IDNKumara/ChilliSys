from sqlalchemy.orm import Session
from . import models, schemas
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user_update: schemas.UserUpdate):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        if user_update.password:
             db_user.hashed_password = get_password_hash(user_update.password)
        if user_update.full_name:
            db_user.full_name = user_update.full_name
        if user_update.address:
            db_user.address = user_update.address
        if user_update.phone_number:
            db_user.phone_number = user_update.phone_number
        if user_update.role:
            db_user.role = user_update.role
        if user_update.email:
             db_user.email = user_update.email
        # Handle is_active if passed (need schema update or separate param, assuming schema has it or we add it)
        # For now, let's assume UserCreate might not have is_active, so we might need a UserUpdate schema.
        # Let's stick to simple updates for now.
        db.commit()
        db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        db.delete(db_user)
        db.commit()
    return db_user

def get_inventory(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Inventory).offset(skip).limit(limit).all()

def create_inventory_item(db: Session, item: schemas.InventoryCreate, user_id: int):
    db_item = models.Inventory(**item.dict(), supplier_id=user_id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def update_inventory_item(db: Session, item_id: int, item: schemas.InventoryCreate):
    db_item = db.query(models.Inventory).filter(models.Inventory.id == item_id).first()
    if db_item:
        for key, value in item.dict().items():
            setattr(db_item, key, value)
        db.commit()
        db.refresh(db_item)
    return db_item

def delete_inventory_item(db: Session, item_id: int):
    db_item = db.query(models.Inventory).filter(models.Inventory.id == item_id).first()
    if db_item:
        db.delete(db_item)
        db.commit()
    return db_item
