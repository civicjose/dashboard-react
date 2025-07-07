import React from 'react';

const SecondaryKPI = ({ label, value, onClick }) => (
    <button onClick={onClick} disabled={!value || value === 0} className="w-full text-left flex justify-between items-center py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-gray-700 px-2 -mx-2 rounded-md">
      <span className="text-gray-600 dark:text-gray-300">{label}</span>
      <span className="font-semibold text-gray-800 dark:text-gray-100 bg-slate-100 dark:bg-gray-600 px-2 py-0.5 rounded-full">{value}</span>
    </button>
);

const TechnicianCard = ({ tecnico, openTicketModal, openTecnicoModal }) => {
  const profileImageUrl = `https://ui-avatars.com/api/?name=${tecnico.firstname}+${tecnico.lastname}&background=e0e7ff&color=4f46e5&font-size=0.33`;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col h-full">
      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4">
        <img src={profileImageUrl} alt={`Foto de ${tecnico.firstname}`} className="w-14 h-14 rounded-full border-2 border-indigo-500 object-cover"/>
        <div className="flex-1 min-w-0">
          <button onClick={() => openTecnicoModal(tecnico)} className="text-base font-bold text-gray-800 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 text-left truncate block">
            {tecnico.firstname} {tecnico.lastname}
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-1 p-4">
          <button onClick={() => openTicketModal(`Resueltos Hoy por ${tecnico.firstname}`, tecnico.resueltos_hoy, tecnico.resueltos_hoy_ids)} disabled={!tecnico.resueltos_hoy} className="flex flex-col items-center p-2 rounded-lg disabled:opacity-50 hover:bg-green-50 dark:hover:bg-green-500/10">
              <div className="text-3xl font-bold text-green-600">{tecnico.resueltos_hoy}</div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Resueltos Hoy</div>
          </button>
          <button onClick={() => openTicketModal(`Asignadas a ${tecnico.firstname}`, tecnico.asignada, tecnico.asignada_ids)} disabled={!tecnico.asignada} className="flex flex-col items-center p-2 rounded-lg disabled:opacity-50 hover:bg-blue-50 dark:hover:bg-blue-500/10">
              <div className="text-3xl font-bold text-blue-600">{tecnico.asignada}</div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Asignadas</div>
          </button>
          <button onClick={() => openTicketModal(`En Espera de ${tecnico.firstname}`, tecnico.en_espera, tecnico.en_espera_ids)} disabled={!tecnico.en_espera} className="flex flex-col items-center p-2 rounded-lg disabled:opacity-50 hover:bg-yellow-50 dark:hover:bg-yellow-500/10">
              <div className="text-3xl font-bold text-yellow-500">{tecnico.en_espera}</div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400">En Espera</div>
          </button>
      </div>
      
      <div className="px-5 pb-5 pt-2 border-t border-gray-100 dark:border-gray-700 mt-auto">
        <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Otros Estados</h4>
        <div className="space-y-1">
          <SecondaryKPI label="En Proceso" value={tecnico.en_proceso} onClick={() => openTicketModal(`En Proceso por ${tecnico.firstname}`, tecnico.en_proceso, tecnico.en_proceso_ids)} />
          <SecondaryKPI label="Internos" value={tecnico.internos} onClick={() => openTicketModal(`Internos de ${tecnico.firstname}`, tecnico.internos, tecnico.internos_ids)} />
          <SecondaryKPI label="Pedidos" value={tecnico.pedidos} onClick={() => openTicketModal(`Pedidos de ${tecnico.firstname}`, tecnico.pedidos, tecnico.pedidos_ids)} />
          <SecondaryKPI label="Taller" value={tecnico.taller} onClick={() => openTicketModal(`Taller de ${tecnico.firstname}`, tecnico.taller, tecnico.taller_ids)} />
        </div>
      </div>
    </div>
  );
};

export default TechnicianCard;