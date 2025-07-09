import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext'; // CAMBIO: Importamos el hook del tema
import { FiLogOut, FiSun, FiMoon } from 'react-icons/fi'; // CAMBIO: Importamos iconos

const Layout = () => {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme(); // CAMBIO: Obtenemos el tema y la función para cambiarlo
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const linkClasses = "flex items-center px-4 py-2.5 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200";
  const activeLinkClasses = "bg-gray-900 text-white";

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 font-sans">
      <aside className="w-64 bg-gray-800 text-white flex flex-col flex-shrink-0">
        <div className="h-20 flex items-center justify-center text-2xl font-bold border-b border-gray-700">Macrosad</div>
        <nav className="flex-1 px-2 py-4 space-y-2">
          <NavLink to="/dashboard" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>Dashboard</NavLink>
          <NavLink to="/indicadores" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>Indicadores</NavLink>
          <NavLink to="/kpi" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}> KPI</NavLink>
        </nav>
        
        {/* CAMBIO: Añadimos el botón para cambiar el tema */}
        <div className="p-4 border-t border-gray-700 space-y-2">
          <button onClick={toggleTheme} className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200">
            {theme === 'light' ? <FiMoon /> : <FiSun />}
            <span>{theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}</span>
          </button>

          <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200">
            <FiLogOut />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;