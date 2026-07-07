# Instrucciones de ejecución

Este proyecto usa React/Vite en el frontend y Express + Firebase Admin en el backend. Los datos se guardan en Firestore.

## Requisitos mínimos

- Node.js instalado.
- npm disponible.
- Cuenta de Firebase con Firestore habilitado.
- Service account de Firebase para el backend.

## Configuración del proyecto

1. Crea un archivo `.env` en la raíz del proyecto.
2. Pega estas variables con tus datos reales de Firebase:

```env
FIREBASE_PROJECT_ID=tu_project_id
FIREBASE_CLIENT_EMAIL=tu_service_account@tu_project_id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
VITE_API_BASE=http://localhost:4000/api
JWT_SECRET=una_clave_muy_segura
JWT_EXPIRES_IN=1h
```

### Origen de cada valor

- `FIREBASE_PROJECT_ID`: lo obtienes desde Firebase Console, en el panel principal del proyecto.
- `FIREBASE_CLIENT_EMAIL`: en Firebase Console > Configuración del proyecto > Cuentas de servicio > Generar nueva clave privada. Abre el JSON descargado y copia `client_email`.
- `FIREBASE_PRIVATE_KEY`: en el mismo JSON del service account, copia el valor `private_key`. En el `.env` reemplaza los saltos de línea reales por `\n`.
- `VITE_API_BASE`: debe ser `http://localhost:4000/api`.
- `JWT_SECRET`: puede ser cualquier cadena secreta.
- `JWT_EXPIRES_IN`: por ejemplo `1h`.

> No subas el archivo `.env` al repositorio.

## Instalación y ejecución en CMD

Desde la carpeta del proyecto en CMD ejecuta:

```cmd
npm install
```

Luego inicia el backend:

```cmd
npm run server
```

En otra ventana de CMD inicia el frontend:

```cmd
npm run dev
```

Abre el navegador en:

```text
http://localhost:3001
```

## Flujo mínimo

1. Poner en `.env` los datos reales de Firebase.
2. Ejecutar `npm install`.
3. Ejecutar `npm run server`.
4. Ejecutar `npm run dev`.
5. Abrir `http://localhost:3001`.

## Verificación

- El backend debe mostrar `API server running on http://localhost:4000`.
- El frontend debe abrir en `http://localhost:3001`.
- Inicia sesión y verifica que los datos se guardan en Firestore.

## Credenciales de prueba

- Correo: `admin@admin.com`
- Contraseña: `123456`

## Nota

El equipo de la universidad solo necesita CMD y Node.js. No es necesario instalar Java. Si ya tienes Node.js y npm, solo corre `npm install`, `npm run server` y `npm run dev`.
