

# Hexacall - Gestión de Obras, Personal y Reportes

Proyecto para la evaluación que administra obras, personal y reportes diarios con autenticación segura en backend y persistencia en MongoDB.

## Descripción
Hexacall es un portal interno para digitalizar expedientes de obras, trabajadores y reportes diarios. Incluye login, dashboard, CRUD completo de obras, gestión de personal, reportes de obra y sincronización con MongoDB.

## Características principales
- Autenticación con backend y sesión de usuario.
- Seguridad con JWT para proteger las APIs.
- CRUD de obras con estado, ubicación y presupuesto.
- CRUD de personal con asignación a obras.
- CRUD de reportes con fecha, descripción y validación.
- Persistencia en MongoDB Atlas y respaldo local en `localStorage`.
- Sincronización manual de datos entre local y MongoDB.
- Rutas protegidas para evitar accesos no autorizados.

## Estructura del proyecto
- `src/main.tsx`: carga inicial, rutas y sincronización.
- `src/context/AuthContext.tsx`: gestión de sesión y logout.
- `src/services/auth.ts`: login y token JWT.
- `src/services/api.ts`: peticiones API autenticadas.
- `src/componentes/Login.tsx`: formulario de login.
- `src/componentes/Dashboard.tsx`: dashboard principal.
- `src/componentes/ObrasYProyectos.tsx`: CRUD de obras.
- `src/componentes/Personal.tsx`: CRUD de personal.
- `src/componentes/Reportes.tsx`: CRUD de reportes.
- `server.js`: servidor Express con JWT y APIs.
- `server/db.js`: conexión a MongoDB.
- `server/models/usuario.js`: autenticación y seed de administrador.

## Requisitos
- Node.js instalado.
- npm instalado.
- MongoDB Atlas o una instancia de MongoDB accesible.

## Paso a paso para instalar y ejecutar
1. Abre una terminal en la carpeta del proyecto.
2. Crea un archivo `.env` en la raíz con estas variables:

```env
MONGO_URI="mongodb+srv://<usuario>:<contraseña>@<cluster>.mongodb.net"
MONGO_DB="hexacall_db"
VITE_API_BASE="http://localhost:4000/api"
JWT_SECRET="una_clave_muy_segura"
JWT_EXPIRES_IN="1h"
```

3. Instala las dependencias:

```bash
npm install
```

4. Inicia el servidor backend:

```bash
node server.js
```

5. Abre otra terminal y ejecuta el frontend:

```bash
npm run dev
```

6. Abre la aplicación en tu navegador:

```text
http://localhost:3001
```

## Nota sobre MongoDB
- No necesitas crear manualmente las colecciones.
- El backend creará automáticamente las colecciones `obras`, `empleados`, `reportes` y `usuarios`.
- Solo necesitas que la URI de MongoDB sea correcta y que la base de datos esté accesible.




## Credenciales de prueba
- Correo: `admin@admin.com`
- Contraseña: `123456`

## Seguridad implementada
- El backend genera un JWT al iniciar sesión.
- Los endpoints `/api/obras`, `/api/personal`, `/api/reportes` y `/api/migrate` están protegidos con middleware de autenticación.
- El frontend envía el header `Authorization: Bearer <token>` en todas las solicitudes.
- El token se guarda en `localStorage` y se elimina al cerrar sesión.

## Validación server-side
Se agregaron validaciones en el servidor para:
- Obras: nombre, estado válido, ubicación y presupuesto.
- Personal: id, nombre, cargo y obra asignada.
- Reportes: id, obra, fecha válida no futura y descripción entre 10 y 500 caracteres.
- Endpoints `PUT` masivos: validación de cada elemento del arreglo.

## Cómo probar
1. Inicia sesión con las credenciales de prueba.
2. Navega a «Obras» para crear, editar y eliminar proyectos.
3. Navega a «Empleados» para agregar personal y asignarlos a obras.
4. Navega a «Reportes» para registrar avances diarios.
5. Verifica que los datos se guarden en MongoDB.
6. Confirma que el backend responde 401 si el token es inválido.


