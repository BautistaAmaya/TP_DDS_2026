const bcrypt = require('bcrypt');
const sequelize = require('../config/database');
const { Usuario, Tutor, Turno } = require('../models');

async function seedDatabase() {
  try {
    await sequelize.sync({ force: true });
    console.log('Tablas recreadas limpias.');

    const passwordHash = await bcrypt.hash('123456', 10);

    // 1. Crear 1 Admin
    await Usuario.create({ nombre: 'Admin Master', email: 'admin@dds.com', passwordHash, rol: 'admin', activo: true });

    // 2. Crear 3 Estudiantes
    const est1 = await Usuario.create({ nombre: 'Valen Acosta', email: 'valen@dds.com', passwordHash, rol: 'estudiante', activo: true });
    const est2 = await Usuario.create({ nombre: 'Lujan Perez', email: 'lujan@dds.com', passwordHash, rol: 'estudiante', activo: true });
    const est3 = await Usuario.create({ nombre: 'Mateo Gomez', email: 'mateo@dds.com', passwordHash, rol: 'estudiante', activo: true });

    // 3. Crear 5 Tutores (Usuarios y sus Perfiles)
    const usuariosTutores = await Usuario.bulkCreate([
      { nombre: 'Marina López', email: 'marina@dds.com', passwordHash, rol: 'tutor', activo: true },
      { nombre: 'Carlos Ruiz', email: 'carlos@dds.com', passwordHash, rol: 'tutor', activo: true },
      { nombre: 'Ana Torres', email: 'ana@dds.com', passwordHash, rol: 'tutor', activo: true },
      { nombre: 'Luis Silva', email: 'luis@dds.com', passwordHash, rol: 'tutor', activo: true },
      { nombre: 'Sofia Vega', email: 'sofia@dds.com', passwordHash, rol: 'tutor', activo: true }
    ]);

    const tutores = await Tutor.bulkCreate([
      { usuarioId: usuariosTutores[0].id, nombre: 'Marina López', email: 'marina@dds.com', especialidad: 'backend', diasDisponibles: ['lunes', 'miércoles'], activo: true },
      { usuarioId: usuariosTutores[1].id, nombre: 'Carlos Ruiz', email: 'carlos@dds.com', especialidad: 'frontend', diasDisponibles: ['martes', 'jueves'], activo: true },
      { usuarioId: usuariosTutores[2].id, nombre: 'Ana Torres', email: 'ana@dds.com', especialidad: 'testing', diasDisponibles: ['viernes'], activo: true },
      { usuarioId: usuariosTutores[3].id, nombre: 'Luis Silva', email: 'luis@dds.com', especialidad: 'seguridad', diasDisponibles: ['lunes', 'jueves'], activo: true },
      { usuarioId: usuariosTutores[4].id, nombre: 'Sofia Vega', email: 'sofia@dds.com', especialidad: 'backend', diasDisponibles: ['miércoles', 'viernes'], activo: true }
    ]);

    // 4. Crear 12 Turnos en distintos estados
    const turnosData = [
      { tutorId: tutores[0].id, estudianteId: est1.id, fecha: '2026-06-15', horaInicio: '10:00', horaFin: '11:00', tema: 'Dudas con Express', modalidad: 'virtual', estado: 'solicitado' },
      { tutorId: tutores[0].id, estudianteId: est2.id, fecha: '2026-06-17', horaInicio: '11:00', horaFin: '12:00', tema: 'Middlewares', modalidad: 'virtual', estado: 'confirmado' },
      { tutorId: tutores[1].id, estudianteId: est3.id, fecha: '2026-06-16', horaInicio: '14:00', horaFin: '15:00', tema: 'React Hooks', modalidad: 'presencial', estado: 'realizado' },
      { tutorId: tutores[1].id, estudianteId: est1.id, fecha: '2026-06-18', horaInicio: '15:00', horaFin: '16:00', tema: 'React Router', modalidad: 'virtual', estado: 'cancelado' },
      { tutorId: tutores[2].id, estudianteId: est2.id, fecha: '2026-06-19', horaInicio: '09:00', horaFin: '10:00', tema: 'Jest', modalidad: 'presencial', estado: 'solicitado' },
      { tutorId: tutores[2].id, estudianteId: est3.id, fecha: '2026-06-26', horaInicio: '10:00', horaFin: '11:00', tema: 'Supertest', modalidad: 'virtual', estado: 'confirmado' },
      { tutorId: tutores[3].id, estudianteId: est1.id, fecha: '2026-06-15', horaInicio: '16:00', horaFin: '17:00', tema: 'JWT', modalidad: 'virtual', estado: 'solicitado' },
      { tutorId: tutores[3].id, estudianteId: est2.id, fecha: '2026-06-22', horaInicio: '17:00', horaFin: '18:00', tema: 'Bcrypt', modalidad: 'presencial', estado: 'realizado' },
      { tutorId: tutores[4].id, estudianteId: est3.id, fecha: '2026-06-17', horaInicio: '18:00', horaFin: '19:00', tema: 'Modelos Sequelize', modalidad: 'virtual', estado: 'cancelado' },
      { tutorId: tutores[4].id, estudianteId: est1.id, fecha: '2026-06-24', horaInicio: '19:00', horaFin: '20:00', tema: 'Relaciones', modalidad: 'virtual', estado: 'confirmado' },
      { tutorId: tutores[0].id, estudianteId: est3.id, fecha: '2026-06-22', horaInicio: '12:00', horaFin: '13:00', tema: 'Manejo de errores', modalidad: 'presencial', estado: 'solicitado' },
      { tutorId: tutores[1].id, estudianteId: est2.id, fecha: '2026-06-23', horaInicio: '13:00', horaFin: '14:00', tema: 'Vite', modalidad: 'virtual', estado: 'confirmado' }
    ];

    await Turno.bulkCreate(turnosData);

    console.log('¡Datos semilla cargados exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('Error cargando los datos semilla:', error);
    process.exit(1);
  }
}

seedDatabase();