import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Componente para el Tooltip personalizado
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-900 p-3 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
        <p className="font-bold text-gray-800 dark:text-gray-100">{`${label}`}</p>
        <p className="text-sm text-indigo-600 dark:text-indigo-400">{`Total: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const SimpleBarChart = ({ data, xAxisKey, dataKey, fillColor, name }) => {
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          {/* Definición del degradado de color para las barras */}
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={fillColor} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={fillColor} stopOpacity={0.4}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
          <XAxis dataKey={xAxisKey} tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          {/* Usamos nuestro tooltip personalizado */}
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(79, 70, 229, 0.1)' }}/>
          <Legend />
          {/* Aplicamos el degradado a las barras usando su ID */}
          <Bar dataKey={dataKey} fill="url(#colorUv)" name={name} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SimpleBarChart;