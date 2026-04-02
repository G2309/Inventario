from pydantic import BaseModel
from datetime import date

class LoginRequest(BaseModel):
    usuario: str
    password: str

class IngresoRequest(BaseModel):
    cantidad: int
    fecha: date
    usuario_id: int

class RevertirRequest(BaseModel):
    cantidad: int
    fecha: date
