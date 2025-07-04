import React from 'react';

const StatCard = ({ title, value, icon, colorClass = 'text-indigo-600', onClick }) => {
  const hasValue = value > 0;
  return (
    <button onClick={onClick} disabled={!hasValue} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed">
      <div className="flex justify-between items-start">
        <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">{title}</p>
        <div className={`flex-shrink-0 p-2 rounded-lg bg-slate-100 dark:bg-gray-700 ${colorClass}`}>{icon}</div>
      </div>
      <p className="text-4xl font-bold text-gray-900 dark:text-gray-50 mt-2">{value ?? '0'}</p>
    </button>
  );
};

export default StatCard;