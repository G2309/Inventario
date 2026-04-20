Documentación del Backend

El servidor está construido con FastAPI, proporcionando una API REST y documentada automáticamente.

Arquitectura de Software

Se implementó una estructura modular utilizando APIRouter para separar las responsabilidades del sistema:

    auth.py: Gestiona la seguridad, encriptación de contraseñas y validación de sesiones.

    inventario.py: Contiene la lógica de negocio para el registro de ingresos, despachos y anulaciones.

    reportes.py: Realiza cálculos estadísticos, búsquedas de historial y generación de archivos CSV.

Integraciones Externas

El sistema incluye un módulo de rastreo automatizado para Cargo Expreso (caex.py). Este módulo utiliza:

    Requests y BeautifulSoup para la extracción de datos (web scraping) del portal logístico.

    Encriptación AES (CBC) para la comunicación segura de credenciales con el portal externo.

    Lógica de respaldo (fallback) para procesar guías individuales o maestras.

Requisitos y Despliegue

El entorno se ejecuta sobre contenedores Docker, utilizando las siguientes librerías principales:

    SQLAlchemy 
    Bcrypt 
    PyCryptodome 
    Uvicorn 

Además, el repositorio proporciona un *.env.example* que es necesario de llenar para que funcione, y se debe agregar una API Key para hacer funcionar elscrapper de CAEX.
