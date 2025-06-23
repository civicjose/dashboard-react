import React from 'react';

const StatCard = ({ title, value, icon, colorClass = 'text-indigo-600', link = '#' }) => (
  <a
    href={link}
    target="_blank"
    rel="noopener noreferrer"
    // Dark mode: Fondo, sombra y colores de borde
    className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm dark:shadow-md dark:shadow-black/20 flex flex-col justify-between transition-all transform hover:-translate-y-1 duration-300 h-full"
  >
    <div className="flex justify-between items-start">
      {/* Dark mode: Texto del título */}
      <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">{title}</p>
      {/* Dark mode: Fondo del icono */}
      <div className={`flex-shrink-0 p-2 rounded-lg bg-slate-100 dark:bg-gray-700 ${colorClass}`}>
        {icon}
      </div>
    </div>
    {/* Dark mode: Texto del valor principal */}
    <p className="text-4xl font-bold text-gray-900 dark:text-gray-50 mt-2">{value ?? '0'}</p>
  </a>
);

export default StatCard;