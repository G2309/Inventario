from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from .database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary key=True, index=True)
    nombre = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False) 
    rol = Column(String, nullable=False) 

    movimientos = relationship("MovimientoInventario", back_populates="usuario")


class RegistroDiarioConsolidado(Base):
    __tablename__ = "registro_diario_consolidado"

    id = Column(Integer, primary key=True, index=True)
    fecha = Column(Date, unique=True, nullable=False)
    costales_disponibles = Column(Integer, default=0)
    enviados = Column(Integer, default=0)
    devoluciones = Column(Integer, default=0)
    ingresados_descarga = Column(Integer, default=0)

class Costal(Base):
    __tablename__ = "costales"

    id = Column(Integer, primary key=True, index=True)
    guia_logistica = Column(String, index=True, nullable=True)
    cantidad_asociada = Column(Integer, nullable=True)
    fecha_descarga = Column(Date, nullable=False)
    agencia_ubicacion = Column(String, nullable=True)
    estado = Column(String, nullable=False, default="En Bodega")
    intentos_entrega = Column(Integer, default=0)
    url_evidencia_visual = Column(String, nullable=True)
    # Corrección aplicada aquí:
    fecha_registro = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    movimientos = relationship("MovimientoInventario", back_populates="costal")

class MovimientoInventario(Base):
    __tablename__ = "movimientos_inventario"

    id = Column(Integer, primary key=True, index=True)
    costal_id = Column(Integer, ForeignKey("costales.id"), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    tipo_movimiento = Column(String, nullable=False) 
    # Corrección aplicada aquí:
    fecha_movimiento = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    costal = relationship("Costal", back_populates="movimientos")
    usuario = relationship("Usuario", back_populates="movimientos")
