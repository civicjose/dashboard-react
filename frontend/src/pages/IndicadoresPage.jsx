import React, { useState, useEffect, useMemo } from 'react';
import { apiService } from '../services/apiService';
import StatCard from '../components/StatCard';
import SimpleBarChart from '../components/SimpleBarChart';
import { FiCalendar, FiClock, FiAlertCircle, FiCheckCircle, FiUsers, FiRefreshCw, FiInfo, FiBarChart2, FiTag, FiClipboard, FiSearch } from 'react-icons/fi';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';


const SectionTitle = ({ children, icon }) => (
    <div className="flex items-center mt-8 mb-4">
        {icon && React.cloneElement(icon, { className: 'mr-3 text-gray-400' })}
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{children}</h3>
        <div className="flex-grow ml-4 border-t border-gray-200 dark:border-gray-700"></div>
    </div>
);

const DataBar = ({ percent }) => {
    const barColor = percent < 10 ? 'bg-red-500' : percent < 30 ? 'bg-yellow-500' : 'bg-indigo-500';
    return (
        <div 
            className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2"
            data-tooltip-id="app-tooltip"
            data-tooltip-content={`${percent.toFixed(1)}%`}
            data-tooltip-place="top"
        >
            <div className={`${barColor} h-2 rounded-full`} style={{ width: `${percent}%` }}></div>
        </div>
    );
};

const EmptyState = ({ message, icon }) => (
    <div className="text-center p-10 bg-gray-50 dark:bg-gray-800/50 rounded-lg h-full flex flex-col justify-center items-center">
        {React.cloneElement(icon, { size: 32, className: "text-gray-400 mb-4" })}
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{message}</p>
    </div>
);

// CORRECCIÓN: El componente DataTable que faltaba se añade aquí.
const DataTable = ({ title, headers, data, renderRow, onToggleShowAll, showAll, icon, children }) => {
    const hasData = data && data.length > 0;
    const isExpandable = hasData && data.length > 10;
    const visibleData = hasData ? (showAll ? data : data.slice(0, 10)) : [];
  
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg h-full flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-2">
                {icon} {title}
            </h3>
            {children}
        </div>

        {!hasData ? (
          <div className='flex-grow p-4'><EmptyState message={`No hay datos para mostrar.`} icon={<FiInfo />} /></div>
        ) : (
          <div className="overflow-y-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0">
                <tr>{headers.map((header, index) => <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{header}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">{visibleData.map(renderRow)}</tbody>
            </table>
          </div>
        )}
        {isExpandable && (
          <div className="p-3 text-center border-t border-gray-200 dark:border-gray-700 mt-auto">
            <button onClick={onToggleShowAll} className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold hover:underline">
              {showAll ? 'Ver menos' : `Ver los ${data.length - 10} restantes...`}
            </button>
          </div>
        )}
      </div>
    );
};

const IndicadoresPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [showAll, setShowAll] = useState({
        tecnicos: false,
        categorias: false,
        etiquetas: false,
    });

    const [tableSearchTerms, setTableSearchTerms] = useState({
        tecnicos: '',
        categorias: '',
        etiquetas: '',
    });
  
    const [filters, setFilters] = useState(() => {
        const today = new Date();
        const lastWeek = new Date();
        lastWeek.setDate(today.getDate() - 7);
        return {
          desde: lastWeek.toISOString().split('T')[0],
          hasta: today.toISOString().split('T')[0],
          perfil: 'all',
        };
    });
    
    const fetchData = async () => {
        setLoading(true);
        setError('');
        setData(null);
        try {
          const response = await apiService.getIndicadores(filters);
          setData(response.data);
        } catch (err) {
          setError('No se pudieron cargar los datos. Revisa las fechas y vuelve a intentarlo.');
          console.error(err);
        } finally {
          setLoading(false);
        }
    };
  
    useEffect(() => {
        fetchData();
    }, []);
  
    const handleFilterChange = (e) => { setFilters({ ...filters, [e.target.name]: e.target.value }); };
    const handleProfileChange = (profile) => { setFilters({ ...filters, perfil: profile }); };
    const handlePresetChange = (preset) => { const today = new Date(); let desde = new Date(); let hasta = new Date(today); switch(preset) { case 'hoy': break; case 'ayer': desde.setDate(today.getDate() - 1); hasta.setDate(today.getDate() - 1); break; case 'semana': const firstDayOfWeek = today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1); desde.setDate(firstDayOfWeek); break; case 'mes': desde.setDate(1); break; default: return; } setFilters(prev => ({...prev, desde: desde.toISOString().split('T')[0], hasta: hasta.toISOString().split('T')[0]})); };
    const handleSubmit = (e) => { e.preventDefault(); fetchData(); };
    const toggleShowAll = (key) => { setShowAll(prev => ({ ...prev, [key]: !prev[key] })); };

    const handleSearchChange = (table, value) => {
        setTableSearchTerms(prev => ({ ...prev, [table]: value }));
    };
  
    const useFilteredData = (dataKey, tableKey) => useMemo(() => {
        if (!data?.[dataKey]) return [];
        const searchTerm = tableSearchTerms[tableKey].toLowerCase();
        return data[dataKey].filter(item => 
          (item.firstname ? `${item.firstname} ${item.realname}` : item.nombre)
          .toLowerCase().includes(searchTerm)
        );
    }, [data, tableSearchTerms]);

    const filteredTecnicos = useFilteredData('resueltosPorTecnico', 'tecnicos');
    const filteredCategorias = useFilteredData('porCategoria', 'categorias');
    const filteredEtiquetas = useFilteredData('porEtiqueta', 'etiquetas');

    const useTotal = (dataKey) => useMemo(() => { if (!data?.[dataKey]) return 0; return data[dataKey].reduce((sum, item) => sum + item.total, 0); }, [data]);
    const totalResueltosPorTecnico = useTotal('resueltosPorTecnico');
    const totalPorCategoria = useTotal('porCategoria');
    const totalPorEtiqueta = useTotal('porEtiqueta');
  
    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Indicadores de Rendimiento</h1>
                <p className="mt-1 text-gray-500 dark:text-gray-400">Análisis detallado de la actividad del soporte.</p>
            </header>
    
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg space-y-4">
                <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row items-center gap-4">
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                        <div className="w-full">
                            <label htmlFor="desde" className="text-sm font-medium text-gray-700 dark:text-gray-300">Desde</label>
                            <input type="date" name="desde" id="desde" value={filters.desde} onChange={handleFilterChange} className="mt-1 block w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md shadow-sm p-2"/>
                        </div>
                        <div className="w-full">
                            <label htmlFor="hasta" className="text-sm font-medium text-gray-700 dark:text-gray-300">Hasta</label>
                            <input type="date" name="hasta" id="hasta" value={filters.hasta} onChange={handleFilterChange} className="mt-1 block w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md shadow-sm p-2"/>
                        </div>
                    </div>
                    <div className="w-full sm:w-auto">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Perfil</label>
                        <div className="mt-1 flex space-x-1 bg-gray-200 dark:bg-gray-700 p-1 rounded-full">
                            {['all', 'l1', 'l2'].map(p => (<button type="button" key={p} onClick={() => handleProfileChange(p)} className={`px-5 py-1.5 text-sm font-semibold rounded-full ${ filters.perfil === p ? 'bg-white dark:bg-gray-900 text-indigo-700 dark:text-indigo-400 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-600'}`}>{p === 'all' ? 'Todos' : p.toUpperCase()}</button>))}
                        </div>
                    </div>
                    <div className="flex-grow" />
                    <div className="w-full sm:w-auto">
                        <button type="submit" disabled={loading} className="w-full py-2.5 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed">
                        {loading ? 'Consultando...' : 'Consultar'}
                        </button>
                    </div>
                </form>
                <div className="flex items-center justify-start flex-wrap gap-2 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 mr-2">Rangos rápidos:</span>
                    {['hoy', 'ayer', 'semana', 'mes'].map(preset => (<button key={preset} type="button" onClick={() => handlePresetChange(preset)} className="px-3 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/50 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-900">{preset.charAt(0).toUpperCase() + preset.slice(1)}</button>))}
                </div>
            </div>
    
            {loading && <div className="text-center text-gray-500 dark:text-gray-400 py-10">Cargando...</div>}
            {error && <div className="text-center text-red-500 bg-red-100 dark:bg-red-900/20 dark:text-red-400 p-4 rounded-lg">{error}</div>}
            
            {data && !loading && (
                <div className="space-y-6">
                    <SectionTitle icon={<FiBarChart2 size={20}/>}>Resumen General</SectionTitle>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard title="Creados" value={data.statsTickets.creados_total} icon={<FiCalendar size={20}/>} />
                        <StatCard title="Resueltos" value={data.statsTickets.resueltos_total} icon={<FiCheckCircle size={20}/>} colorClass="text-green-500" />
                        <StatCard title="T.M. Global" value={data.tiempos.tiempo_medio_total} icon={<FiClock size={20}/>} colorClass="text-purple-500" />
                        <StatCard title="Reabiertos" value={data.reabiertos.length} icon={<FiRefreshCw size={20}/>} colorClass="text-orange-500" />
                    </div>

                    <SectionTitle icon={<FiUsers size={20}/>}>Productividad y Rendimiento</SectionTitle>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Resueltos por Técnico</h3>
                            <div className="h-96">
                                <SimpleBarChart data={filteredTecnicos} xAxisKey="firstname" dataKey="total" fillColor="#4f46e5" name="Tickets Resueltos"/>
                            </div>
                        </div>
                        <div className="lg:col-span-1">
                            <DataTable title="Desglose por Técnico" icon={<FiUsers/>} headers={['Técnico', 'Total', '%']} data={filteredTecnicos} showAll={showAll.tecnicos} onToggleShowAll={() => toggleShowAll('tecnicos')}
                                renderRow={(tec) => {
                                const percent = totalResueltosPorTecnico > 0 ? ((tec.total / totalResueltosPorTecnico) * 100) : 0;
                                return ( <tr key={tec.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50"> <td className="px-6 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{tec.firstname}</td> <td className="px-6 py-3 text-sm text-center text-gray-500 dark:text-gray-300">{tec.total}</td> <td className="px-6 py-3 text-sm w-1/4"><DataBar percent={percent}/></td> </tr> )
                                }}
                            >
                                <div className="relative"><div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><FiSearch className="h-5 w-5 text-gray-400" /></div><input type="text" placeholder="Filtrar técnico..." value={tableSearchTerms.tecnicos} onChange={(e) => handleSearchChange('tecnicos', e.target.value)} className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 pl-10 p-2 text-sm text-gray-800 dark:text-gray-200"/></div>
                            </DataTable>
                        </div>
                    </div>
          
                    <SectionTitle icon={<FiClipboard size={20}/>}>Análisis de Clasificación</SectionTitle>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                        <DataTable icon={<FiClipboard/>} title="Desglose por Categoría" headers={['Categoría', 'Total', '%']} data={filteredCategorias} showAll={showAll.categorias} onToggleShowAll={() => toggleShowAll('categorias')}
                            renderRow={(cat) => {
                                const percent = totalPorCategoria > 0 ? (cat.total / totalPorCategoria) * 100 : 0;
                                return ( <tr key={cat.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50"><td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{cat.nombre || 'Sin categoría'}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-300">{cat.total}</td><td className="px-6 py-4 whitespace-nowrap text-sm w-1/3"><DataBar percent={percent}/></td></tr> )
                            }}
                        >
                             <div className="relative"><div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><FiSearch className="h-5 w-5 text-gray-400" /></div><input type="text" placeholder="Filtrar categoría..." value={tableSearchTerms.categorias} onChange={(e) => handleSearchChange('categorias', e.target.value)} className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 pl-10 p-2 text-sm text-gray-800 dark:text-gray-200"/></div>
                        </DataTable>
                        <DataTable icon={<FiTag/>} title="Desglose por Etiqueta" headers={['Etiqueta', 'Total', '%']} data={filteredEtiquetas} showAll={showAll.etiquetas} onToggleShowAll={() => toggleShowAll('etiquetas')}
                            renderRow={(tag) => {
                                const percent = totalPorEtiqueta > 0 ? (tag.total / totalPorEtiqueta) * 100 : 0;
                                return ( <tr key={tag.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50"><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{tag.nombre || 'Sin etiqueta'}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500 dark:text-gray-300">{tag.total}</td><td className="px-6 py-4 whitespace-nowrap text-sm w-1/3"><DataBar percent={percent}/></td></tr> )
                            }}
                        >
                            <div className="relative"><div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><FiSearch className="h-5 w-5 text-gray-400" /></div><input type="text" placeholder="Filtrar etiqueta..." value={tableSearchTerms.etiquetas} onChange={(e) => handleSearchChange('etiquetas', e.target.value)} className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 pl-10 p-2 text-sm text-gray-800 dark:text-gray-200"/></div>
                        </DataTable>
                    </div>
                </div>
            )}
        </div>
    );
};
  
export default IndicadoresPage;