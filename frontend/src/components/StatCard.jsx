import React from 'react';

const StatCard = ({ title, value, icon, colorClass = 'text-indigo-600', link = '#' }) => (
  <a
    href={link}
    target="_blank"
    rel="noopener noreferrer"
    className="bg-white p-5 rounded-xl shadow-sm flex flex-col justify-between transition-transform transform hover:-translate-y-1 duration-300 h-full"
  >
    <div className="flex justify-between items-start">
      <p className="text-sm font-semibold text-gray-600">{title}</p>
      <div className={`flex-shrink-0 p-2 rounded-lg bg-slate-100 ${colorClass}`}>
        {icon}
      </div>
    </div>
    <p className="text-4xl font-bold text-gray-900 mt-2">{value ?? '0'}</p>
  </a>
);

export default StatCard;
