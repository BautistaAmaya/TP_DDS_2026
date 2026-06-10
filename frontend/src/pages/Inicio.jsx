import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Inicio = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Gestión de Tutorías</h1>
      <p>Bienvenido, <strong>{user?.nombre}</strong> (Rol: {user?.rol})</p>
      <button onClick={handleLogout}>Cerrar Sesión</button>
    </div>
  );
};