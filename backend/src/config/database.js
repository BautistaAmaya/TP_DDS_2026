const { Sequelize } = require('sequelize');

// Configuramos Sequelize para que use SQLite y guarde los datos en un archivo local
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './tutorias.sqlite', // El archivo se creará en la raíz del proyecto
  logging: false // Cambiar a console.log para ver las consultas SQL si hay errores
});

module.exports = sequelize;