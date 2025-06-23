import React, { useState, useMemo } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, Sector
} from 'recharts';

const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const {
    cx, cy, midAngle, innerRadius, outerRadius,
    startAngle, endAngle, fill, payload, percent, value
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <Sector
        cx={cx} cy={cy}
        innerRadius={innerRadius} outerRadius={outerRadius}
        startAngle={startAngle} endAngle={endAngle}
        fill={fill}
        style={{ filter: 'drop-shadow(0 0 5px rgba(0,0,0,0.2))' }}
      />
      <Sector
        cx={cx} cy={cy}
        startAngle={startAngle} endAngle={endAngle}
        innerRadius={outerRadius + 6} outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={3} fill={fill} />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        className="font-semibold"
        fill="#333"
      >
        {`${value} tickets`}
      </text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill="#666"
      >
        {`(${(percent * 100).toFixed(1)}%)`}
      </text>
    </g>
  );
};

const StatusDonutChart = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const { chartData, total } = useMemo(() => {
    const arr = [
      { name: 'No Asignadas', value: data.total_no_asignada || 0 },
      { name: 'Asignadas',    value: data.total_asignada    || 0 },
      { name: 'En Proceso',   value: data.total_en_proceso  || 0 },
      { name: 'En Espera',    value: data.total_en_espera   || 0 },
    ].filter(item => item.value > 0);
    return {
      chartData: arr,
      total: arr.reduce((sum, x) => sum + x.value, 0)
    };
  }, [data]);

  const COLORS = ['#EF4444', '#F97316', '#3B82F6', '#14B8A6'];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          cx="50%" cy="50%"
          innerRadius={60} outerRadius={80}
          activeIndex={activeIndex}
          activeShape={renderActiveShape}
          onMouseEnter={(_, idx) => setActiveIndex(idx)}
          paddingAngle={4}
          isAnimationActive
          animationDuration={800}
          labelLine={false}
          label={({ cx, cy }) => (
            <text
              x={cx} y={cy} dy={8}
              textAnchor="middle"
              className="text-2xl font-bold text-gray-800"
            >
              {total}
            </text>
          )}
        >
          {chartData.map((entry, idx) => (
            <Cell
              key={idx}
              fill={COLORS[idx % COLORS.length]}
              style={{
                opacity: idx === activeIndex ? 1 : 0.6,
                transition: 'opacity 0.3s',
                filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.1))'
              }}
            />
          ))}
        </Pie>

        <Tooltip
          formatter={value => [`${value} tickets`, '']}
          contentStyle={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
        />

        <Legend
          verticalAlign="bottom"
          layout="horizontal"
          iconType="circle"
          wrapperStyle={{ paddingTop: 16 }}
          onClick={e => {
            const idx = chartData.findIndex(item => item.name === e.value);
            if (idx >= 0) setActiveIndex(idx);
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default StatusDonutChart;
