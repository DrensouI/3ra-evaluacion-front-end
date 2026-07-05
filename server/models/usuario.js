const ADMINISTRADORES = [
  {
    correo: 'admin@admin.com',
    clave: '123456',
    nombre: 'Administrador Hexacall',
    rol: 'administrador',
  },
];

export async function autenticarAdministrador(correo, clave) {
  const emailNormalizado = (correo || '').trim().toLowerCase();
  const usuario = ADMINISTRADORES.find(
    u => u.correo.toLowerCase() === emailNormalizado && u.clave === clave,
  );

  if (!usuario) {
    return null;
  }

  return {
    correo: usuario.correo,
    nombre: usuario.nombre,
    rol: usuario.rol,
  };
}
