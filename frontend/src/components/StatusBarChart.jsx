import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { useTheme } from '../context/ThemeContext';

const StatusBarChart = ({ data }) => {
  const { theme } = useTheme();

  // Colores dinámicos basados en el tema
  const tickColor = theme === 'dark' ? '#9CA3AF' : '#4B5563';
  const labelColor = theme === 'dark' ? '#F9FAFB' : '#1F2937';
  const tooltipBackground = theme === 'dark' ? '#1F2937' : '#FFFFFF';
  const tooltipBorder = theme === 'dark' ? '#374151' : '#E5E7EB';

  const chartData = [
    { name: 'No Asignadas', value: data.total_no_asignada || 0, color: '#EF4444' },
    { name: 'Asignadas', value: data.total_asignada || 0, color: '#F97316' },
    { name: 'En Proceso', value: data.total_en_proceso || 0, color: '#3B82F6' },
    { name: 'En Espera', value: data.total_en_espera || 0, color: '#14B8A6' },
  ].filter(item => item.value >= 0); // Filtramos para evitar errores si un valor es null

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm w-full h-full flex flex-col">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Distribución de Tickets Activos</h3>
      <div className="flex-grow w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData} 
            layout="vertical" 
            margin={{ top: 5, right: 35, left: 10, bottom: 5 }}
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
              cursor={{ fill: theme === 'dark' ? 'rgba(75, 85, 99, 0.2)' : '#f9fafb' }}
              contentStyle={{ 
                borderRadius: '0.75rem', 
                backgroundColor: tooltipBackground, 
                borderColor: tooltipBorder,
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
              }}
              formatter={(value, name) => [`${value} tickets`, name]}
            />
            <Bar dataKey="value" barSize={25} radius={[0, 8, 8, 0]}>
              <LabelList 
                dataKey="value" 
                position="right" 
                offset={10} 
                style={{ fontSize: '12px', fill: labelColor, fontWeight: 'bold' }} 
              />
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} opacity={theme === 'dark' ? 1 : 0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatusBarChart;