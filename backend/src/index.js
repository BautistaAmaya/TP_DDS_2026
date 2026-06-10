require('dotenv').config();
const app = require('./app');
const sequelize = require('./config/database');
require('./models'); // Esto ejecuta el index.js de la carpeta models


const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Autenticamos la conexión a la base de datos
    await sequelize.authenticate();
    console.log('Conexión a SQLite establecida correctamente.');

    // Sincronizamos los modelos (esto crea las tablas si no existen)
    // Nota: en producción se suelen usar migraciones, pero para el TP con .sync() alcanza.
    await sequelize.sync({ force: false }); 
    console.log('Modelos sincronizados con la base de datos.');

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
  }
}

startServer();