const express = require('express');
const cors = require('cors');
const turnosRoutes = require('./routes/turnos.routes');
const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json()); // Para poder parsear el body de los POST/PUT a JSON

const authRoutes = require('./routes/auth.routes');
const tutoresRoutes = require('./routes/tutores.routes');


// Rutas base
app.use('/api/auth', authRoutes);

app.use('/api/turnos', turnosRoutes);

app.use('/api/tutores', tutoresRoutes);

// Ruta base para comprobar que la API funciona
app.get('/', (req, res) => {
  res.json({ 
    mensaje: '¡Bienvenido a la API de Gestión de Tutorías!',
    estado: 'Online'
  });
});


// Middleware de manejo de errores centralizado (obligatorio que vaya al final)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor' });
});

module.exports = app;