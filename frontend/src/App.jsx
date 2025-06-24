import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import IndicadoresPage from './pages/IndicadoresPage'; 
import Layout from './components/Layout';

// CAMBIO: Importamos la librería y sus estilos
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Layout /> : <Navigate to="/" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/indicadores" element={<IndicadoresPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} /> 
        </Routes>
        
        {/* CAMBIO: Añadimos el componente Tooltip aquí. 
            Le damos un id y un estilo base para el modo oscuro. */}
        <Tooltip 
          id="app-tooltip" 
          style={{ backgroundColor: "rgb(31 41 55)", color: "#fff" }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;