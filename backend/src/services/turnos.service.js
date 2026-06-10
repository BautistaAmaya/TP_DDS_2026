const { Op } = require('sequelize');
const { Tutor, Turno, HistorialTurno } = require('../models');

// Mapeo de números de día de JavaScript a los nombres usados en la base de datos
const diasSemana = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

const verificarDisponibilidad = async (tutorId, fecha, horaInicio, horaFin, turnoIdIgnorar = null) => {
  const tutor = await Tutor.findByPk(tutorId);

  // Mensajes de error distintos según el caso
  if (!tutor) throw new Error('El tutor seleccionado no existe');
  if (!tutor.activo) throw new Error('El tutor no está activo para recibir turnos');

  // Verificar si el tutor atiende ese día de la semana
  // Forzamos el parseo de la fecha para evitar desfases de zona horaria
  const fechaObj = new Date(`${fecha}T12:00:00Z`);
  const indexDia = fechaObj.getUTCDay();
  // Ajustamos el índice (0 en JS es domingo, nosotros pusimos domingo al final del array)
  const nombreDia = indexDia === 0 ? 'domingo' : diasSemana[indexDia - 1];

  if (!tutor.diasDisponibles.includes(nombreDia)) {
    throw new Error(`El tutor no está disponible el día ${nombreDia}`);
  }

  // Control de superposición horaria ignorando si los límites se tocan exactamente
  const whereCondicion = {
    tutorId,
    fecha,
    estado: { [Op.in]: ['solicitado', 'confirmado'] },
    [Op.and]: [
      { horaInicio: { [Op.lt]: horaFin } }, // Empieza antes de que termine el nuestro
      { horaFin: { [Op.gt]: horaInicio } }  // Termina después de que empiece el nuestro
    ]
  };

  // Si estamos editando o reasignando tutor, ignoramos el propio turno
  if (turnoIdIgnorar) {
    whereCondicion.id = { [Op.ne]: turnoIdIgnorar };
  }

  const turnosSuperpuestos = await Turno.findAll({ where: whereCondicion });

  if (turnosSuperpuestos.length > 0) {
    throw new Error('El tutor ya tiene un turno superpuesto en esa franja horaria');
  }

  return true;
};

const registrarHistorial = async (turnoId, usuarioId, accion, valorAnterior = null, valorNuevo = null) => {
  await HistorialTurno.create({
    turnoId,
    usuarioId,
    accion,
    valorAnterior,
    valorNuevo
  });
};

module.exports = {
  verificarDisponibilidad,
  registrarHistorial
};