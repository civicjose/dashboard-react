import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { Modal } from './Modal';
import { FiMail, FiPhone, FiExternalLink, FiClock, FiRefreshCw, FiLayers, FiBarChart2, FiInfo } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../context/ThemeContext';

// Tooltip personalizado para el gráfico (más limpio)
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const date = new Date(label).toLocaleDateString('es-ES', {weekday: 'long', day: 'numeric'});
      return (
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-3 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
          <p className="font-bold text-gray-800 dark:text-gray-100">{date}</p>
          <p className="text-sm text-indigo-600 dark:text-indigo-400">Resueltos: <span className="font-semibold">{payload[0].value}</span></p>
        </div>
      );
    }
    return null;
};

// Nuevo diseño para los KPIs del modal
const PerformanceKPI = ({ icon, label, value, subValue, onClick, isLink = false }) => {
    const content = (
        <>
          <div className="flex items-center text-sm font-semibold text-gray-500 dark:text-gray-400">{icon}{label}</div>
          <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1">{value}</p>
          {subValue && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subValue}</p>}
        </>
    );

    const baseClasses = "text-left w-full h-full p-4 bg-slate-100 dark:bg-gray-900/50 rounded-lg transition-all duration-300 flex flex-col justify-center";
    const hoverClasses = "hover:bg-slate-200 dark:hover:bg-gray-700/50 hover:shadow-md";
    const disabledClasses = "disabled:cursor-not-allowed disabled:hover:bg-slate-100 dark:disabled:hover:bg-gray-900/50";

    if (isLink) {
      return <a href={onClick || '#'} target="_blank" rel="noopener noreferrer" className={`${baseClasses} ${hoverClasses}`}>{content}</a>
    }
  
    return <button onClick={onClick} disabled={!onClick} className={`${baseClasses} ${onClick ? hoverClasses : ''} ${disabledClasses}`}>{content}</button>;
};


export const TechnicianDetailsModal = ({ tecnico, onClose, openTicketModal }) => {
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    if (tecnico) {
      setLoading(true);
      apiService.getTecnicoDetails(tecnico.user_id)
        .then(res => setPerformanceData(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [tecnico]);

  if (!tecnico) return null;

  const profileImageUrl = `https://ui-avatars.com/api/?name=${tecnico.firstname}+${tecnico.lastname}&background=e0e7ff&color=4f46e5&font-size=0.33`;
  const glpiProfileUrl = `https://sistemas.macrosad.com/front/user.form.php?id=${tecnico.user_id}`;
  const tickColor = theme === 'dark' ? '#9CA3AF' : '#6B7280';
  
  const ultimoResuelto = performanceData?.ultimo_resuelto;
  const reabiertos = performanceData?.reabiertos;
  const colaDeTrabajo = (tecnico.asignada || 0) + (tecnico.en_proceso || 0) + (tecnico.en_espera || 0);

  return (
    <Modal isOpen={!!tecnico} onClose={onClose} title={`Ficha de Rendimiento: ${tecnico.firstname} ${tecnico.lastname}`}>
      <div className="space-y-6">
        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-gray-900/50 rounded-lg">
           <img src={profileImageUrl} alt="Avatar" className="w-16 h-16 rounded-full border-2 border-indigo-300"/>
           <div className="flex-grow">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{tecnico.firstname} {tecnico.lastname}</h2>
              <div className="text-sm text-gray-500 dark:text-gray-400 flex flex-col sm:flex-row sm:items-center sm:gap-4 mt-1">
                 <span><FiMail className="inline mr-1"/>{tecnico.email || '-'}</span>
                 <span><FiPhone className="inline mr-1"/>{tecnico.phone || '-'}</span>
              </div>
           </div>
           <a href={glpiProfileUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 text-sm flex-shrink-0">Ver en GLPI <FiExternalLink/></a>
        </div>
        
        {loading ? ( <div className="text-center p-8">Cargando rendimiento...</div> ) : performanceData && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <PerformanceKPI icon={<FiLayers className="mr-2"/>} label="Cola de Trabajo Actual" value={colaDeTrabajo} />
                <PerformanceKPI 
                    icon={<FiClock className="mr-2"/>} 
                    label="Último Ticket Resuelto" 
                    value={ultimoResuelto ? new Date(ultimoResuelto.solvedate).toLocaleDateString('es-ES', {day: '2-digit', month: '2-digit', year: '2-digit'}) : '-'}
                    subValue={ultimoResuelto ? new Date(ultimoResuelto.solvedate).toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'}) : ''}
                    onClick={ultimoResuelto ? `https://sistemas.macrosad.com/front/ticket.form.php?id=${ultimoResuelto.id}` : undefined} 
                    isLink={!!ultimoResuelto}
                />
                <PerformanceKPI 
                    icon={<FiRefreshCw className="mr-2"/>} 
                    label="Tickets Reabiertos" 
                    value={reabiertos?.count || 0}
                    onClick={() => reabiertos && reabiertos.count > 0 ? openTicketModal(`Reabiertos de ${tecnico.firstname}`, reabiertos.count, reabiertos.ids) : null}
                />
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
              <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2"><FiBarChart2/> Tickets Resueltos (Últimos 7 días)</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData.dailyTrend} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2}/>
                    <XAxis dataKey="dia" tickFormatter={(date) => new Date(date).toLocaleDateString('es-ES', {weekday: 'short', day: 'numeric'})} tick={{ fontSize: 12, fill: tickColor }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: tickColor }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="total" name="Tickets" stroke="#8884d8" strokeWidth={3} dot={{ r: 5, strokeWidth: 2 }} activeDot={{ r: 8 }}/>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}
      </div>
    </Modal>
  );
};