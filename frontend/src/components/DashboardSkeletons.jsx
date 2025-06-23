import React from 'react';

// Esqueleto para una tarjeta de KPI individual
const StatCardSkeleton = () => (
  <div className="bg-white p-5 rounded-xl shadow-sm">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
    <div className="h-8 bg-gray-300 rounded w-1/2"></div>
  </div>
);

// Esqueleto para una tarjeta de técnico individual
const TechnicianCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
    <div className="p-4 bg-gray-50 border-b flex items-center gap-4">
      <div className="w-16 h-16 rounded-full bg-gray-200"></div>
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-gray-300 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
    <div className="grid grid-cols-4 gap-1 p-3">
      <div className="flex flex-col items-center p-2 space-y-2">
        <div className="w-8 h-8 rounded-full bg-gray-200"></div>
        <div className="h-3 bg-gray-200 rounded w-10"></div>
      </div>
       <div className="flex flex-col items-center p-2 space-y-2">
        <div className="w-8 h-8 rounded-full bg-gray-200"></div>
        <div className="h-3 bg-gray-200 rounded w-10"></div>
      </div>
       <div className="flex flex-col items-center p-2 space-y-2">
        <div className="w-8 h-8 rounded-full bg-gray-200"></div>
        <div className="h-3 bg-gray-200 rounded w-10"></div>
      </div>
       <div className="flex flex-col items-center p-2 space-y-2">
        <div className="w-8 h-8 rounded-full bg-gray-200"></div>
        <div className="h-3 bg-gray-200 rounded w-10"></div>
      </div>
    </div>
  </div>
);


export const DashboardSkeletons = () => (
  <>
    <div>
      <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {Array.from({ length: 8 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
    </div>
    <div>
      <div className="h-6 bg-gray-200 rounded w-1/4 mb-4 mt-8"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => <TechnicianCardSkeleton key={i} />)}
      </div>
    </div>
  </>
);