import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { useTheme } from '../context/ThemeContext';

// Componente para el Tooltip personalizado
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-3 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
          <p className="font-bold text-gray-800 dark:text-gray-100">{label}: <span style={{color: payload[0].payload.color}}>{payload[0].value}</span></p>
        </div>
      );
    }
    return null;
};


const StatusBarChart = ({ data }) => {
  const { theme } = useTheme();

  // Colores dinámicos basados en el tema para los textos del gráfico
  const tickColor = theme === 'dark' ? '#9CA3AF' : '#4B5563';
  const labelColor = theme === 'dark' ? '#111827' : '#FFFFFF'; // Texto de la etiqueta sobre la barra

  const chartData = [
    { name: 'No Asig.', value: data.total_no_asignada || 0, color: '#EF4444' },
    { name: 'Asignadas', value: data.total_asignada || 0, color: '#F97316' },
    { name: 'En Proceso', value: data.total_en_proceso || 0, color: '#3B82F6' },
    { name: 'En Espera', value: data.total_en_espera || 0, color: '#14B8A6' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm w-full h-full flex flex-col">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Tickets por Estado</h3>
      <div className="flex-grow w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData} 
            layout="vertical" 
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
          >
            <XAxis type="number" hide />
            <YAxis 
              type="category" 
              dataKey="name" 
              tickLine={false} 
              axisLine={false} 
              tick={{ fontSize: 12, fill: tickColor }}
              width={80}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f9fafb' }}
            />
            <Bar dataKey="value" name="Tickets" barSize={30} radius={[0, 8, 8, 0]}>
              {/* Etiqueta de datos sobre cada barra */}
              <LabelList 
                dataKey="value" 
                position="insideRight" 
                offset={-10}
                style={{ fill: labelColor, fontSize: '12px', fontWeight: 'bold' }} 
              />
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} opacity={0.9} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatusBarChart;