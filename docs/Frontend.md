# Documentación del Frontend

La interfaz de usuario del sistema Kardex está desarrollada bajo el ecosistema de **Next.js** utilizando su arquitectura de **App Router**. El enfoque principal es proporcionar una aplicación de una sola página (SPA) rápida, responsiva y con una estética minimalista.

## Arquitectura y Estructura de Carpetas

El proyecto sigue la convención estándar de Next.js. Toda la lógica visual y de componentes reside dentro de la carpeta `src/app`.

* **`src/app/layout.tsx`**: Contiene la configuración global, las fuentes y los estilos base.
* **`src/app/login/page.tsx`**: Controla el acceso inicial y la validación de credenciales.
* **`src/app/dashboard/`**: Es el núcleo del sistema. Aquí se encuentra el `layout.tsx` que define la barra de navegación superior (Header) y el contenedor principal.
    * Cada subcarpeta dentro de `dashboard` representa un módulo (ej. `ingresos`, `despachos`, `reportes`).

## Sistema de Estilos con Tailwind CSS

Para el diseño se utiliza **Tailwind CSS**.

### Paleta de Colores Corporativa
Se han definido colores personalizados en el archivo `tailwind.config.js` para mantener la consistencia:
* `bio-green`: Verde principal para botones de éxito y estados positivos.
* `bio-green-dark`: Para textos secundarios y contrastes.
* `bio-dark`: Gris oscuro/negro para el encabezado y textos principales.
* `bio-light`: Fondo gris muy claro para reducir la fatiga visual.

## Guía para Agregar Nuevos Módulos

Si se requiere expandir las funcionalidades del sistema (por ejemplo, un módulo de "Inventario Físico"), se deben seguir estos pasos técnicos:

1.  **Crear la Carpeta**: Crear una nueva carpeta en `src/app/dashboard/nombre-modulo/`.
2.  **Archivo Principal**: Dentro de esa carpeta, crear un archivo `page.tsx`. Este archivo debe ser un **Client Component** (iniciando con `"use client";`) si requiere interacción con el usuario o llamados a la API.
3.  **Vincular en el Dashboard**: Agregar una nueva tarjeta (`Link`) en `src/app/dashboard/page.tsx` para permitir el acceso desde el Panel de Control.
4.  **Integración con el Layout**: El nuevo módulo heredará automáticamente la barra superior y la flecha de retorno configurada en el `layout.tsx` del dashboard.

## Lógica y Estado Global

El frontend interactúa con la API de FastAPI mediante el método nativo `fetch`. 

* **Consumo de API**: Se utiliza la dirección. Los llamados deben incluir siempre los encabezados `Content-Type: application/json`.
* **Persistencia**: Se utiliza `localStorage` para almacenar:
    * `usuario_id`: Necesario para el registro de auditoría en cada movimiento.
    * `umbral_inventario`: Preferencia visual para la alerta de stock bajo en reportes.
* **Navegación Dinámica**: El componente `usePathname` en el layout principal detecta la ruta actual para mostrar u ocultar la flecha de regreso al dashboard, mejorando el flujo de navegación sin recargar la página.

