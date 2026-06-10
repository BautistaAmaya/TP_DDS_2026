const express = require('express');
const router = express.Router();
const { crearTurno, listarTurnos, obtenerTurno, editarTurno, cancelarTurno, confirmarTurno, realizarTurno, obtenerHistorial, obtenerResumen } = require('../controllers/turnos.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
const { autorizarRoles } = require('../middlewares/role.middleware');

// Todas las rutas de turnos requieren estar autenticado [cite: 93, 113]
router.use(verificarToken);

// GET /api/turnos/resumen (Debe ir antes de /:id) -> Solo Admin [cite: 102, 180]
router.get('/resumen', autorizarRoles('admin'), obtenerResumen);

// GET /api/turnos -> Todos pueden ver [cite: 101]
router.get('/', listarTurnos);

// POST /api/turnos -> Solo Estudiantes (y admins) pueden crear [cite: 89, 91, 105]
router.post('/', autorizarRoles('estudiante', 'admin'), crearTurno);

// GET /api/turnos/:id -> Todos pueden ver [cite: 103]
router.get('/:id', obtenerTurno);

// PUT /api/turnos/:id -> Editar
router.put('/:id', autorizarRoles('estudiante', 'admin'), editarTurno); 

// PATCH estados [cite: 107, 108, 109]
router.patch('/:id/cancelar', autorizarRoles('estudiante', 'admin'), cancelarTurno); 
router.patch('/:id/confirmar', autorizarRoles('tutor', 'admin'), confirmarTurno); 
router.patch('/:id/realizar', autorizarRoles('tutor', 'admin'), realizarTurno); 

// GET /api/turnos/:id/historial [cite: 104]
router.get('/:id/historial', obtenerHistorial);

module.exports = router;