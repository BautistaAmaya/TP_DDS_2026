import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export const ResumenAdmin = () => {
  const [resumen, setResumen] = useState(null);
  const [statsExtra, setStatsExtra] = useState({ tutores: {}, temas: {} });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // 1. Traemos el resumen básico (turnos del día y pendientes)
        const resData = await api.get('/turnos/resumen');
        setResumen(resData.data);

        // 2. Traemos todos los turnos para calcular "turnos por tutor" y "temas mas solicitados"
        const resTodos = await api.get('/turnos?limit=1000');
        const turnos = resTodos.data.turnos;

        const conteoTutores = {};
        const conteoTemas = {};

        turnos.forEach(t => {
          // Contabilizar por tutor
          const nombreTutor = t.tutor?.nombre || 'Sin asignar';
          conteoTutores[nombreTutor] = (conteoTutores[nombreTutor] || 0) + 1;

          // Contabilizar por tema
          const tema = t.tema;
          conteoTemas[tema] = (conteoTemas[tema] || 0) + 1;
        });

        // Ordenar temas de mayor a menor para sacar el Top 5
        const temasOrdenados = Object.entries(conteoTemas)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);

        setStatsExtra({ tutores: conteoTutores, temas: temasOrdenados });

      } catch (err) {
        setError('Error al cargar el panel. Verifique sus permisos de administrador.');
      }
    };
    cargarDatos();
  }, []);

  if (error) return <div style={{ color: 'red', padding: '20px', textAlign: 'center' }}><strong>{error}</strong></div>;
  if (!resumen) return <div style={{ padding: '20px', textAlign: 'center' }}>Cargando estadísticas...</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      <button onClick={() => navigate('/')} style={{ marginBottom: '20px', padding: '5px 10px', cursor: 'pointer' }}>← Volver al Listado</button>
      
      <h2>Panel de Administración</h2>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div style={{ flex: 1, background: '#007bff', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h3>Turnos del Día</h3>
          <p style={{ fontSize: '2.5rem', margin: 0, fontWeight: 'bold' }}>{resumen.turnosDelDia}</p>
        </div>
        <div style={{ flex: 1, background: '#ffc107', color: 'black', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h3>Pendientes de Confirmación</h3>
          <p style={{ fontSize: '2.5rem', margin: 0, fontWeight: 'bold' }}>{resumen.turnosPendientesConfirmacion}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1, background: '#f4f4f4', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
          <h3>Turnos por Tutor</h3>
          <ul style={{ lineHeight: '1.8' }}>
            {Object.entries(statsExtra.tutores).map(([tutor, cantidad]) => (
              <li key={tutor}>{tutor}: <strong>{cantidad}</strong></li>
            ))}
          </ul>
        </div>
        <div style={{ flex: 1, background: '#f4f4f4', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
          <h3>Top Temas Más Solicitados</h3>
          <ol style={{ lineHeight: '1.8' }}>
            {statsExtra.temas.map(([tema, cantidad]) => (
              <li key={tema}>{tema} (<strong>{cantidad}</strong> solicitudes)</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};