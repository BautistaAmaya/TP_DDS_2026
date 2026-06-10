const Usuario = require('./Usuario');
const Tutor = require('./Tutor');
const Turno = require('./Turno');
const HistorialTurno = require('./HistorialTurno');

// Relación Usuario - Tutor (1 a 1)
Usuario.hasOne(Tutor, { foreignKey: 'usuarioId', as: 'perfilTutor' });
Tutor.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

// Relación Tutor - Turnos (1 a Muchos)
Tutor.hasMany(Turno, { foreignKey: 'tutorId', as: 'turnos' });
Turno.belongsTo(Tutor, { foreignKey: 'tutorId', as: 'tutor' });

// Relación Usuario (Estudiante) - Turnos solicitados (1 a Muchos)
Usuario.hasMany(Turno, { foreignKey: 'estudianteId', as: 'turnosSolicitados' });
Turno.belongsTo(Usuario, { foreignKey: 'estudianteId', as: 'estudiante' });

// Relación Turno - HistorialTurnos (1 a Muchos)
Turno.hasMany(HistorialTurno, { foreignKey: 'turnoId', as: 'historial' });
HistorialTurno.belongsTo(Turno, { foreignKey: 'turnoId', as: 'turno' });

// Relación HistorialTurno - Usuario (quién hizo la acción) (1 a Muchos)
Usuario.hasMany(HistorialTurno, { foreignKey: 'usuarioId', as: 'accionesHistorial' });
HistorialTurno.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

// Exportamos todos los modelos listos y relacionados
module.exports = {
  Usuario,
  Tutor,
  Turno,
  HistorialTurno
};