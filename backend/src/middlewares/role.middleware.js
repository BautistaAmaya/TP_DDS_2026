const autorizarRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    // Verificamos que el middleware de JWT haya inyectado el usuario
    if (!req.usuario) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    // Comparamos el rol del token con los roles permitidos en la ruta
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'Acceso denegado. Permisos insuficientes para esta acción.' });
    }

    next();
  };
};

module.exports = { autorizarRoles };