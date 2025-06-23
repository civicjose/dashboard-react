import React from 'react';
import { generateGlpiUrl } from '../utils/glpiUrlHelper';
import { FiPhoneForwarded, FiTool, FiCoffee, FiCheckCircle, FiInbox, FiPackage, FiHardDrive } from 'react-icons/fi';

const KPI = ({ label, value, link }) => {
  const content = (
    <>
      <div className="text-2xl text-indigo-600 mb-1">{icon}</div>
      <span className="text-xl font-bold text-gray-800">{value}</span>
      <span className="text-xs text-gray-500 font-medium truncate">{label}</span>
    </>
  );

  return value > 0 ? (
    <a href={link} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-2 text-center rounded-lg hover:bg-gray-100 transition-colors duration-200">
      {content}
    </a>
  ) : (
    <div className="flex flex-col items-center justify-center p-2 text-center rounded-lg cursor-default opacity-40">
      {content}
    </div>
  );
};

const SecondaryKPI = ({ label, value, link }) => (
    <a href={value > 0 ? link : undefined} target="_blank" rel="noopener noreferrer" className={`flex justify-between items-center py-2 text-sm ${value > 0 ? 'hover:bg-slate-50 px-2 -mx-2 rounded-md' : 'opacity-50 cursor-default'}`}>
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold text-gray-800 bg-slate-100 px-2 py-0.5 rounded-full">{value}</span>
    </a>
);

const TechnicianCard = ({ tecnico }) => {
  const GLPI_USER_URL = `https://sistemas.macrosad.com/front/user.form.php?id=${tecnico.user_id}`;
  const profileImageUrl = `https://ui-avatars.com/api/?name=${tecnico.firstname}+${tecnico.lastname}&background=e0e7ff&color=4f46e5&font-size=0.33`;

  return (
    // CORRECCIÓN: Hacemos que la tarjeta ocupe toda la altura de su celda en la cuadrícula
    <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transition-shadow hover:shadow-xl duration-300 h-full">
      <div className="p-4 bg-gray-50 border-b flex items-center gap-4">
        <img src={profileImageUrl} alt={`Foto de ${tecnico.firstname}`} className="w-14 h-14 rounded-full border-2 border-indigo-500 object-cover"/>
        <div className="flex-1 min-w-0">
          <a href={GLPI_USER_URL} target="_blank" rel="noopener noreferrer" className="text-base font-bold text-gray-800 hover:text-indigo-600 truncate block">
            {tecnico.firstname} {tecnico.lastname}
          </a>
        </div>
      </div>
      
      {/* KPIs Principales */}
      <div className="grid grid-cols-3 gap-1 p-4">
          <a href={tecnico.resueltos_hoy > 0 ? generateGlpiUrl({ status: 5, technicianId: tecnico.user_id, isToday: true }) : undefined} target="_blank" rel="noopener noreferrer" className={`flex flex-col items-center p-2 rounded-lg ${tecnico.resueltos_hoy > 0 ? 'hover:bg-green-50' : 'opacity-50'}`}>
              <div className="text-3xl font-bold text-green-600">{tecnico.resueltos_hoy}</div>
              <div className="text-xs font-medium text-gray-500">Resueltos Hoy</div>
          </a>
          <a href={tecnico.asignada > 0 ? generateGlpiUrl({ status: 2, technicianId: tecnico.user_id }) : undefined} target="_blank" rel="noopener noreferrer" className={`flex flex-col items-center p-2 rounded-lg ${tecnico.asignada > 0 ? 'hover:bg-blue-50' : 'opacity-50'}`}>
              <div className="text-3xl font-bold text-blue-600">{tecnico.asignada}</div>
              <div className="text-xs font-medium text-gray-500">Asignadas</div>
          </a>
          <a href={tecnico.en_espera > 0 ? generateGlpiUrl({ status: 4, technicianId: tecnico.user_id }) : undefined} target="_blank" rel="noopener noreferrer" className={`flex flex-col items-center p-2 rounded-lg ${tecnico.en_espera > 0 ? 'hover:bg-yellow-50' : 'opacity-50'}`}>
              <div className="text-3xl font-bold text-yellow-500">{tecnico.en_espera}</div>
              <div className="text-xs font-medium text-gray-500">En Espera</div>
          </a>
      </div>
      
      {/* El 'mt-auto' empuja esta sección hacia abajo, ocupando el espacio sobrante */}
      <div className="px-5 pb-5 pt-2 border-t border-gray-100 mt-auto">
        <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Otros Estados</h4>
        <div className="space-y-1">
          <SecondaryKPI label="En Proceso" value={tecnico.en_proceso} link={generateGlpiUrl({ status: 3, technicianId: tecnico.user_id })} />
          <SecondaryKPI label="Internos" value={tecnico.internos} link={generateGlpiUrl({ status: '1|2|3|4', technicianId: tecnico.user_id, tagId: 5 })} />
          <SecondaryKPI label="Pedidos" value={tecnico.pedidos} link={generateGlpiUrl({ status: '1|2|3|4', technicianId: tecnico.user_id, tagId: 1 })} />
          <SecondaryKPI label="Instalaciones" value={tecnico.instalaciones} link={generateGlpiUrl({ status: '1|2|3|4', technicianId: tecnico.user_id, tagId: 4 })} />
        </div>
      </div>
    </div>
  );
};

export default TechnicianCard;