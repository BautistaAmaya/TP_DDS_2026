const jwt = require('jsonwebtoken');

const generarToken = (usuario) => {
  // Solo guardamos el id y el rol en el token, nada de contraseñas 
  const payload = {
    id: usuario.id,
    rol: usuario.rol
  };

  // Firmamos el token con la clave secreta del .env
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '8h' // El token dura 8 horas
  });
};

module.exports = { generarToken };