from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import bcrypt

from .. import models, schemas
from ..database import get_db

router = APIRouter(tags=["Autenticación"])

def obtener_hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verificar_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

@router.post("/login")
def login(req: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.Usuario).filter(models.Usuario.nombre == req.usuario).first()
    
    if not user or not verificar_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")
        
    return {"mensaje": "Login exitoso", "usuario": user.nombre, "rol": user.rol, "id": user.id}
