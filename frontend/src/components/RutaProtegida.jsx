import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export const RutaProtegida = ({ children, rolesPermitidos }) => {
  const { user } = useContext(AuthContext);

  // Si no hay usuario logueado, lo mandamos al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si se especifican roles y el usuario no tiene el adecuado, lo mandamos al inicio
  if (rolesPermitidos && !rolesPermitidos.includes(user.rol)) {
    return <Navigate to="/" replace />;
  }

  return children;
};