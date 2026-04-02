from fastapi import FastAPI
from . import models
from .database import engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="API Cardex Bioagricsa")

@app.get("/")
def read_root():
    return {"mensaje": "API del Sistema de Inventario Inteligente (Cardex) funcionando"}
