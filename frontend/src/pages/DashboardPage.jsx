import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import StatCard from '../components/StatCard';
import StatusDonutChart from '../components/StatusDonutChart';
import TechnicianCard from '../components/TechnicianCard';
import { DashboardSkeletons } from '../components/DashboardSkeletons';
import {
  FiUsers, FiClock, FiTool, FiAlertTriangle,
  FiCheckSquare, FiInbox, FiPackage, FiHardDrive
} from 'react-icons/fi';
import { generateGlpiUrl } from '../utils/glpiUrlHelper';

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiService.getDashboardData(profile);
        setData(res.data);
      } catch {
        setError('No se pudieron cargar los datos. La sesión puede haber expirado.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [profile]);

  const FilterButtons = () => (
    <div className="flex space-x-1 bg-gray-200 p-1 rounded-full">
      {['all','l1','l2'].map(p => (
        <button
          key={p}
          onClick={() => setProfile(p)}
          className={`px-5 py-2 text-sm font-semibold rounded-full transition-colors ${
            profile === p
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-gray-600 hover:bg-white/60'
          }`}
        >
          {p === 'all' ? 'Todos' : p.toUpperCase()}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-8 p-6">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard de Soporte</h1>
          <p className="mt-1 text-gray-500">Vista general del estado de los tickets y técnicos.</p>
        </div>
        <FilterButtons />
      </div>

      {/* Carga y error */}
      {loading && <div className="animate-pulse"><DashboardSkeletons /></div>}
      {error && <div className="text-center p-12 text-red-600 bg-red-100 rounded-lg">{error}</div>}

      {/* Contenido */}
      {data && !loading && (
        <div className="space-y-8">
          {/* KPIs + Gráfico */}
          <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* KPIs: 3/5 ancho */}
            <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-5">
              <StatCard
                title="No Asignadas"
                value={data.totales.total_no_asignada}
                icon={<FiAlertTriangle size={24} />}
                colorClass="text-red-500"
                link={generateGlpiUrl({ status: 1 })}
              />
              <StatCard
                title="Asignadas"
                value={data.totales.total_asignada}
                icon={<FiUsers size={24} />}
                colorClass="text-orange-500"
                link={generateGlpiUrl({ status: 2 })}
              />
              <StatCard
                title="En Proceso"
                value={data.totales.total_en_proceso}
                icon={<FiTool size={24} />}
                colorClass="text-blue-500"
                link={generateGlpiUrl({ status: 3 })}
              />
              <StatCard
                title="En Espera"
                value={data.totales.total_en_espera}
                icon={<FiClock size={24} />}
                colorClass="text-cyan-500"
                link={generateGlpiUrl({ status: 4 })}
              />
              <StatCard
                title="Resueltos Hoy"
                value={data.totales.total_resueltos_hoy}
                icon={<FiCheckSquare size={24} />}
                colorClass="text-green-600"
                link={generateGlpiUrl({ status: 5, isToday: true })}
              />
              <StatCard
                title="Internos"
                value={data.totales.total_internos}
                icon={<FiInbox size={24} />}
                colorClass="text-purple-600"
                link={generateGlpiUrl({ status: '1|2|3|4', tagId: 5 })}
              />
              <StatCard
                title="Pedidos"
                value={data.totales.total_pedidos}
                icon={<FiPackage size={24} />}
                colorClass="text-pink-500"
                link={generateGlpiUrl({ status: '1|2|3|4', tagId: 1 })}
              />
              <StatCard
                title="Instalaciones"
                value={data.totales.total_instalaciones_pendientes}
                icon={<FiHardDrive size={24} />}
                colorClass="text-gray-600"
                link={generateGlpiUrl({ status: '1|2|3|4', tagId: 4 })}
              />
            </div>

            {/* Gráfico: 2/5 ancho */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm flex flex-col justify-center items-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribución de Tickets Activos</h3>
              <div className="w-full h-96">
                <StatusDonutChart data={data.totales} />
              </div>
            </div>
          </section>

          {/* Desglose por Técnico */}
          <section>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Desglose por Técnico</h2>
            {data.tecnicos?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {data.tecnicos.map(t => (
                  <TechnicianCard key={t.user_id} tecnico={t} />
                ))}
              </div>
            ) : (
              <div className="text-center p-12 bg-white rounded-lg shadow-sm">
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
