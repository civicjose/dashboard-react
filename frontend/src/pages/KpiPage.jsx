import React, { useState, useEffect, useMemo } from 'react';
import { apiService } from '../services/apiService';
import { FiDownload, FiInfo, FiCalendar, FiCheckCircle, FiAlertCircle, FiClock, FiActivity, FiLogIn, FiLogOut, FiArchive } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import { exportToPdf, exportToExcel } from '../utils/exportService';


// --- Componentes Locales para el Nuevo Diseño ---

// NUEVO: Componente de tarjeta específico para los KPIs de este informe
const KpiHighlightCard = ({ title, value, icon, colorClass }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg flex items-center gap-6 border-l-4" style={{ borderColor: colorClass }}>
    <div className="p-3 rounded-full bg-opacity-10" style={{ backgroundColor: `${colorClass}1A` }}>
      {React.cloneElement(icon, { className: `h-7 w-7`, style: { color: colorClass } })}
    </div>
    <div>
      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  </div>
);

// NUEVO: Componente de lista para los desgloses
const BreakdownListItem = ({ label, value, icon }) => (
    <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
        <div className="flex items-center gap-3">
            {React.cloneElement(icon, { className: "text-gray-400" })}
            <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
        </div>
        <span className="text-sm font-bold text-gray-900 dark:text-gray-100 bg-slate-100 dark:bg-gray-700 px-2 py-1 rounded-md">{value}</span>
    </div>
);

// NUEVO: Componente para las barras de progreso
const SourceProgressBar = ({ name, value, total, color }) => {
    const percent = total > 0 ? (value / total) * 100 : 0;
    return (
        <div>
            <div className="flex justify-between mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">
                <span>{name}</span>
                <span>{value}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div className="h-2.5 rounded-full" style={{ width: `${percent}%`, backgroundColor: color }}></div>
            </div>
        </div>
    );
};

const EmptyState = ({ message, icon }) => (
    <div className="text-center p-10 bg-gray-50 dark:bg-gray-800/50 rounded-lg h-full flex flex-col justify-center items-center">
        {React.cloneElement(icon, { size: 32, className: "text-gray-400 mb-4" })}
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{message}</p>
    </div>
);


const KpiPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return {
      desde: firstDayOfMonth.toISOString().split('T')[0],
      hasta: today.toISOString().split('T')[0],
    };
  });

  const fetchData = async () => {
    setLoading(true);
    setError('');
    setData(null);
    try {
      const response = await apiService.getKpiReport(filters);
      setData(response.data);
    } catch (err) {
      setError('No se pudieron cargar los datos. Revisa las fechas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const handleSubmit = (e) => { e.preventDefault(); fetchData(); };

  const totalOrigen = useMemo(() => {
      if (!data?.origen) return 0;
      return data.origen.reduce((sum, item) => sum + item.total, 0);
  }, [data]);
  
  const COLORS = ['#4f46e5', '#a855f7', '#ec4899', '#f97316', '#14b8a6'];

  return (
    <div className="space-y-8">
    <header className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Informe de KPI</h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">Análisis detallado de la actividad del soporte en un periodo.</p>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={() => exportToPdf(data, filters)} disabled={!data || loading} className="py-2 px-4 bg-red-600 text-white font-semibold rounded-lg shadow-md flex items-center gap-2 disabled:bg-red-400 disabled:cursor-not-allowed hover:bg-red-700">
                <FiDownload /> PDF
            </button>
            <button onClick={() => exportToExcel(data, filters)} disabled={!data || loading} className="py-2 px-4 bg-green-600 text-white font-semibold rounded-lg shadow-md flex items-center gap-2 disabled:bg-green-400 disabled:cursor-not-allowed hover:bg-green-700">
                <FiDownload /> Excel
            </button>
        </div>
    </header>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-end gap-4">
          <div>
            <label htmlFor="desde" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Desde</label>
            <input type="date" name="desde" id="desde" value={filters.desde} onChange={handleFilterChange} className="mt-1 block w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md shadow-sm p-2"/>
          </div>
          <div>
            <label htmlFor="hasta" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hasta</label>
            <input type="date" name="hasta" id="hasta" value={filters.hasta} onChange={handleFilterChange} className="mt-1 block w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md shadow-sm p-2"/>
          </div>
          <button type="submit" disabled={loading} className="py-2.5 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-400">
            {loading ? 'Consultando...' : 'Aplicar Filtros'}
          </button>
        </form>
      </div>

      {loading && <div className="text-center p-10 text-gray-500 dark:text-gray-400">Generando informe...</div>}
      {error && <div className="text-center p-10 text-red-500">{error}</div>}

      {data && !loading && (
        <div id="report-content" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KpiHighlightCard title="Total Tickets Abiertos" value={data.totales.total_abiertos} icon={<FiAlertCircle />} colorClass="#f97316"/>
            <KpiHighlightCard title="Total Tickets Cerrados" value={data.totales.total_cerrados} icon={<FiCheckCircle />} colorClass="#22c55e"/>
            <KpiHighlightCard title="T.M. Cierre Incidencias" value={data.tiempos.cierre_incidencias} icon={<FiClock />} colorClass="#ef4444"/>
            <KpiHighlightCard title="T.M. Cierre Peticiones" value={data.tiempos.cierre_peticiones} icon={<FiClock />} colorClass="#3b82f6"/>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Análisis por Tipo de Ticket</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                    {/* Columna de Incidencias */}
                    <div className="border-t-4 border-red-400 pt-3">
                        <h4 className="font-bold text-red-500">INCIDENCIAS</h4>
                        <div className="mt-4 space-y-2">
                            <BreakdownListItem label="Abiertas en periodo" value={data.incidencias.abiertas} icon={<FiLogIn />} />
                            <BreakdownListItem label="Cerradas en periodo" value={data.incidencias.cerradas} icon={<FiLogOut />} />
                            <BreakdownListItem label="Media Cierres/Día" value={data.incidencias.media_cierres_dia} icon={<FiActivity />} />
                            <BreakdownListItem label="Pendientes a Fin de Mes" value={data.incidencias.pendientes_fin_mes} icon={<FiArchive />} />
                        </div>
                    </div>
                    {/* Columna de Solicitudes */}
                    <div className="border-t-4 border-blue-400 pt-3 mt-8 md:mt-0">
                        <h4 className="font-bold text-blue-500">SOLICITUDES</h4>
                        <div className="mt-4 space-y-2">
                           <BreakdownListItem label="Abiertas en periodo" value={data.solicitudes.abiertas} icon={<FiLogIn />} />
                           <BreakdownListItem label="Cerradas en periodo" value={data.solicitudes.cerradas} icon={<FiLogOut />} />
                           <BreakdownListItem label="Media Cierres/Día" value={data.solicitudes.media_cierres_dia} icon={<FiActivity />} />
                           <BreakdownListItem label="Pendientes a Fin de Mes" value={data.solicitudes.pendientes_fin_mes} icon={<FiArchive />} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Origen de los Tickets</h3>
                {data.origen.length > 0 ? (
                    <div className="space-y-4">
                        {data.origen.map((source, index) => (
                            <SourceProgressBar 
                                key={source.nombre} 
                                name={source.nombre} 
                                value={source.total} 
                                total={totalOrigen}
                                color={COLORS[index % COLORS.length]}
                            />
                        ))}
                    </div>
                ) : <EmptyState message="No hay datos de origen para mostrar." icon={<FiInfo />} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KpiPage;