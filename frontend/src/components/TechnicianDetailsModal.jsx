import React from 'react';
import { Modal } from './Modal';
import StatCard from './StatCard';
import { 
    FiMail, 
    FiPhone, 
    FiExternalLink,
    FiUsers, 
    FiClock, 
    FiTool, 
    FiCheckSquare, 
    FiInbox, 
    FiPackage, 
    FiHardDrive 
} from 'react-icons/fi';

export const TechnicianDetailsModal = ({ tecnico, onClose, openTicketModal }) => {
  if (!tecnico) return null;

  const profileImageUrl = `https://ui-avatars.com/api/?name=${tecnico.firstname}+${tecnico.lastname}&background=e0e7ff&color=4f46e5&font-size=0.33`;
  const glpiProfileUrl = `https://sistemas.macrosad.com/front/user.form.php?id=${tecnico.user_id}`;

  return (
    <Modal isOpen={!!tecnico} onClose={onClose} title="Ficha de Técnico">
      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        {/* Columna de la Información Personal */}
        <div className="md:w-1/3 text-center flex flex-col items-center flex-shrink-0">
          <img src={profileImageUrl} alt={`Foto de ${tecnico.firstname}`} className="w-32 h-32 rounded-full border-4 border-indigo-200 object-cover mb-4"/>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{tecnico.firstname} {tecnico.lastname}</h2>
          <a 
            href={glpiProfileUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="mt-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-2"
          >
            Ver perfil en GLPI <FiExternalLink />
          </a>
          <div className="mt-4 text-left space-y-3 w-full border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center gap-3">
              <FiMail className="text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300 break-all">{tecnico.email || 'No disponible'}</span>
            </div>
            <div className="flex items-center gap-3">
              <FiPhone className="text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">{tecnico.phone || 'No disponible'}</span>
            </div>
          </div>
        </div>

        {/* Columna de los Indicadores del Técnico */}
        <div className="md:w-2/3 md:border-l border-gray-200 dark:border-gray-700 md:pl-8">
           <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Indicadores Personales</h3>
           <div className="bg-slate-50 dark:bg-gray-900/50 p-4 rounded-lg">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* A cada StatCard se le pasa la prop variant="compact" */}
                    <StatCard variant="compact" title="Asignadas" value={tecnico.asignada} onClick={() => openTicketModal(`Asignadas a ${tecnico.firstname}`, tecnico.asignada, tecnico.asignada_ids)} icon={<FiUsers size={20} />} colorClass="text-orange-500" />
                    <StatCard variant="compact" title="En Proceso" value={tecnico.en_proceso} onClick={() => openTicketModal(`En Proceso por ${tecnico.firstname}`, tecnico.en_proceso, tecnico.en_proceso_ids)} icon={<FiTool size={20} />} colorClass="text-blue-500" />
                    <StatCard variant="compact" title="En Espera" value={tecnico.en_espera} onClick={() => openTicketModal(`En Espera de ${tecnico.firstname}`, tecnico.en_espera, tecnico.en_espera_ids)} icon={<FiClock size={20} />} colorClass="text-cyan-500" />
                    <StatCard variant="compact" title="Resueltos Hoy" value={tecnico.resueltos_hoy} onClick={() => openTicketModal(`Resueltos Hoy por ${tecnico.firstname}`, tecnico.resueltos_hoy, tecnico.resueltos_hoy_ids)} icon={<FiCheckSquare size={20} />} colorClass="text-green-600" />
                    <StatCard variant="compact" title="Internos" value={tecnico.internos} onClick={() => openTicketModal(`Internos de ${tecnico.firstname}`, tecnico.internos, tecnico.internos_ids)} icon={<FiInbox size={20} />} colorClass="text-purple-600" />
                    <StatCard variant="compact" title="Pedidos" value={tecnico.pedidos} onClick={() => openTicketModal(`Pedidos de ${tecnico.firstname}`, tecnico.pedidos, tecnico.pedidos_ids)} icon={<FiPackage size={20} />} colorClass="text-pink-500" />
                    <StatCard variant="compact" title="Taller" value={tecnico.taller} onClick={() => openTicketModal(`Taller de ${tecnico.firstname}`, tecnico.taller, tecnico.taller_ids)} icon={<FiHardDrive size={20} />} colorClass="text-gray-600" />
                </div>
           </div>
        </div>
      </div>
    </Modal>
  );
};