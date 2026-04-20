# Base de datos

El sistema utiliza PostgreSQL como motor de base de datos relacional, gestionado a través de SQLAlchemy como ORM. La arquitectura está diseñada para garantizar la trazabilidad individual (qué acciones realizó cada usuario, guardando los logs en una bitácora) de cada unidad de inventario.
 
La conexion se configura a traves de la variable de entorno `DATABASE_URL`. SQLAlchemy crea las tablas automaticamente al iniciar la aplicacion mediante `Base.metadata.create_all()`.
 
### Tablas
 
#### `usuarios`
Almacena las credenciales y el rol de cada operador del sistema.
 
| Columna | Tipo | Descripcion |
|---|---|---|
| id | Integer PK | Identificador unico |
| nombre | String | Nombre de usuario (unico) |
| password_hash | String | Contrasena hasheada con bcrypt |
| rol | String | Rol del usuario (ej. "Gerente") |
 
#### `costales`
Representa cada costal fisico en el sistema. Es la entidad central del inventario.
 
| Columna | Tipo | Descripcion |
|---|---|---|
| id | Integer PK | Identificador unico |
| guia_logistica | String | Numero de guia de envio asociada |
| cantidad_asociada | Integer | Cantidad agrupada (opcional) |
| fecha_descarga | Date | Fecha en que ingreso fisicamente |
| agencia_ubicacion | String | Agencia de destino |
| estado | String | Estado actual: `En Bodega`, `Enviado` |
| intentos_entrega | Integer | Cuantas veces fue devuelto |
| url_evidencia_visual | String | URL de foto de evidencia |
| fecha_registro | DateTime | Timestamp de creacion del registro |
 
#### `movimientos_inventario`
Registro auditado de cada accion realizada sobre un costal.
 
| Columna | Tipo | Descripcion |
|---|---|---|
| id | Integer PK | Identificador unico |
| costal_id | Integer FK | Costal al que pertenece el movimiento |
| usuario_id | Integer FK | Usuario que realizo la accion |
| tipo_movimiento | String | `Ingreso`, `Despacho`, `Devolucion` |
| fecha_movimiento | DateTime | Timestamp automatico del movimiento |
 
#### `registro_diario_consolidado`
Tabla de resumen por fecha. Se actualiza en cada operacion para agilizar los reportes del dashboard.
 
| Columna | Tipo | Descripcion |
|---|---|---|
| id | Integer PK | Identificador unico |
| fecha | Date | Fecha del registro (unica) |
| costales_disponibles | Integer | Saldo en bodega al final del dia |
| enviados | Integer | Total despachados en el dia |
| devoluciones | Integer | Total devueltos en el dia |
| ingresados_descarga | Integer | Total ingresados en el dia |
 
---
