import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import StatCard from '../components/StatCard';
import StatusBarChart from '../components/StatusBarChart';
import TechnicianCard from '../components/TechnicianCard';
import { DashboardSkeletons } from '../components/DashboardSkeletons';
import { FiUsers, FiClock, FiTool, FiAlertTriangle, FiCheckSquare, FiInbox, FiPackage, FiHardDrive } from 'react-icons/fi';
import { generateGlpiUrl } from '../utils/glpiUrlHelper';

// Componente para los títulos de sección con estilos para modo oscuro
const SectionTitle = ({ children }) => (
  <div className="flex items-center my-6">
    <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
    <h2 className="mx-4 text-lg font-semibold text-gray-600 dark:text-gray-400 tracking-wider">{children}</h2>
    <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
  </div>
);

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      setError('');
      try {
        const response = await apiService.getDashboardData(profile);
        setData(response.data);
      } catch {
        setError('No se pudieron cargar los datos. La sesión puede haber expirado.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const intervalId = setInterval(fetchData, 30000); // Intervalo de 30 segundos (recomendado)
    return () => clearInterval(intervalId);
  }, [profile]);

  const FilterButtons = () => (
    // Dark mode: El fondo de los botones y el texto del hover cambian
    <div className="flex space-x-1 bg-gray-200 dark:bg-gray-700 p-1 rounded-full">
      {['all', 'l1', 'l2'].map(p => (
        <button
          key={p}
          onClick={() => {
            setLoading(true);
            setData(null);
            setProfile(p);
          }}
          className={`px-5 py-2 text-sm font-semibold rounded-full transition-colors ${
            profile === p 
              ? 'bg-white dark:bg-gray-900 text-indigo-700 dark:text-indigo-400 shadow-sm' 
              : 'text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-600'
          }`}
        >
          {p === 'all' ? 'Todos' : p.toUpperCase()}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          {/* Dark mode: Textos del encabezado */}
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Dashboard de Soporte</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">Vista general del estado de los tickets y técnicos.</p>
        </div>
        <FilterButtons />
      </div>

      {loading && <div className="animate-pulse"><DashboardSkeletons /></div>}
      {error && <div className="text-center p-12 text-red-600 bg-red-100 rounded-lg">{error}</div>}

      {data && !loading && (
        <div className="space-y-8">
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-5">
              <StatCard title="No Asignadas" value={data.totales.total_no_asignada} icon={<FiAlertTriangle size={24}/>} colorClass="text-red-500" link={generateGlpiUrl({ ticketIds: data.totales.total_no_asignada_ids })} />
              <StatCard title="Asignadas" value={data.totales.total_asignada} icon={<FiUsers size={24}/>} colorClass="text-orange-500" link={generateGlpiUrl({ ticketIds: data.totales.total_asignada_ids })} />
              <StatCard title="En Proceso" value={data.totales.total_en_proceso} icon={<FiTool size={24}/>} colorClass="text-blue-500" link={generateGlpiUrl({ ticketIds: data.totales.total_en_proceso_ids })} />
              <StatCard title="En Espera" value={data.totales.total_en_espera} icon={<FiClock size={24}/>} colorClass="text-cyan-500" link={generateGlpiUrl({ ticketIds: data.totales.total_en_espera_ids })} />
              <StatCard title="Resueltos Hoy" value={data.totales.total_resueltos_hoy} icon={<FiCheckSquare size={24}/>} colorClass="text-green-600" link={generateGlpiUrl({ ticketIds: data.totales.total_resueltos_hoy_ids })} />
              <StatCard title="Internos" value={data.totales.total_internos} icon={<FiInbox size={24}/>} colorClass="text-purple-600" link={generateGlpiUrl({ ticketIds: data.totales.total_internos_ids })} />
              <StatCard title="Pedidos" value={data.totales.total_pedidos} icon={<FiPackage size={24}/>} colorClass="text-pink-500" link={generateGlpiUrl({ ticketIds: data.totales.total_pedidos_ids })} />
              <StatCard title="Taller" value={data.totales.total_taller} icon={<FiHardDrive size={24}/>} colorClass="text-gray-600" link={generateGlpiUrl({ ticketIds: data.totales.total_taller_ids })} />
            </div>
            
            <div className="lg:col-span-1 h-full">
              <StatusBarChart data={data.totales} />
            </div>
          </section>

          <section>
            <SectionTitle>Desglose por Técnico</SectionTitle>
            {data.tecnicos && data.tecnicos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {data.tecnicos.map(tecnico => (
                  <TechnicianCard key={tecnico.user_id} tecnico={tecnico} />
                ))}
              </div>
            ) : (
              <div className="text-center p-12 bg-white dark:bg-gray-800 dark:text-gray-300 rounded-lg shadow-sm">
                No hay técnicos para mostrar en este perfil.
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;