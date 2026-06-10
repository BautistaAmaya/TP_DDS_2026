import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

export const ListadoTurnos = () => {
  const { user, logout } = useContext(AuthContext);
  const [turnos, setTurnos] = useState([]);
  const [filtros, setFiltros] = useState({ estado: '', fecha: '', especialidad: '' });

  const fetchTurnos = async () => {
    try {
      const response = await api.get('/turnos', { params: filtros });
      setTurnos(response.data.turnos);
    } catch (error) {
      console.error('Error cargando turnos', error);
    }
  };

  // Se vuelve a llamar a la API cada vez que cambia algún filtro
  useEffect(() => {
    fetchTurnos();
  }, [filtros]);

  const handleFiltroChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
        <h2>Gestión de Tutorías</h2>
        <div>
          <span style={{ marginRight: '15px' }}>Hola, <strong>{user?.nombre}</strong> (Rol: {user?.rol})</span>
          <button onClick={logout} style={{ padding: '5px 10px', cursor: 'pointer' }}>Cerrar Sesión</button>
        </div>
      </header>

      {/* Controles y Filtros */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'center' }}>
        <input type="date" name="fecha" onChange={handleFiltroChange} style={{ padding: '5px' }} />
        
        <select name="estado" onChange={handleFiltroChange} style={{ padding: '5px' }}>
          <option value="">Todos los estados</option>
          <option value="solicitado">Solicitado</option>
          <option value="confirmado">Confirmado</option>
          <option value="realizado">Realizado</option>
          <option value="cancelado">Cancelado</option>
        </select>
        
        <input type="text" name="especialidad" placeholder="Filtrar por especialidad" onChange={handleFiltroChange} style={{ padding: '5px' }} />
        
        {/* Este botón lo programaremos en el siguiente paso */}
        {user?.rol !== 'tutor' && (
          <Link to="/turnos/nuevo" style={{ marginLeft: 'auto', padding: '8px 15px', background: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
            + Solicitar Turno
          </Link>
        )}
        {/* Este botón solo lo ve el Administrador */}
        {user?.rol === 'admin' && (
          <Link to="/admin/resumen" style={{ marginLeft: '10px', padding: '8px 15px', background: '#343a40', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
            📊 Panel Admin
          </Link>
        )}

      </div>

      {/* Tabla de Turnos */}
      <table border="1" width="100%" cellPadding="10" style={{ borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead style={{ backgroundColor: '#f4f4f4' }}>
          <tr>
            <th>Fecha</th>
            <th>Horario</th>
            <th>Tutor</th>
            <th>Tema</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {turnos.length > 0 ? (
            turnos.map((t) => (
              <tr key={t.id}>
                <td>{t.fecha}</td>
                <td>{t.horaInicio} - {t.horaFin}</td>
                <td>{t.tutor?.nombre || 'Sin asignar'}</td>
                <td>{t.tema}</td>
                <td><strong>{t.estado}</strong></td>
                <td>
                  <Link to={`/turnos/${t.id}`} style={{ color: '#007bff' }}>Ver Detalle</Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center' }}>No se encontraron turnos con estos filtros.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};