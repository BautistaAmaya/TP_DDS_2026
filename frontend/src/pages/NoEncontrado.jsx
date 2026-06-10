import { Link } from 'react-router-dom';

export const NoEncontrado = () => (
  <div style={{ textAlign: 'center', marginTop: '50px' }}>
    <h2>Error 404</h2>
    <p>La página que buscás no existe.</p>
    <Link to="/">Volver al inicio</Link>
  </div>
);