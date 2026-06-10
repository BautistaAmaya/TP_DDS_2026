const { Turno, Tutor, HistorialTurno } = require('../models');
const turnosService = require('../services/turnos.service');

const crearTurno = async (req, res, next) => {
  try {
    const { tutorId, fecha, horaInicio, horaFin, tema, modalidad, observaciones } = req.body;

    // El estudiante que solicita es el usuario autenticado
    const estudianteId = req.usuario.id;

    // 1. Regla de negocio: Rechazar si horaInicio no es menor que horaFin 
    if (horaInicio >= horaFin) {
      return res.status(400).json({ error: 'La hora de inicio debe ser menor a la hora de fin' });
    }

    // 2. Verificar disponibilidad y superposición en el servicio [cite: 86]
    try {
      await turnosService.verificarDisponibilidad(tutorId, fecha, horaInicio, horaFin);
    } catch (error) {
      // Los errores de validación deben responder con status coherente, normalmente 400 [cite: 186]
      return res.status(400).json({ error: error.message });
    }

    // 3. Crear el turno
    const nuevoTurno = await Turno.create({
      tutorId,
      estudianteId,
      fecha,
      horaInicio,
      horaFin,
      tema,
      modalidad,
      estado: 'solicitado', // Estado inicial por defecto [cite: 64]
      observaciones
    });

    // 4. Guardar en el historial la creación [cite: 70]
    await turnosService.registrarHistorial(
      nuevoTurno.id,
      estudianteId,
      'creacion',
      null,
      { estado: 'solicitado', fecha, horaInicio, horaFin }
    );

    res.status(201).json({ mensaje: 'Turno creado exitosamente', turno: nuevoTurno });
  } catch (error) {
    next(error);
  }
};

const listarTurnos = async (req, res, next) => {
  try {
    // Recibir parámetros para filtros combinables, búsqueda paginada y ordenamiento [cite: 54, 67, 101]
    const { fecha, estado, tutorId, especialidad, page = 1, limit = 10, sortBy = 'fecha', order = 'ASC' } = req.query;

    const offset = (page - 1) * limit;

    // Armar las condiciones de búsqueda dinámicamente 
    const whereTurno = {};
    if (fecha) whereTurno.fecha = fecha;
    if (estado) whereTurno.estado = estado;
    if (tutorId) whereTurno.tutorId = tutorId;

    const whereTutor = {};
    if (especialidad) whereTutor.especialidad = especialidad;

    // Consultar a la base de datos
    const { count, rows } = await Turno.findAndCountAll({
      where: whereTurno,
      include: [
        {
          model: Tutor,
          as: 'tutor',
          where: Object.keys(whereTutor).length > 0 ? whereTutor : undefined, // Solo incluir where si hay filtro de especialidad
          attributes: ['nombre', 'especialidad']
        }
      ],
      order: [[sortBy, order.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json({
      total: count,
      paginas: Math.ceil(count / limit),
      paginaActual: parseInt(page),
      turnos: rows
    });
  } catch (error) {
    next(error);
  }
};

// ... (acá va lo que ya tenías: crearTurno y listarTurnos)

const obtenerTurno = async (req, res, next) => {
  try {
    const turno = await Turno.findByPk(req.params.id, {
      include: [
        { model: Tutor, as: 'tutor' },
        { model: require('../models/Usuario'), as: 'estudiante', attributes: ['nombre', 'email'] }
      ]
    });
    if (!turno) return res.status(404).json({ error: 'Turno no encontrado' });
    res.status(200).json(turno);
  } catch (error) { next(error); }
};
const editarTurno = async (req, res, next) => {
  try {
    const { tutorId, fecha, horaInicio, horaFin, tema, modalidad, observaciones } = req.body;
    const turno = await Turno.findByPk(req.params.id);
    if (!turno) return res.status(404).json({ error: 'Turno no encontrado' });

    // No permitir modificar turnos realizados salvo observaciones
    if (turno.estado === 'realizado') {
      await turno.update({ observaciones });
      return res.status(200).json({ mensaje: 'Observaciones actualizadas', turno });
    }

    if (horaInicio >= horaFin) return res.status(400).json({ error: 'Hora de inicio debe ser menor a fin' });

    // Validar disponibilidad ignorando este turno, atrapando el error con status 400
    try {
      await turnosService.verificarDisponibilidad(tutorId, fecha, horaInicio, horaFin, turno.id);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }

    const valorAnterior = turno.toJSON();
    await turno.update({ tutorId, fecha, horaInicio, horaFin, tema, modalidad, observaciones });

    await turnosService.registrarHistorial(turno.id, req.usuario.id, 'edicion', valorAnterior, turno.toJSON());
    res.status(200).json({ mensaje: 'Turno actualizado', turno });
  } catch (error) {
    next(error);
  }
};

const cambiarEstado = (nuevoEstado) => async (req, res, next) => {
  try {
    const turno = await Turno.findByPk(req.params.id);
    if (!turno) return res.status(404).json({ error: 'Turno no encontrado' });

    const valorAnterior = turno.toJSON();
    await turno.update({ estado: nuevoEstado });
    await turnosService.registrarHistorial(turno.id, req.usuario.id, nuevoEstado, valorAnterior, turno.toJSON());

    res.status(200).json({ mensaje: `Turno marcado como ${nuevoEstado}`, turno });
  } catch (error) { next(error); }
};

const cancelarTurno = cambiarEstado('cancelado');
const confirmarTurno = cambiarEstado('confirmado');
const realizarTurno = cambiarEstado('realizado');

const obtenerHistorial = async (req, res, next) => {
  try {
    const historial = await HistorialTurno.findAll({ where: { turnoId: req.params.id }, order: [['fechaHora', 'DESC']] });
    res.status(200).json(historial);
  } catch (error) { next(error); }
};

const obtenerResumen = async (req, res, next) => {
  try {
    // Resumen administrativo básico [cite: 85]
    const turnosDelDia = await Turno.count({ where: { fecha: new Date().toISOString().split('T')[0] } });
    const pendientes = await Turno.count({ where: { estado: 'solicitado' } });
    res.status(200).json({ turnosDelDia, turnosPendientesConfirmacion: pendientes });
  } catch (error) { next(error); }
};

module.exports = {
  crearTurno, listarTurnos, obtenerTurno, editarTurno,
  cancelarTurno, confirmarTurno, realizarTurno, obtenerHistorial, obtenerResumen
};