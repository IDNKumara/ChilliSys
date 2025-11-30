from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, models, schemas, auth, database

router = APIRouter(
    prefix="/inventory",
    tags=["inventory"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[schemas.Inventory])
def read_inventory(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    items = crud.get_inventory(db, skip=skip, limit=limit)
    return items

@router.post("/", response_model=schemas.Inventory)
def create_inventory_item(
    item: schemas.InventoryCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    if current_user.role != models.UserRole.SUPPLIER and current_user.role != models.UserRole.ADMIN:
         raise HTTPException(status_code=403, detail="Only suppliers can add inventory")
    return crud.create_inventory_item(db=db, item=item, user_id=current_user.id)

@router.put("/{item_id}", response_model=schemas.Inventory)
def update_inventory_item(
    item_id: int,
    item: schemas.InventoryCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    db_item = db.query(models.Inventory).filter(models.Inventory.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
        
    if current_user.role != models.UserRole.SUPPLIER and current_user.role != models.UserRole.ADMIN:
         raise HTTPException(status_code=403, detail="Not authorized")
         
    if current_user.role == models.UserRole.SUPPLIER and db_item.supplier_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this item")

    return crud.update_inventory_item(db=db, item_id=item_id, item=item)

@router.delete("/{item_id}", response_model=schemas.Inventory)
def delete_inventory_item(
    item_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    db_item = db.query(models.Inventory).filter(models.Inventory.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
        
    if current_user.role != models.UserRole.SUPPLIER and current_user.role != models.UserRole.ADMIN:
         raise HTTPException(status_code=403, detail="Not authorized")
         
    if current_user.role == models.UserRole.SUPPLIER and db_item.supplier_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this item")

    return crud.delete_inventory_item(db=db, item_id=item_id)
