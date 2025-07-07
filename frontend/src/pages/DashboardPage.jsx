import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import StatCard from '../components/StatCard';
import TechnicianCard from '../components/TechnicianCard';
import { DashboardSkeletons } from '../components/DashboardSkeletons';
import { Modal } from '../components/Modal';
import { TicketDetailsTable } from '../components/TicketDetailsTable';
import { TechnicianDetailsModal } from '../components/TechnicianDetailsModal';
import { FiUsers, FiClock, FiTool, FiAlertTriangle, FiCheckSquare, FiInbox, FiPackage, FiHardDrive } from 'react-icons/fi';

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState('all');
  const [ticketModalInfo, setTicketModalInfo] = useState({ isOpen: false, title: '', ticketIds: [] });
  const [selectedTecnico, setSelectedTecnico] = useState(null);

  useEffect(() => {
    const fetchData = (isInitialLoad = false) => {
      if (isInitialLoad) setLoading(true);
      setError('');
      apiService.getDashboardData(profile)
        .then(res => setData(res.data))
        .catch(() => setError('No se pudieron cargar los datos.'))
        .finally(() => { if (isInitialLoad) setLoading(false); });
    };
    fetchData(true);
    const intervalId = setInterval(() => fetchData(false), 30000);
    return () => clearInterval(intervalId);
  }, [profile]);

  const openTicketModal = (title, count, idsString) => {
    const ticketIds = idsString ? String(idsString).split(',').map(id => parseInt(id, 10)) : [];
    if (ticketIds.length > 0) {
      setTicketModalInfo({ isOpen: true, title: `Detalle: ${title} (${count} Tickets)`, ticketIds });
    }
  };
  const closeTicketModal = () => setTicketModalInfo({ isOpen: false, title: '', ticketIds: [] });
  
  const openTecnicoModal = (tecnico) => setSelectedTecnico(tecnico);
  const closeTecnicoModal = () => setSelectedTecnico(null);

  const FilterButtons = () => ( <div className="flex space-x-1 bg-gray-200 dark:bg-gray-700 p-1 rounded-full">{['all','l1','l2'].map(p => ( <button key={p} onClick={() => setProfile(p)} className={`px-5 py-2 text-sm font-semibold rounded-full ${ profile === p ? 'bg-white dark:bg-gray-900 text-indigo-700 dark:text-indigo-400 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-600'}`}>{p === 'all' ? 'Todos' : p.toUpperCase()}</button>))}</div> );

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div><h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Dashboard de Soporte</h1><p className="mt-1 text-gray-500 dark:text-gray-400">Vista general del estado de los tickets y técnicos.</p></div>
        <FilterButtons />
      </header>
      {loading && <DashboardSkeletons />}
      {error && <div className="text-center p-12 text-red-500 bg-red-100 rounded-lg">{error}</div>}
      
      {data && !loading && (
        <div className="space-y-8">
          <section>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              <StatCard title="No Asignadas" value={data.totales.total_no_asignada} onClick={() => openTicketModal('No Asignadas', data.totales.total_no_asignada, data.totales.total_no_asignada_ids)} icon={<FiAlertTriangle size={24} />} colorClass="text-red-500" />
              <StatCard title="Asignadas" value={data.totales.total_asignada} onClick={() => openTicketModal('Asignadas', data.totales.total_asignada, data.totales.total_asignada_ids)} icon={<FiUsers size={24} />} colorClass="text-orange-500" />
              <StatCard title="En Proceso" value={data.totales.total_en_proceso} onClick={() => openTicketModal('En Proceso', data.totales.total_en_proceso, data.totales.total_en_proceso_ids)} icon={<FiTool size={24} />} colorClass="text-blue-500" />
              <StatCard title="En Espera" value={data.totales.total_en_espera} onClick={() => openTicketModal('En Espera', data.totales.total_en_espera, data.totales.total_en_espera_ids)} icon={<FiClock size={24} />} colorClass="text-cyan-500" />
              <StatCard title="Resueltos Hoy" value={data.totales.total_resueltos_hoy} onClick={() => openTicketModal('Resueltos Hoy', data.totales.total_resueltos_hoy, data.totales.total_resueltos_hoy_ids)} icon={<FiCheckSquare size={24} />} colorClass="text-green-600" />
              <StatCard title="Internos" value={data.totales.total_internos} onClick={() => openTicketModal('Internos', data.totales.total_internos, data.totales.total_internos_ids)} icon={<FiInbox size={24} />} colorClass="text-purple-600" />
              <StatCard title="Pedidos" value={data.totales.total_pedidos} onClick={() => openTicketModal('Pedidos', data.totales.total_pedidos, data.totales.total_pedidos_ids)} icon={<FiPackage size={24} />} colorClass="text-pink-500" />
              <StatCard title="Taller" value={data.totales.total_taller} onClick={() => openTicketModal('Taller', data.totales.total_taller, data.totales.total_taller_ids)} icon={<FiHardDrive size={24} />} colorClass="text-gray-600" />
            </div>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Desglose por Técnico</h2>
            {data.tecnicos?.length > 0 ? ( <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">{data.tecnicos.map(t => <TechnicianCard key={t.user_id} tecnico={t} openTicketModal={openTicketModal} openTecnicoModal={openTecnicoModal} />)}</div> ) : ( <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm"><p className="dark:text-gray-300">No hay técnicos para mostrar.</p></div>)}
          </section>
        </div>
      )}

      <Modal isOpen={ticketModalInfo.isOpen} onClose={closeTicketModal} title={ticketModalInfo.title}>
        <TicketDetailsTable ticketIds={ticketModalInfo.ticketIds} />
      </Modal>
      
      <TechnicianDetailsModal tecnico={selectedTecnico} onClose={closeTecnicoModal} openTicketModal={openTicketModal} />
    </div>
  );
};

export default DashboardPage;