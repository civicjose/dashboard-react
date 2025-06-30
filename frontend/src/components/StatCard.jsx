import React from 'react';
import { LineChart, Line, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../context/ThemeContext';

// Tooltip personalizado para el gráfico de tendencia
const CustomTrendTooltip = ({ active, payload, theme }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const value = data.creados ?? data.resueltos ?? 0;
    const date = new Date(data.dia).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

    // Estilos dinámicos para el tooltip
    const background = theme === 'dark' ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)';
    const textColor = theme === 'dark' ? '#E5E7EB' : '#1F2937';

    return (
      <div style={{ backgroundColor: background, borderColor: (theme === 'dark' ? '#4b5563' : '#e5e7eb') }} className="backdrop-blur-sm p-2 rounded-lg shadow-xl border">
        <p style={{ color: textColor }} className="text-sm font-bold">{date}: <span className="text-indigo-500">{value}</span></p>
      </div>
    );
  }
  return null;
};

const StatCard = ({ title, value, icon, colorClass = 'text-gray-600', link, trendData = [] }) => {
  const { theme } = useTheme();

  // Determina el color de la línea de tendencia
  const trendColor = (() => {
    if (!trendData || trendData.length < 2) return '#9ca3af';
    const first = trendData[0]?.creados ?? trendData[0]?.resueltos;
    const last = trendData[trendData.length - 1]?.creados ?? trendData[trendData.length - 1]?.resueltos;
    if (last > first) return '#22c55e'; // Verde para tendencia positiva
    if (last < first) return '#ef4444'; // Rojo para tendencia negativa
    return '#9ca3af'; // Gris para sin cambios
  })();

  const CardContent = () => (
    <>
      <div className="flex justify-between items-start">
        <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">{title}</p>
        <div className={`flex-shrink-0 p-2 rounded-lg bg-slate-100 dark:bg-gray-700 ${colorClass}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-4xl font-bold text-gray-900 dark:text-gray-50 mt-2">{value ?? '-'}</p>
      </div>
      {trendData && trendData.length > 0 && (
        <div className="h-16 mt-2 -mb-4 -mx-5">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <Tooltip content={<CustomTrendTooltip theme={theme} />} cursor={{ stroke: 'rgba(100, 116, 139, 0.3)', strokeWidth: 2, strokeDasharray: '3 3' }} />
                    <Line type="monotone" dataKey={(obj) => obj.creados || obj.resueltos} stroke={trendColor} strokeWidth={2.5} dot={false}/>
                </LineChart>
            </ResponsiveContainer>
        </div>
      )}
    </>
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg flex flex-col justify-between h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer" className="contents">
          <CardContent />
        </a>
      ) : (
        <CardContent />
      )}
    </div>
  );
};

export default StatCard;