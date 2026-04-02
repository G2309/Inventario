from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date

from .. import models
from ..database import get_db

router = APIRouter(prefix="/reportes", tags=["Reportes Gerenciales"])

@router.get("/dashboard-hoy")
def obtener_resumen_hoy(db: Session = Depends(get_db)):
    hoy = date.today()
    
    registro_hoy = db.query(models.RegistroDiarioConsolidado).filter(
        models.RegistroDiarioConsolidado.fecha == hoy
    ).first()
    
    total_bodega = db.query(models.Costal).filter(models.Costal.estado == "En Bodega").count()
    
    primer_dia_mes = hoy.replace(day=1)
    acumulados = db.query(
        func.sum(models.RegistroDiarioConsolidado.enviados).label("total_enviados"),
        func.sum(models.RegistroDiarioConsolidado.devoluciones).label("total_devoluciones")
    ).filter(
        models.RegistroDiarioConsolidado.fecha >= primer_dia_mes
    ).first()

    return {
        "fecha": hoy,
        "total_bodega": total_bodega,
        "hoy": {
            "ingresados": registro_hoy.ingresados_descarga if registro_hoy else 0,
            "enviados": registro_hoy.enviados if registro_hoy else 0,
            "devoluciones": registro_hoy.devoluciones if registro_hoy else 0
        },
        "mes": {
            "enviados": acumulados.total_enviados or 0,
            "devoluciones": acumulados.total_devoluciones or 0
        }
    }
