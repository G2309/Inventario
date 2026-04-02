from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import bcrypt 
from datetime import datetime, timezone

from . import models, schemas
from .database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="API Cardex Bioagricsa")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def obtener_hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verificar_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

@app.on_event("startup")
def crear_usuario_prueba():
    db = next(get_db())
    usuario_test = db.query(models.Usuario).filter(models.Usuario.nombre == "test").first()
    if not usuario_test:
        password_encriptada = obtener_hash_password("123")
        nuevo_usuario = models.Usuario(
            nombre="test", 
            password_hash=password_encriptada, 
            rol="Gerente"
        )
        db.add(nuevo_usuario)
        db.commit()

@app.post("/login")
def login(req: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.Usuario).filter(models.Usuario.nombre == req.usuario).first()
    
    if not user or not verificar_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")
        
    return {"mensaje": "Login exitoso", "usuario": user.nombre, "rol": user.rol}

@app.post("/ingresos")
def registrar_ingreso(req: schemas.IngresoRequest, db: Session = Depends(get_db)):
    nuevos_costales = []
    for _ in range(req.cantidad):
        nuevo_costal = models.Costal(
            fecha_descarga=req.fecha,
            estado="En Bodega"
        )
        nuevos_costales.append(nuevo_costal)
    
    db.add_all(nuevos_costales)
    
    registro = db.query(models.RegistroDiarioConsolidado).filter(models.RegistroDiarioConsolidado.fecha == req.fecha).first()
    if not registro:
        registro = models.RegistroDiarioConsolidado(
            fecha=req.fecha, 
            costales_disponibles=req.cantidad, 
            ingresados_descarga=req.cantidad
        )
        db.add(registro)
    else:
        registro.costales_disponibles += req.cantidad
        registro.ingresados_descarga += req.cantidad
        
    db.commit()
    
    return {"mensaje": f"Se registraron {req.cantidad} costales exitosamente"}
