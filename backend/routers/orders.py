from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, auth, database

router = APIRouter(
    prefix="/orders",
    tags=["orders"],
)

@router.post("/", response_model=schemas.Transaction)
def create_order(
    order: schemas.TransactionCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    if current_user.role != models.UserRole.BUYER:
        raise HTTPException(status_code=403, detail="Only buyers can place orders")
    
    # Check if supplier exists
    supplier = db.query(models.User).filter(models.User.id == order.supplier_id, models.User.role == models.UserRole.SUPPLIER).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")

    db_order = models.Transaction(
        buyer_id=current_user.id,
        supplier_id=order.supplier_id,
        chilli_type=order.chilli_type,
        quantity_kg=order.quantity_kg,
        total_price=order.total_price,
        status="pending"
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

@router.get("/", response_model=List[schemas.Transaction])
def read_orders(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    if current_user.role == models.UserRole.SUPPLIER:
        orders = db.query(models.Transaction).filter(models.Transaction.supplier_id == current_user.id).order_by(models.Transaction.created_at.desc()).offset(skip).limit(limit).all()
    elif current_user.role == models.UserRole.BUYER:
        orders = db.query(models.Transaction).filter(models.Transaction.buyer_id == current_user.id).order_by(models.Transaction.created_at.desc()).offset(skip).limit(limit).all()
    else: # Admin
        orders = db.query(models.Transaction).order_by(models.Transaction.created_at.desc()).offset(skip).limit(limit).all()
    return orders

@router.patch("/{order_id}/status", response_model=schemas.Transaction)
def update_order_status(
    order_id: int,
    status: str,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    order = db.query(models.Transaction).filter(models.Transaction.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if current_user.role == models.UserRole.SUPPLIER:
        if order.supplier_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
        if status not in ["confirmed", "cancelled", "completed"]:
             raise HTTPException(status_code=400, detail="Invalid status")
    elif current_user.role == models.UserRole.BUYER:
        if order.buyer_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
        if status != "cancelled":
             raise HTTPException(status_code=400, detail="Buyers can only cancel orders")
    else:
        raise HTTPException(status_code=403, detail="Not authorized")

    order.status = status
    db.commit()
    db.refresh(order)
    return order
