import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../context/ThemeContext';

const SimpleBarChart = ({ data, xAxisKey, dataKey, fillColor, name }) => {
  const { theme } = useTheme();
  
  // Colores dinámicos basados en el tema
  const tickColor = theme === 'dark' ? '#9CA3AF' : '#6B7280';
  const tooltipBackground = theme === 'dark' ? '#1F2937' : '#FFFFFF';
  const tooltipBorder = theme === 'dark' ? '#374151' : '#E5E7EB';
  const tooltipText = theme === 'dark' ? '#E5E7EB' : '#1F2937';

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={theme === 'dark' ? 0.1 : 0.3} />
          <XAxis dataKey={xAxisKey} tick={{ fontSize: 12, fill: tickColor }} />
          <YAxis tick={{ fontSize: 12, fill: tickColor }} />
          <Tooltip
            cursor={{ fill: 'rgba(79, 70, 229, 0.1)' }}
            contentStyle={{
              backgroundColor: tooltipBackground,
              borderColor: tooltipBorder,
              borderRadius: '0.75rem',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
            }}
            labelStyle={{ color: tickColor, fontWeight: 'bold' }}
            itemStyle={{ color: tooltipText }}
          />
          <Legend wrapperStyle={{ color: tickColor, paddingTop: '10px' }} />
          <Bar dataKey={dataKey} fill={fillColor} name={name} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SimpleBarChart;