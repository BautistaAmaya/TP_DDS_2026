const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Turno = sequelize.define('Turno', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  horaInicio: {
    type: DataTypes.STRING,
    allowNull: false
  },
  horaFin: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tema: {
    type: DataTypes.STRING,
    allowNull: false
  },
  modalidad: {
    type: DataTypes.STRING,
    allowNull: false
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'solicitado'
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'turnos',
  timestamps: false
});

module.exports = Turno;