from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models
from .database import engine, get_db
from .routers import auth, inventario, reportes

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="API Kardex Bioagricsa")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# routers
app.include_router(auth.router)
app.include_router(inventario.router)
app.include_router(reportes.router)

@app.on_event("startup")
def crear_usuario_prueba():
    db = next(get_db())
    usuario_test = db.query(models.Usuario).filter(models.Usuario.nombre == "test").first()
    if not usuario_test:
        password_encriptada = auth.obtener_hash_password("123")
        nuevo_usuario = models.Usuario(
            nombre="test", 
            password_hash=password_encriptada, 
            rol="Gerente"
        )
        db.add(nuevo_usuario)
        db.commit()
