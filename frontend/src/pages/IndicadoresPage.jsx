import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import StatCard from '../components/StatCard';
import SimpleBarChart from '../components/SimpleBarChart';

const IndicadoresPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Fechas por defecto: desde hace 7 días hasta hoy
  const today = new Date().toISOString().split('T')[0];
  const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const [dates, setDates] = useState({ desde: lastWeek, hasta: today });

  const handleDateChange = (e) => {
    setDates({ ...dates, [e.target.name]: e.target.value });
  };

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { perfil: 'all', ...dates };
      const response = await apiService.getIndicadores(params);
      setData(response.data);
    } catch (err) {
      setError('No se pudieron cargar los datos. Revisa la consola del backend.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Carga los datos iniciales al entrar en la página
  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Indicadores de Rendimiento</h1>
      
      {/* Formulario de Fechas */}
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-md flex items-center gap-4 flex-wrap">
        <div>
          <label htmlFor="desde" className="block text-sm font-medium text-gray-700">Desde</label>
          <input type="date" name="desde" id="desde" value={dates.desde} onChange={handleDateChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"/>
        </div>
        <div>
          <label htmlFor="hasta" className="block text-sm font-medium text-gray-700">Hasta</label>
          <input type="date" name="hasta" id="hasta" value={dates.hasta} onChange={handleDateChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"/>
        </div>
        <div className="self-end">
          <button type="submit" disabled={loading} className="py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none disabled:bg-indigo-300">
            {loading ? 'Cargando...' : 'Consultar'}
          </button>
        </div>
      </form>

      {/* Estado de Carga y Errores */}
      {loading && <p className="text-center text-gray-500">Cargando datos...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      
      {/* Contenido Principal */}
      {data && !loading && (
        <div className="space-y-8">
          {/* Tarjetas de KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Tickets Creados" value={data.tickets_creados.total_creadas} />
            <StatCard title="Tickets Resueltos" value={data.tickets_resueltos.total_resueltos} color="text-green-600" />
            <StatCard title="Tiempo Medio Resolución" value={data.tiempos_resolucion.tiempo_medio_total} color="text-blue-500" />
            <StatCard title="Tickets Reabiertos" value={data.reabiertos.total_reabiertos} color="text-red-500" />
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold mb-2 text-gray-700 text-center">Tickets por Categoría</h3>
              <SimpleBarChart data={data.por_categoria} xAxisKey="categoria" dataKey="cantidad" fillColor="#8884d8" name="Tickets" />
            </div>
            <div>
              <h3 className="font-bold mb-2 text-gray-700 text-center">Tickets por Etiqueta</h3>
              <SimpleBarChart data={data.por_etiqueta} xAxisKey="etiqueta" dataKey="cantidad" fillColor="#82ca9d" name="Tickets" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndicadoresPage;