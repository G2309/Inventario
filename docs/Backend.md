# Documentacion del Backend - Kardex Bioagricsa

## Descripcion general

El backend es una API REST construida con **FastAPI** (Python). Se encarga de gestionar el inventario de costales de la empresa Bioagricsa, registrando ingresos, despachos y devoluciones, y conectandose al portal de rastreo de Cargo Expreso (CAEX) para consultar el estado de guias logisticas.

---

## Stack tecnologico

| Componente | Tecnologia |
|---|---|
| Framework web | FastAPI |
| ORM | SQLAlchemy |
| Base de datos | PostgreSQL (via variable de entorno `DATABASE_URL`) |
| Validacion de datos | Pydantic |
| Autenticacion | bcrypt (hash de contrasenas, sin tokens JWT) |
| Web scraping | requests + BeautifulSoup4 |
| Cifrado | PyCryptodome (AES-CBC) |
| Contenedor | Docker |

---

## Modulos

### `main.py` - Punto de entrada

Inicializa la aplicacion FastAPI, configura CORS (abierto a todos los origenes en esta version), registra los tres routers y crea un usuario de prueba `test` con contrasena `123` y rol `Gerente` al arrancar, si no existe.

---

### `database.py` - Conexion a la base de datos

Configura el motor de SQLAlchemy a partir de `DATABASE_URL`, define la sesion local y expone la funcion `get_db()` como dependencia inyectable en FastAPI para manejar el ciclo de vida de cada sesion de base de datos.

---

### `models.py` - Modelos ORM

Define las cuatro tablas descritas arriba como clases Python. Los modelos `Costal`, `MovimientoInventario` y `Usuario` tienen relaciones declaradas con `relationship()` para facilitar los joins en SQLAlchemy.

---

### `schemas.py` - Validacion de entrada

Define los cuerpos de las peticiones usando Pydantic. Cada endpoint que recibe datos usa uno de estos esquemas:

| Schema | Usado en | Campos principales |
|---|---|---|
| `LoginRequest` | `POST /login` | `usuario`, `password` |
| `IngresoRequest` | `POST /ingresos` | `cantidad`, `fecha`, `usuario_id` |
| `RevertirRequest` | `POST /ingresos/revertir` | `cantidad`, `fecha` |
| `DespachoRequest` | `POST /despachos` | `cantidad`, `guia_logistica`, `agencia_ubicacion`, `fecha`, `usuario_id` |
| `DevolucionRequest` | `POST /devoluciones` y `POST /despachos/anular` | `guia_logistica`, `fecha`, `usuario_id` |

---

### `caex.py` - Scraper de Cargo Expreso

Se conecta al portal web privado de CAEX (`ws.caexlogistics.com`) para rastrear guias logisticas. El portal usa ASP.NET WebForms con campos ocultos de estado (`__VIEWSTATE`, etc.) y cifra las credenciales con AES-CBC antes de enviarlas.

**Flujo de autenticacion:**

1. Hace un GET al portal para obtener los campos `__VIEWSTATE`.
2. Cifra el codigo de empresa, usuario y contrasena con AES-CBC (clave e IV fijos en el codigo).
3. Envia un POST con las credenciales cifradas en campos ocultos (`hfCodigo`, `hfLogin`, `hfPassword`).
4. Verifica que la sesion sea valida buscando las palabras `Bienvenido` o `Portal` en la respuesta.

**Flujo de rastreo:**

1. Verifica que la sesion este activa. Si expiró, intenta reconectar.
2. Envia el numero de guia al formulario de rastreo.
3. Parsea la tabla de resultados (`grdDatos`) y el campo de estado general (`lblEstado`).
4. Si la guia tiene un guion (ej. `12345-1`) y no se encontro, reintenta con la guia maestra (`12345`).
5. Retorna el historial de movimientos y el ultimo estado conocido.

La contrasena se lee desde la variable de entorno `CAEX_PASSWORD`.

---

## Endpoints de la API

### Autenticacion (`/login`)

#### `POST /login`
Verifica usuario y contrasena. No genera tokens; devuelve los datos del usuario directamente. El manejo de sesion queda a cargo del cliente.

**Request:**
```json
{ "usuario": "test", "password": "123" }
```

**Response exitosa:**
```json
{ "mensaje": "Login exitoso", "usuario": "test", "rol": "Gerente", "id": 1 }
```

---

### Inventario

#### `POST /ingresos`
Registra la entrada de costales a bodega. Crea un registro de `Costal` y un `MovimientoInventario` de tipo `Ingreso` por cada unidad, y actualiza el consolidado diario.

**Request:**
```json
{ "cantidad": 10, "fecha": "2025-07-01", "usuario_id": 1 }
```

**Response:**
```json
{ "mensaje": "Se registraron 10 costales.", "nuevo_saldo": 45 }
```

---

#### `POST /ingresos/revertir`
Anula los ultimos N costales ingresados en una fecha especifica (debe estar en estado `En Bodega`). Elimina tanto el costal como sus movimientos asociados. Util para corregir errores de digitacion.

**Request:**
```json
{ "cantidad": 3, "fecha": "2025-07-01" }
```

---

#### `POST /despachos`
Marca N costales como `Enviado`, asignandoles una guia logistica y agencia. Toma los costales disponibles en orden de registro.

**Request:**
```json
{
  "cantidad": 5,
  "guia_logistica": "CE-98765",
  "agencia_ubicacion": "Zona 1 Guatemala",
  "fecha": "2025-07-01",
  "usuario_id": 1
}
```

---

#### `POST /despachos/anular`
Revierte un despacho completo por numero de guia. Devuelve los costales a estado `En Bodega`, limpia la guia y agencia asociadas, y elimina los movimientos de tipo `Despacho`. Distinto a una devolucion: no incrementa `intentos_entrega`.

---

#### `POST /devoluciones`
Registra el retorno fisico de todos los costales asociados a una guia. Los cambia a estado `En Bodega` e incrementa su contador de `intentos_entrega`. Actualiza el consolidado diario.

---

#### `GET /rastreo/{guia}`
Consulta el portal de CAEX para obtener el estado de una guia logistica.

**Response exitosa:**
```json
{
  "guia": "CE-98765",
  "estado_general": "En transito",
  "ultimo_movimiento": {
    "fecha": "2025-07-01",
    "ruta": "Guatemala - Quetzaltenango",
    "movimiento": "Salida de bodega central"
  }
}
```

---

### Reportes

#### `GET /reportes/dashboard-hoy`
Retorna un resumen del dia actual: total de costales en bodega, movimientos del dia (ingresos, despachos, devoluciones) y acumulados del mes en curso.

**Response:**
```json
{
  "fecha": "2025-07-01",
  "total_bodega": 38,
  "hoy": { "ingresados": 10, "enviados": 5, "devoluciones": 2 },
  "mes": { "enviados": 120, "devoluciones": 15 }
}
```

---

#### `GET /reportes/historial?fecha=YYYY-MM-DD`
Lista todos los movimientos registrados en una fecha especifica, con el usuario responsable y la guia asociada.

---

#### `GET /reportes/exportar?mes=7&anio=2025[&dia=1]`
Genera y descarga un archivo CSV con el detalle de todos los movimientos del periodo solicitado. El archivo incluye un bloque de resumen ejecutivo al inicio con los totales de ingresos, despachos y devoluciones, y el dia con mayor volumen de ingresos (cuando se exporta por mes completo).

---

## Variables de entorno

| Variable | Descripcion | Requerida |
|---|---|---|
| `DATABASE_URL` | URL de conexion a PostgreSQL | Si |
| `CAEX_PASSWORD` | Contrasena del portal de Cargo Expreso | Si |

