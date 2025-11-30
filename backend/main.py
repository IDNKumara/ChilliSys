from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models
from .database import engine
from .routers import users, inventory, predict, prices, dashboard, messages, orders

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Chilli Management System API")

app.include_router(users.router)
app.include_router(inventory.router)
app.include_router(predict.router)
app.include_router(prices.router)
app.include_router(dashboard.router)
app.include_router(messages.router)
app.include_router(orders.router)

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Chilli Management System API"}
