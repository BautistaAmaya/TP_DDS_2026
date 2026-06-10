import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

export const FormularioTurno = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id); // Si hay ID en la URL, estamos editando

  const [tutores, setTutores] = useState([]);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    tutorId: '',
    fecha: '',
    horaInicio: '',
    horaFin: '',
    tema: '',
    modalidad: 'virtual',
    observaciones: ''
  });

  useEffect(() => {
    // 1. Cargar la lista de tutores para el select
    const fetchTutores = async () => {
      try {
        // Asumiendo que armaste la ruta GET /api/tutores en tu backend
        const res = await api.get('/tutores');
        setTutores(res.data);
      } catch (err) {
        console.error('Error al cargar tutores', err);
      }
    };
    fetchTutores();

    // 2. Si estamos editando, cargar los datos actuales del turno
    if (isEditing) {
      const fetchTurno = async () => {
        try {
          const res = await api.get(`/turnos/${id}`);
          const t = res.data;
          setFormData({
            tutorId: t.tutorId,
            fecha: t.fecha,
            horaInicio: t.horaInicio,
            horaFin: t.horaFin,
            tema: t.tema,
            modalidad: t.modalidad,
            observaciones: t.observaciones || ''
          });
        } catch (err) {
          setError('No se pudo cargar el turno para editar.');
        }
      };
      fetchTurno();
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (isEditing) {
        await api.put(`/turnos/${id}`, formData);
      } else {
        await api.post('/turnos', formData);
      }
      navigate('/'); // Volvemos al listado si la API responde con éxito
    } catch (err) {
      // Los errores de API deben mostrarse de forma comprensible cerca de la acción 
      setError(err.response?.data?.error || 'Ocurrió un error al procesar la solicitud.');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h2>{isEditing ? 'Editar Turno' : 'Solicitar Nuevo Turno'}</h2>
      
      {error && (
        <div style={{ background: '#ffcccc', color: '#cc0000', padding: '10px', marginBottom: '15px', borderRadius: '4px' }}>
          <strong>Error: </strong> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <label>
          Tutor:
          <select name="tutorId" value={formData.tutorId} onChange={handleChange} required style={{ width: '100%', padding: '8px' }}>
            <option value="">Seleccione un tutor</option>
            {tutores.map(t => (
              <option key={t.id} value={t.id}>{t.nombre} - {t.especialidad}</option>
            ))}
          </select>
        </label>

        <div style={{ display: 'flex', gap: '15px' }}>
          <label style={{ flex: 1 }}>
            Fecha:
            <input type="date" name="fecha" value={formData.fecha} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
          </label>
          <label style={{ flex: 1 }}>
            Modalidad:
            <select name="modalidad" value={formData.modalidad} onChange={handleChange} required style={{ width: '100%', padding: '8px' }}>
              <option value="virtual">Virtual</option>
              <option value="presencial">Presencial</option>
            </select>
          </label>
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <label style={{ flex: 1 }}>
            Hora Inicio:
            <input type="time" name="horaInicio" value={formData.horaInicio} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
          </label>
          <label style={{ flex: 1 }}>
            Hora Fin:
            <input type="time" name="horaFin" value={formData.horaFin} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
          </label>
        </div>

        <label>
          Tema:
          <input type="text" name="tema" value={formData.tema} onChange={handleChange} required placeholder="Ej: Dudas con Express" style={{ width: '100%', padding: '8px' }} />
        </label>

        <label>
          Observaciones:
          <textarea name="observaciones" value={formData.observaciones} onChange={handleChange} rows="3" placeholder="Comentarios opcionales..." style={{ width: '100%', padding: '8px' }}></textarea>
        </label>

        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button type="submit" style={{ flex: 1, padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            {isEditing ? 'Guardar Cambios' : 'Confirmar Turno'}
          </button>
          <button type="button" onClick={() => navigate('/')} style={{ flex: 1, padding: '10px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};