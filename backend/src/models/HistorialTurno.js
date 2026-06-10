const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HistorialTurno = sequelize.define('HistorialTurno', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  accion: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fechaHora: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  valorAnterior: {
    type: DataTypes.JSON,
    allowNull: true
  },
  valorNuevo: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'historial_turnos',
  timestamps: false
});

module.exports = HistorialTurno;