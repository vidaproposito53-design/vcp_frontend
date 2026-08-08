# Frontend - Classical Events

Aplicación SPA (Single Page Application) construida con Angular 18 para registrar asistentes a eventos musicales clásicos.

## Tecnologías

- Angular 18.2.0 (standalone components)
- TypeScript 5.5.4
- RxJS 7.8.1
- Nginx 1.27 (servidor estático en producción)

## Estructura

```
frontend/
├── Dockerfile
├── nginx.conf
├── package.json
├── angular.json
├── tsconfig.json
├── tsconfig.app.json
└── src/
    ├── main.ts          # Componente standalone completo
    ├── index.html       # Shell HTML
    └── styles.css       # Estilos globales
```

## Funcionalidad

La aplicación presenta un formulario de registro con los campos:

- **Nombre** - Nombre del asistente
- **Apellido** - Apellido del asistente
- **Número de documento** - Documento de identidad

Al enviar, realiza un `POST` a la API del backend y muestra el resultado del registro incluyendo el estado del pago.

## Ejecutar

### Con Docker (recomendado)

```bash
# Desde la raíz del proyecto
docker compose up --build frontend
```

### Localmente (sin Docker)

Requiere Node.js 20+ instalado.

```bash
cd frontend
npm install
ng serve  or npx ng serve

```

La aplicación estará disponible en `http://localhost:4200`.

## Build

```bash
# Build de producción
ng build --configuration production

# El resultado se genera en dist/classical-events-frontend/browser/
```

## Dockerfile (Multi-stage)

1. **Fase build**: Node.js 20 compila Angular con `ng build --configuration production`
2. **Fase runtime**: Nginx 1.27 sirve los archivos estáticos

## nginx.conf

Configuración SPA: todas las rutas caen en `index.html` para que Angular maneje el routing del lado del cliente.

## Puerto

- **4200** (mapeado a Nginx en puerto 80 internamente)

## Dependencia

Depende del servicio `backend` (puerto 8080) para comunicarse con la API.
