import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import IndicadoresPage from './pages/IndicadoresPage'; 
import Layout from './components/Layout';

// Componente guardián para proteger rutas
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

          {/* Si se entra a una ruta no definida, redirigir a dashboard si está logueado, o a login si no */}
          <Route path="*" element={<Navigate to="/" />} /> 
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;