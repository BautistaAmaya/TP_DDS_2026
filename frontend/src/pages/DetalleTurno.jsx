import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

export const DetalleTurno = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [turno, setTurno] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [error, setError] = useState(null);

  const cargarDatos = async () => {
    try {
      const resTurno = await api.get(`/turnos/${id}`);
      setTurno(resTurno.data);

      const resHistorial = await api.get(`/turnos/${id}/historial`);
      setHistorial(resHistorial.data);
    } catch (err) {
      setError('Error al cargar el turno o no existe.');
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cambiarEstado = async (accion) => {
    try {
      await api.patch(`/turnos/${id}/${accion}`);
      cargarDatos(); // Recargamos para ver el nuevo estado e historial
    } catch (err) {
      alert(err.response?.data?.error || `Error al ${accion} el turno`);
    }
  };

  if (error) return <div style={{ color: 'red', padding: '20px' }}>{error}</div>;
  if (!turno) return <div style={{ padding: '20px' }}>Cargando...</div>;

  // Lógica de permisos para los botones según el PDF
  const esEstudiante = user?.rol === 'estudiante';
  const esTutor = user?.rol === 'tutor';
  const esAdmin = user?.rol === 'admin';

  const puedeCancelar = (esEstudiante || esAdmin) && (turno.estado === 'solicitado' || turno.estado === 'confirmado');
  const puedeConfirmar = (esTutor || esAdmin) && turno.estado === 'solicitado';
  const puedeRealizar = (esTutor || esAdmin) && turno.estado === 'confirmado';
  const puedeEditar = (esEstudiante || esAdmin) && turno.estado !== 'realizado' && turno.estado !== 'cancelado';

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      <button onClick={() => navigate('/')} style={{ marginBottom: '20px', padding: '5px 10px' }}>← Volver al Listado</button>
      
      <h2>Detalle del Turno #{turno.id}</h2>
      
      <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '20px' }}>
        <p><strong>Estado Actual:</strong> <span style={{ textTransform: 'uppercase', color: '#007bff' }}>{turno.estado}</span></p>
        <p><strong>Fecha:</strong> {turno.fecha}</p>
        <p><strong>Horario:</strong> {turno.horaInicio} a {turno.horaFin}</p>
        <p><strong>Tutor:</strong> {turno.tutor?.nombre}</p>
        <p><strong>Estudiante:</strong> {turno.estudiante?.nombre} ({turno.estudiante?.email})</p>
        <p><strong>Modalidad:</strong> {turno.modalidad}</p>
        <p><strong>Tema:</strong> {turno.tema}</p>
        <p><strong>Observaciones:</strong> {turno.observaciones || 'Ninguna'}</p>
        
        {/* Acciones de Estado */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          {puedeConfirmar && <button onClick={() => cambiarEstado('confirmar')} style={{ background: '#28a745', color: '#fff', padding: '8px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Confirmar Turno</button>}
          {puedeRealizar && <button onClick={() => cambiarEstado('realizar')} style={{ background: '#17a2b8', color: '#fff', padding: '8px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Marcar como Realizado</button>}
          {puedeCancelar && <button onClick={() => cambiarEstado('cancelar')} style={{ background: '#dc3545', color: '#fff', padding: '8px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancelar Turno</button>}
          {puedeEditar && <Link to={`/turnos/${turno.id}/editar`} style={{ background: '#ffc107', color: '#000', padding: '8px 15px', textDecoration: 'none', borderRadius: '4px' }}>Editar Datos</Link>}
        </div>
      </div>

      <h3>Historial de Cambios</h3>
      <table border="1" width="100%" cellPadding="8" style={{ borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
        <thead style={{ backgroundColor: '#eee' }}>
          <tr>
            <th>Fecha y Hora</th>
            <th>Acción</th>
            <th>Valores Modificados</th>
          </tr>
        </thead>
        <tbody>
          {historial.length > 0 ? (
            historial.map(h => (
              <tr key={h.id}>
                <td>{new Date(h.fechaHora).toLocaleString()}</td>
                <td style={{ textTransform: 'capitalize' }}><strong>{h.accion}</strong></td>
                <td>
                  <pre style={{ margin: 0, fontSize: '12px' }}>
                    {h.valorNuevo ? JSON.stringify(h.valorNuevo, null, 2) : 'Sin detalles'}
                  </pre>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="3" style={{ textAlign: 'center' }}>No hay historial registrado.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};