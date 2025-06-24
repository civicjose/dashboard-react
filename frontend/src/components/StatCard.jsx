import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, Tooltip, ResponsiveContainer } from 'recharts';

// El hook para la animación no necesita cambios
const useCountUp = (endValue, duration = 1500) => {
  const [count, setCount] = useState('0');
  const frameRef = useRef(null);
  
  const parsedEndValue = parseInt(endValue, 10);
  
  // Si el valor no es un número válido, simplemente no hacemos nada.
  if (isNaN(parsedEndValue)) {
    return endValue;
  }

  useEffect(() => {
    let startTime = null;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const current = Math.min(Math.floor(progress / duration * parsedEndValue), parsedEndValue);
      setCount(current.toLocaleString('es-ES'));

      if (progress < duration) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [parsedEndValue, duration]);

  return count;
};

// El tooltip del gráfico tampoco cambia
const CustomTrendTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const value = data.creados ?? data.resueltos ?? 0;
    const date = new Date(data.dia).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    return (
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-2 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{date}: <span className="text-indigo-600 dark:text-indigo-400">{value}</span></p>
      </div>
    );
  }
  return null;
};


const StatCard = ({ title, value, icon, colorClass = 'text-gray-600', trendData = [] }) => {
  
  // --- INICIO DE LA CORRECCIÓN ---

  // 1. Verificamos si el valor es puramente numérico.
  //    La expresión regular /^\d+$/ comprueba si el string contiene solo dígitos.
  const isAnimatable = /^\d+$/.test(String(value));
  
  // 2. Solo llamamos al hook de animación si el valor es animable.
  const animatedValue = isAnimatable ? useCountUp(value) : null;
  
  // 3. Decidimos qué valor mostrar: el animado si corresponde, o el original si no.
  const displayValue = isAnimatable ? animatedValue : value;

  // --- FIN DE LA CORRECCIÓN ---

  const trendColor = (() => {
    if (!trendData || trendData.length < 2) return '#9ca3af';
    const first = trendData[0].creados ?? trendData[0].resueltos;
    const last = trendData[trendData.length - 1].creados ?? trendData[trendData.length - 1].resueltos;
    if (last > first) return '#22c55e';
    if (last < first) return '#ef4444';
    return '#9ca3af';
  })();

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg flex flex-col justify-between h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="flex justify-between items-start">
        <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">{title}</p>
        <div className={`flex-shrink-0 p-2 rounded-lg bg-slate-100 dark:bg-gray-700 ${colorClass}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-4xl font-bold text-gray-900 dark:text-gray-50 mt-2">{displayValue ?? '-'}</p>
      </div>
      {trendData && trendData.length > 0 && (
        <div className="h-16 mt-2 -mb-4 -mx-5">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <Tooltip content={<CustomTrendTooltip />} cursor={{ stroke: 'rgba(100, 116, 139, 0.3)', strokeWidth: 2, strokeDasharray: '3 3' }} />
                    <Line 
                        type="monotone" 
                        dataKey={(obj) => obj.creados || obj.resueltos} 
                        stroke={trendColor}
                        strokeWidth={2.5}
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default StatCard;