import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RutaProtegida } from './components/RutaProtegida';
import { Login } from './pages/Login';
import { Inicio } from './pages/Inicio';
import { NoEncontrado } from './pages/NoEncontrado';
import { ListadoTurnos } from './pages/ListadoTurnos.jsx';
import { FormularioTurno } from './pages/FormularioTurno.jsx';
import { DetalleTurno } from './pages/DetalleTurno.jsx';
import { ResumenAdmin } from './pages/ResumenAdmin.jsx';


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/login" element={<Login />} />

          {/* Rutas Protegidas */}
          <Route 
            path="/" 
            element={
              <RutaProtegida>
                <ListadoTurnos />
              </RutaProtegida>
            }  
          />
          <Route 
            path="/turnos/nuevo" 
            element={
              <RutaProtegida rolesPermitidos={['estudiante', 'admin']}>
                <FormularioTurno />
              </RutaProtegida>
            } 
          />
          <Route 
            path="/turnos/:id/editar" 
            element={
              <RutaProtegida rolesPermitidos={['estudiante', 'admin']}>
                <FormularioTurno />
              </RutaProtegida>
            } 
          />

          <Route 
            path="/turnos/:id" 
            element={
              <RutaProtegida rolesPermitidos={['estudiante', 'tutor', 'admin']}>
                <DetalleTurno />
              </RutaProtegida>
            } 
          />

          {/* Panel de Administración */}
          <Route 
            path="/admin/resumen" 
            element={
              <RutaProtegida rolesPermitidos={['admin']}>
                <ResumenAdmin />
              </RutaProtegida>
            } 
          />


          {/* Ruta comodín para página no encontrada */}
          <Route path="*" element={<NoEncontrado />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;