from fastapi import APIRouter, Response, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import date
import csv
import io

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

@router.get("/historial")
def obtener_historial(fecha: date, db: Session = Depends(get_db)):
    movimientos = db.query(
        models.MovimientoInventario, models.Costal, models.Usuario
    ).join(
        models.Costal, models.MovimientoInventario.costal_id == models.Costal.id
    ).join(
        models.Usuario, models.MovimientoInventario.usuario_id == models.Usuario.id
    ).filter(
        func.date(models.MovimientoInventario.fecha_movimiento) == fecha
    ).order_by(models.MovimientoInventario.id.desc()).all()

    resultado = []
    for mov, costal, usuario in movimientos:
        resultado.append({
            "id": mov.id,
            "tipo": mov.tipo_movimiento,
            "hora": mov.fecha_movimiento.strftime("%H:%M:%S"),
            "usuario": usuario.nombre,
            "guia": costal.guia_logistica or "Sin guía"
        })
    return resultado

@router.get("/exportar")
def exportar_csv(mes: int, anio: int, db: Session = Depends(get_db)):
    movimientos = db.query(
        models.MovimientoInventario, models.Costal, models.Usuario
    ).join(
        models.Costal, models.MovimientoInventario.costal_id == models.Costal.id
    ).join(
        models.Usuario, models.MovimientoInventario.usuario_id == models.Usuario.id
    ).filter(
        extract('month', models.MovimientoInventario.fecha_movimiento) == mes,
        extract('year', models.MovimientoInventario.fecha_movimiento) == anio
    ).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID Movimiento", "Tipo", "Fecha y Hora", "Usuario", "Guia Logistica", "Estado Actual del Costal"])

    for mov, costal, usuario in movimientos:
        writer.writerow([
            mov.id,
            mov.tipo_movimiento,
            mov.fecha_movimiento.strftime("%Y-%m-%d %H:%M:%S"),
            usuario.nombre,
            costal.guia_logistica or "N/A",
            costal.estado
        ])

    response = Response(content=output.getvalue(), media_type="text/csv")
    response.headers["Content-Disposition"] = f"attachment; filename=Kardex_{anio}_{mes:02d}.csv"
    return response
