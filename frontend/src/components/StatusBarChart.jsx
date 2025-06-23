import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const StatusBarChart = ({ data }) => {
  const chartData = [
    { name: 'No Asig.', value: data.total_no_asignada || 0, color: '#EF4444' },
    { name: 'Asignadas', value: data.total_asignada || 0, color: '#F97316' },
    { name: 'En Proceso', value: data.total_en_proceso || 0, color: '#3B82F6' },
    { name: 'En Espera', value: data.total_en_espera || 0, color: '#14B8A6' },
  ].filter(item => item.value > 0);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm w-full h-full flex flex-col">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Tickets por Estado</h3>
      <div className="flex-grow w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: '#f3f4f6' }}
              formatter={(value) => [`${value} tickets`]}
            />
            <Bar dataKey="value" barSize={30} radius={[0, 10, 10, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatusBarChart;