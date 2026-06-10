require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');
const sequelize = require('../src/config/database');
const bcrypt = require('bcrypt');
const { Usuario, Tutor, Turno } = require('../src/models');

let tokenEstudiante, tokenAdmin, tokenTutor;
let tutorId, turnoId, estudianteId;

// Antes de todos los tests, limpiamos la BD y cargamos datos básicos
beforeAll(async () => {
  await sequelize.sync({ force: true });
  const passwordHash = await bcrypt.hash('123456', 10);

  // Crear Usuarios
  const admin = await Usuario.create({ nombre: 'Admin', email: 'admin@test.com', passwordHash, rol: 'admin', activo: true });
  const estudiante = await Usuario.create({ nombre: 'Est', email: 'est@test.com', passwordHash, rol: 'estudiante', activo: true });
  const tutorUser = await Usuario.create({ nombre: 'Tut', email: 'tut@test.com', passwordHash, rol: 'tutor', activo: true });
  estudianteId = estudiante.id;

  // Crear Tutor (Disponible martes y miércoles)
  const tutor = await Tutor.create({ 
    usuarioId: tutorUser.id, nombre: 'Tut', email: 'tut@test.com', 
    especialidad: 'backend', diasDisponibles: ['martes', 'miércoles'], activo: true 
  });
  tutorId = tutor.id;

  // Crear un turno base para pruebas (16 de junio de 2026 es martes)
  const turno = await Turno.create({ 
    tutorId, estudianteId, fecha: '2026-06-16', 
    horaInicio: '10:00', horaFin: '11:00', tema: 'Test Base', modalidad: 'virtual', estado: 'confirmado' 
  });
  turnoId = turno.id;

  // Loguear usuarios para obtener JWTs
  let res = await request(app).post('/api/auth/login').send({ email: 'est@test.com', password: '123456' });
  tokenEstudiante = res.body.token;

  res = await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: '123456' });
  tokenAdmin = res.body.token;

  res = await request(app).post('/api/auth/login').send({ email: 'tut@test.com', password: '123456' });
  tokenTutor = res.body.token;
});

// Al finalizar, cerramos la conexión a la base de datos
afterAll(async () => {
  await sequelize.close();
});

describe('Pruebas automatizadas de la API de Tutorías', () => {

  // 1. Login correcto e inválido [cite: 152]
  it('1. Debe loguear correctamente y fallar con credenciales inválidas', async () => {
    const resOk = await request(app).post('/api/auth/login').send({ email: 'est@test.com', password: '123456' });
    expect(resOk.statusCode).toBe(200);
    expect(resOk.body).toHaveProperty('token');

    const resFail = await request(app).post('/api/auth/login').send({ email: 'est@test.com', password: 'clave_incorrecta' });
    expect(resFail.statusCode).toBe(401);
    expect(resFail.body.error).toBeDefined();
  });

  // 2. Listado de turnos con y sin filtros [cite: 153]
  it('2. Debe listar turnos con y sin filtros', async () => {
    const resAll = await request(app).get('/api/turnos').set('Authorization', `Bearer ${tokenEstudiante}`);
    expect(resAll.statusCode).toBe(200);
    expect(Array.isArray(resAll.body.turnos)).toBe(true);

    const resFilter = await request(app).get('/api/turnos?estado=confirmado').set('Authorization', `Bearer ${tokenEstudiante}`);
    expect(resFilter.statusCode).toBe(200);
    expect(resFilter.body.turnos[0].estado).toBe('confirmado');
  });

  // 3. Detalle de turno existente e inexistente [cite: 154]
  it('3. Debe obtener un turno existente y devolver 404 para uno inexistente', async () => {
    const resExist = await request(app).get(`/api/turnos/${turnoId}`).set('Authorization', `Bearer ${tokenEstudiante}`);
    expect(resExist.statusCode).toBe(200);
    expect(resExist.body.id).toBe(turnoId);

    const resNoExist = await request(app).get('/api/turnos/9999').set('Authorization', `Bearer ${tokenEstudiante}`);
    expect(resNoExist.statusCode).toBe(404);
  });

  // 4. Creación válida de un turno [cite: 155]
  it('4. Debe crear un turno válido', async () => {
    const res = await request(app).post('/api/turnos').set('Authorization', `Bearer ${tokenEstudiante}`).send({
      tutorId, fecha: '2026-06-16', horaInicio: '15:00', horaFin: '16:00', tema: 'Duda Nueva', modalidad: 'virtual'
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.mensaje).toBe('Turno creado exitosamente');
  });

  // 5. Creación inválida por horario inconsistente [cite: 156]
  it('5. Debe fallar si la hora de inicio es mayor a la de fin', async () => {
    const res = await request(app).post('/api/turnos').set('Authorization', `Bearer ${tokenEstudiante}`).send({
      tutorId, fecha: '2026-06-16', horaInicio: '16:00', horaFin: '15:00', tema: 'Horario Raro', modalidad: 'virtual'
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  // 6. Creación inválida por superposición del tutor [cite: 157]
  it('6. Debe fallar por superposición horaria del tutor', async () => {
    // Intentamos pisar el turno de las 10:00 a 11:00
    const res = await request(app).post('/api/turnos').set('Authorization', `Bearer ${tokenEstudiante}`).send({
      tutorId, fecha: '2026-06-16', horaInicio: '10:30', horaFin: '11:30', tema: 'Piso turno', modalidad: 'virtual'
    });
    expect(res.statusCode).toBe(400);
  });

  // 7. Acceso sin JWT a una ruta protegida [cite: 158]
  it('7. Debe bloquear el acceso si no se envía JWT', async () => {
    const res = await request(app).get('/api/turnos');
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toContain('Se requiere un token JWT');
  });

  // 8. Acceso con JWT de estudiante a una acción solo permitida para admin o tutor [cite: 159]
  it('8. Debe devolver 403 si un estudiante intenta confirmar un turno', async () => {
    const res = await request(app).patch(`/api/turnos/${turnoId}/confirmar`).set('Authorization', `Bearer ${tokenEstudiante}`);
    expect(res.statusCode).toBe(403);
  });

  // 9. Edición inválida que reasigna a un tutor ocupado [cite: 160]
  it('9. Debe fallar la edición si se reasigna a un horario ocupado', async () => {
    // Creamos un turno libre a las 18:00
    const turnoEdit = await Turno.create({ tutorId, estudianteId, fecha: '2026-06-16', horaInicio: '18:00', horaFin: '19:00', tema: 'Libre', modalidad: 'virtual', estado: 'solicitado' });
    
    // Intentamos editarlo para moverlo a las 10:30, que choca con el turno de las 10:00
    const res = await request(app).put(`/api/turnos/${turnoEdit.id}`).set('Authorization', `Bearer ${tokenEstudiante}`).send({
      tutorId, fecha: '2026-06-16', horaInicio: '10:30', horaFin: '11:30', tema: 'Muevo a ocupado', modalidad: 'virtual'
    });
    expect(res.statusCode).toBe(400);
  });

  // 10. Creación inválida por día no disponible para el tutor [cite: 161]
  it('10. Debe fallar si se crea en un día que el tutor no atiende', async () => {
    // El 15 de junio de 2026 es lunes, y nuestro tutor de prueba atiende martes y miércoles
    const res = await request(app).post('/api/turnos').set('Authorization', `Bearer ${tokenEstudiante}`).send({
      tutorId, fecha: '2026-06-15', horaInicio: '10:00', horaFin: '11:00', tema: 'Lunes', modalidad: 'virtual'
    });
    expect(res.statusCode).toBe(400);
  });
});