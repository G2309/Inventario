from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..caex import CaexScraper 

scraper = CaexScraper()
router = APIRouter(tags=["Movimientos de Inventario"])

@router.post("/ingresos")
def registrar_ingreso(req: schemas.IngresoRequest, db: Session = Depends(get_db)):
    nuevos_costales = [models.Costal(fecha_descarga=req.fecha, estado="En Bodega") for _ in range(req.cantidad)]
    db.add_all(nuevos_costales)
    db.flush() 
    
    movimientos = [models.MovimientoInventario(costal_id=c.id, usuario_id=req.usuario_id, tipo_movimiento="Ingreso") for c in nuevos_costales]
    db.add_all(movimientos)
    
    registro = db.query(models.RegistroDiarioConsolidado).filter(models.RegistroDiarioConsolidado.fecha == req.fecha).first()
    if not registro:
        registro = models.RegistroDiarioConsolidado(fecha=req.fecha, costales_disponibles=req.cantidad, ingresados_descarga=req.cantidad)
        db.add(registro)
    else:
        registro.costales_disponibles += req.cantidad
        registro.ingresados_descarga += req.cantidad
        
    db.commit()
    total_bodega = db.query(models.Costal).filter(models.Costal.estado == "En Bodega").count()
    return {"mensaje": f"Se registraron {req.cantidad} costales.", "nuevo_saldo": total_bodega}

@router.post("/ingresos/revertir")
def revertir_ingreso(req: schemas.RevertirRequest, db: Session = Depends(get_db)):
    costales = db.query(models.Costal).filter(models.Costal.fecha_descarga == req.fecha, models.Costal.estado == "En Bodega").order_by(models.Costal.id.desc()).limit(req.cantidad).all()
    if len(costales) < req.cantidad:
        raise HTTPException(status_code=400, detail="No hay suficientes costales de esta fecha para revertir.")

    for costal in costales:
        db.query(models.MovimientoInventario).filter(models.MovimientoInventario.costal_id == costal.id).delete()
        db.delete(costal)

    registro = db.query(models.RegistroDiarioConsolidado).filter(models.RegistroDiarioConsolidado.fecha == req.fecha).first()
    if registro:
        registro.costales_disponibles -= req.cantidad
        registro.ingresados_descarga -= req.cantidad

    db.commit()
    total_bodega = db.query(models.Costal).filter(models.Costal.estado == "En Bodega").count()
    return {"mensaje": f"Se anularon {req.cantidad} costales por error de digitación.", "nuevo_saldo": total_bodega}

@router.post("/despachos")
def registrar_despacho(req: schemas.DespachoRequest, db: Session = Depends(get_db)):
    costales_disponibles = db.query(models.Costal).filter(models.Costal.estado == "En Bodega").limit(req.cantidad).all()
    if len(costales_disponibles) < req.cantidad:
        raise HTTPException(status_code=400, detail=f"No hay suficientes costales. Solo hay {len(costales_disponibles)} en bodega.")

    movimientos = []
    for costal in costales_disponibles:
        costal.estado = "Enviado"
        costal.guia_logistica = req.guia_logistica
        costal.agencia_ubicacion = req.agencia_ubicacion
        movimientos.append(models.MovimientoInventario(costal_id=costal.id, usuario_id=req.usuario_id, tipo_movimiento="Despacho"))
    
    db.add_all(movimientos)

    registro = db.query(models.RegistroDiarioConsolidado).filter(models.RegistroDiarioConsolidado.fecha == req.fecha).first()
    if not registro:
        registro = models.RegistroDiarioConsolidado(fecha=req.fecha, enviados=req.cantidad, costales_disponibles=-req.cantidad)
        db.add(registro)
    else:
        registro.enviados += req.cantidad
        registro.costales_disponibles -= req.cantidad

    db.commit()
    total_bodega = db.query(models.Costal).filter(models.Costal.estado == "En Bodega").count()
    return {"mensaje": f"Se despacharon {req.cantidad} costales con la guía {req.guia_logistica}.", "nuevo_saldo": total_bodega}

@router.post("/devoluciones")
def registrar_devolucion(req: schemas.DevolucionRequest, db: Session = Depends(get_db)):
    costales_enviados = db.query(models.Costal).filter(models.Costal.guia_logistica == req.guia_logistica, models.Costal.estado == "Enviado").all()
    if not costales_enviados:
        raise HTTPException(status_code=404, detail="No se encontraron costales enviados con esa guía.")

    cantidad_devuelta = len(costales_enviados)
    movimientos = []
    for costal in costales_enviados:
        costal.estado = "En Bodega" 
        costal.intentos_entrega += 1
        movimientos.append(models.MovimientoInventario(costal_id=costal.id, usuario_id=req.usuario_id, tipo_movimiento="Devolucion"))
        
    db.add_all(movimientos)

    registro = db.query(models.RegistroDiarioConsolidado).filter(models.RegistroDiarioConsolidado.fecha == req.fecha).first()
    if not registro:
        registro = models.RegistroDiarioConsolidado(fecha=req.fecha, devoluciones=cantidad_devuelta, costales_disponibles=cantidad_devuelta)
        db.add(registro)
    else:
        registro.devoluciones += cantidad_devuelta
        registro.costales_disponibles += cantidad_devuelta

    db.commit()
    total_bodega = db.query(models.Costal).filter(models.Costal.estado == "En Bodega").count()
    return {"mensaje": f"Se devolvieron {cantidad_devuelta} costales de la guía {req.guia_logistica}.", "nuevo_saldo": total_bodega}

@router.post("/despachos/anular")
def anular_despacho(req: schemas.DevolucionRequest, db: Session = Depends(get_db)):
    costales_enviados = db.query(models.Costal).filter(models.Costal.guia_logistica == req.guia_logistica, models.Costal.estado == "Enviado").all()
    if not costales_enviados:
        raise HTTPException(status_code=404, detail="Guía no encontrada o ya procesada.")

    cantidad_anulada = len(costales_enviados)
    for costal in costales_enviados:
        costal.estado = "En Bodega"
        costal.guia_logistica = None
        costal.agencia_ubicacion = None
        db.query(models.MovimientoInventario).filter(models.MovimientoInventario.costal_id == costal.id, models.MovimientoInventario.tipo_movimiento == "Despacho").delete()

    registro = db.query(models.RegistroDiarioConsolidado).filter(models.RegistroDiarioConsolidado.fecha == req.fecha).first()
    if registro:
        registro.enviados -= cantidad_anulada
        registro.costales_disponibles += cantidad_anulada

    db.commit()
    total_bodega = db.query(models.Costal).filter(models.Costal.estado == "En Bodega").count()
    return {"mensaje": f"Se anuló la salida de la guía {req.guia_logistica}. {cantidad_anulada} costales regresaron.", "nuevo_saldo": total_bodega}

@router.get("/rastreo/{guia}")
def rastrear_paquete_caex(guia: str):
    resultado = scraper.rastrear(guia)
    if "error" in resultado:
        raise HTTPException(status_code=404, detail=resultado["error"])
    return resultado
