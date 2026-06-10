const bcrypt = require('bcrypt');
const { Usuario } = require('../models');
const { generarToken } = require('../utils/jwt');

const register = async (req, res, next) => {
  try {
    const { nombre, email, password, rol } = req.body;

    // Hashear la contraseña antes de guardarla 
    const passwordHash = await bcrypt.hash(password, 10);

    const nuevoUsuario = await Usuario.create({
      nombre,
      email,
      passwordHash,
      rol: rol || 'estudiante', // Por defecto es estudiante
      activo: true
    });

    res.status(201).json({ mensaje: 'Usuario registrado exitosamente', usuarioId: nuevoUsuario.id });
  } catch (error) {
    next(error); // Pasamos el error al middleware centralizado
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Buscar al usuario
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar que esté activo
    if (!usuario.activo) {
      return res.status(403).json({ error: 'El usuario está inactivo' });
    }

    // Comparar contraseñas
    const passwordValida = await bcrypt.compare(password, usuario.passwordHash);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar JWT al iniciar sesión correctamente 
    const token = generarToken(usuario);

    res.status(200).json({ 
      mensaje: 'Login exitoso', 
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login };