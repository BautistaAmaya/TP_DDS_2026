const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true // Sequelize maneja los IDs numéricos obligatorios automáticamente [cite: 41]
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false // Obligatorio según el TP [cite: 41]
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true // Debe ser único y es la credencial de acceso [cite: 42]
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false // Contraseña almacenada de forma segura [cite: 42]
  },
  rol: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'estudiante' // Puede ser estudiante, tutor o admin [cite: 42]
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true // Permite bloquear accesos sin borrar el usuario [cite: 42]
  }
}, {
  tableName: 'usuarios',
  timestamps: false // Desactivamos los campos automáticos para apegarnos a los campos mínimos del PDF
});

module.exports = Usuario;