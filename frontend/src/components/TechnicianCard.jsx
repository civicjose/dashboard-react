import React from 'react';
import { generateGlpiUrl } from '../utils/glpiUrlHelper';

const SecondaryKPI = ({ label, value, link }) => (
    <a 
      href={value > 0 ? link : undefined} 
      target="_blank" 
      rel="noopener noreferrer" 
      className={`flex justify-between items-center py-2 text-sm ${
        value > 0 
          ? 'hover:bg-slate-100 dark:hover:bg-gray-700 px-2 -mx-2 rounded-md' 
          : 'opacity-50 cursor-default'
      }`}
    >
      <span className="text-gray-600 dark:text-gray-300">{label}</span>
      <span className="font-semibold text-gray-800 dark:text-gray-100 bg-slate-100 dark:bg-gray-600 px-2 py-0.5 rounded-full">{value}</span>
    </a>
);

const TechnicianCard = ({ tecnico }) => {
  const GLPI_USER_URL = `https://sistemas.macrosad.com/front/user.form.php?id=${tecnico.user_id}`;
  const profileImageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(tecnico.firstname)}+${encodeURIComponent(tecnico.lastname)}&background=e0e7ff&color=4f46e5&font-size=0.33`;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-xl h-full">
      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 flex items-center gap-4">
        <img src={profileImageUrl} alt={`Foto de ${tecnico.firstname}`} className="w-14 h-14 rounded-full border-2 border-indigo-200 dark:border-indigo-500 object-cover"/>
        <div className="flex-1 min-w-0">
          <a href={GLPI_USER_URL} target="_blank" rel="noopener noreferrer" className="text-base font-bold text-gray-800 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 truncate block">
            {tecnico.firstname} {tecnico.lastname}
          </a>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-1 p-4">
          <a href={tecnico.resueltos_hoy > 0 ? generateGlpiUrl({ ticketIds: tecnico.resueltos_hoy_ids }) : undefined} target="_blank" rel="noopener noreferrer" className={`flex flex-col items-center p-2 rounded-lg ${tecnico.resueltos_hoy > 0 ? 'hover:bg-green-50 dark:hover:bg-green-500/10 text-green-600' : 'opacity-50 text-green-600/50'}`}>
              <div className="text-3xl font-bold">{tecnico.resueltos_hoy}</div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Resueltos Hoy</div>
          </a>
          <a href={tecnico.asignada > 0 ? generateGlpiUrl({ ticketIds: tecnico.asignada_ids }) : undefined} target="_blank" rel="noopener noreferrer" className={`flex flex-col items-center p-2 rounded-lg ${tecnico.asignada > 0 ? 'hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-600' : 'opacity-50 text-blue-600/50'}`}>
              <div className="text-3xl font-bold">{tecnico.asignada}</div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400">Asignadas</div>
          </a>
          <a href={tecnico.en_espera > 0 ? generateGlpiUrl({ ticketIds: tecnico.en_espera_ids }) : undefined} target="_blank" rel="noopener noreferrer" className={`flex flex-col items-center p-2 rounded-lg ${tecnico.en_espera > 0 ? 'hover:bg-yellow-50 dark:hover:bg-yellow-500/10 text-yellow-500' : 'opacity-50 text-yellow-500/50'}`}>
              <div className="text-3xl font-bold">{tecnico.en_espera}</div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400">En Espera</div>
          </a>
      </div>
      
      <div className="px-5 pb-5 pt-2 border-t border-gray-100 dark:border-gray-700 mt-auto">
        <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">Otros Estados</h4>
        <div className="space-y-1">
          <SecondaryKPI label="En Proceso" value={tecnico.en_proceso} link={generateGlpiUrl({ ticketIds: tecnico.en_proceso_ids })} />
          <SecondaryKPI label="Internos" value={tecnico.internos} link={generateGlpiUrl({ ticketIds: tecnico.internos_ids })} />
          <SecondaryKPI label="Pedidos" value={tecnico.pedidos} link={generateGlpiUrl({ ticketIds: tecnico.pedidos_ids })} />
          <SecondaryKPI label="Taller" value={tecnico.taller} link={generateGlpiUrl({ ticketIds: tecnico.taller_ids })} />
        </div>
      </div>
    </div>
  );
};

export default TechnicianCard;