Documentación de la Base de Datos

El sistema utiliza PostgreSQL como motor de base de datos relacional, gestionado a través de SQLAlchemy como ORM. La arquitectura está diseñada para garantizar la trazabilidad individual (qué acciones realizó cada usuario, guardando los logs en una bitácora) de cada unidad de inventario.

Modelo de Datos
Tabla: usuarios

Almacena la información de las personas que acceden al sistema.

    id (Integer, PK): Identificador único.

    nombre (String): Nombre de usuario para el acceso.

    password_hash (String): Contraseña encriptada mediante Bcrypt.

    rol (String): Define los permisos (Gerente o Encargado de Bodega).

Tabla: costales

Representa la unidad mínima de inventario.

    id (Integer, PK): Identificador único (corresponde al ID interno).

    fecha_descarga (Date): Fecha de ingreso físico a la bodega.

    estado (String): Estado actual (En Bodega, Enviado).

    guia_logistica (String, Nullable): Número de guía de Cargo Expreso.

    agencia_ubicacion (String, Nullable): Municipio o agencia de destino.

    intentos_entrega (Integer): Contador de veces que el costal ha regresado como devolución.

Tabla: movimientos_inventario

Registro de auditoría para cada acción realizada.

    id (Integer, PK): Identificador único.

    costal_id (Integer, FK): Referencia al costal afectado.

    usuario_id (Integer, FK): Referencia al usuario que realizó la acción.

    tipo_movimiento (String): Categoría de la acción (Ingreso, Despacho, Devolución).

    fecha_movimiento (DateTime): Marca de tiempo automática.

Tabla: registro_diario_consolidado

Tabla de resumen para optimizar la generación de reportes.

    id (Integer, PK): Identificador único.

    fecha (Date, Unique): Día del registro.

    ingresados_descarga (Integer): Total de ingresos en el día.

    enviados (Integer): Total de salidas en el día.

    devoluciones (Integer): Total de retornos en el día.

    costales_disponibles (Integer): Balance neto del día.
