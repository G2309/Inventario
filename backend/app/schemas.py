from pydantic import BaseModel
from datetime import date

class LoginRequest(BaseModel):
    usuario: str
    password: str

class IngresoRequest(BaseModel):
    cantidad: int
    fecha: date
