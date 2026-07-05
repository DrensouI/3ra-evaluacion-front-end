Autenticación de administrador

Qué se agregó:
- Modelo de usuarios en `server/models/usuario.js`.
- Endpoint de login en `server.js`: `POST /api/auth/login`.
- Servicio cliente `src/services/auth.ts` para llamar al endpoint.
- Contexto `src/context/AuthContext.tsx` actualizado para usar el login por API.
- `Login.tsx` adaptado para usar `await login(...)` y navegar al dashboard.

Por qué se hizo:
- El profesor pidió autenticación separada del CRUD.
- Se mantiene la sesión del admin en `localStorage` para que la app recuerde quién inició sesión.
- Se hace con un endpoint de backend para que no quede sólo en el frontend.

Cómo funciona:
1. El usuario ingresa correo y contraseña en la vista de login.
2. `Login.tsx` llama a `login(correo, clave)` del contexto.
3. `AuthContext` usa `loginAdmin(...)` en `src/services/auth.ts`.
4. `loginAdmin` hace `POST /api/auth/login`.
5. El backend valida con `autenticarAdministrador` y devuelve los datos del administrador.
6. El contexto guarda la sesión en `localStorage` y marca al usuario como autenticado.

Notas:
- La sesión guarda `correo`, `nombre`, `rol` y `ultimoAcceso`.
- En este commit no se modifican los CRUD de obras/personal/reportes.
- Esta implementación sigue la rúbrica: modelo, endpoint, persistencia de sesión y explicación clara.
