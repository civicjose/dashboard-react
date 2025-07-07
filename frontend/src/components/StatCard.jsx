import React from 'react';

const StatCard = ({ title, value, icon, colorClass = 'text-indigo-600', onClick, variant = 'default' }) => {
  const hasValue = value > 0;

  // Clases base para la tarjeta
  const baseClasses = "bg-white dark:bg-gray-800 rounded-xl shadow-sm text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed";

  // Clases específicas para cada variante
  const variantClasses = {
    default: "p-5",
    compact: "p-4"
  };

  const valueTextClasses = {
    default: "text-4xl",
    compact: "text-3xl"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={!hasValue}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      <div className="flex justify-between items-start">
        <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">{title}</p>
        <div className={`flex-shrink-0 p-2 rounded-lg bg-slate-100 dark:bg-gray-700 ${colorClass}`}>
          {icon}
        </div>
      </div>
      <p className={`font-bold text-gray-900 dark:text-gray-50 mt-2 ${valueTextClasses[variant]}`}>{value ?? '0'}</p>
    </button>
  );
};

export default StatCard;