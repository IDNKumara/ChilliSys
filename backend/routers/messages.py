from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List
from .. import models, schemas, auth, database

router = APIRouter(
    prefix="/messages",
    tags=["messages"],
)

@router.post("/", response_model=schemas.Message)
def create_message(
    message: schemas.MessageCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    # Check if receiver exists
    receiver = db.query(models.User).filter(models.User.id == message.receiver_id).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")
    
    db_message = models.Message(
        sender_id=current_user.id,
        receiver_id=message.receiver_id,
        content=message.content
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

@router.get("/inbox", response_model=List[schemas.Message])
def read_inbox(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    messages = db.query(models.Message).filter(
        models.Message.receiver_id == current_user.id
    ).order_by(models.Message.timestamp.desc()).offset(skip).limit(limit).all()
    return messages

@router.get("/sent", response_model=List[schemas.Message])
def read_sent(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    messages = db.query(models.Message).filter(
        models.Message.sender_id == current_user.id
    ).order_by(models.Message.timestamp.desc()).offset(skip).limit(limit).all()
    return messages

@router.get("/conversation/{other_user_id}", response_model=List[schemas.Message])
def read_conversation(
    other_user_id: int,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    # Get messages between current user and other user
    messages = db.query(models.Message).filter(
        or_(
            and_(models.Message.sender_id == current_user.id, models.Message.receiver_id == other_user_id),
            and_(models.Message.sender_id == other_user_id, models.Message.receiver_id == current_user.id)
        )
    ).order_by(models.Message.timestamp.asc()).offset(skip).limit(limit).all()
    return messages
