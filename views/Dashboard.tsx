
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Globe2, Activity, TrendingDown, Layers, Droplets } from 'lucide-react';
import { MOCK_DESTINATIONS } from '../constants';

const Dashboard = () => {
  const chartData = MOCK_DESTINATIONS.map(d => ({
    name: d.name,
    aqi: d.metrics.airQualityAQI,
    noise: d.metrics.noiseDB,
    color: d.status === 'Recommended' ? '#10b981' : d.status === 'Caution Advised' ? '#f59e0b' : '#f43f5e'
  })).sort((a, b) => b.aqi - a.aqi);

  const wasteData = [
    { name: 'Recyclable', value: 400, fill: '#10b981' },
    { name: 'Organic', value: 300, fill: '#3b82f6' },
    { name: 'Glass', value: 300, fill: '#f59e0b' },
    { name: 'Electronic', value: 100, fill: '#ef4444' },
  ];

  return (
    <div className="p-6 space-y-8 pb-32">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Global Sensor Dashboard</h1>
        <p className="text-slate-500">Monitoring raw environmental data. Higher units indicate health and safety risks.</p>
      </header>

      <section className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <Activity className="text-emerald-500" size={24} />
          <div className="text-2xl font-black text-slate-800 dark:text-white">4.2M</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kg Waste Recovered</div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <Droplets className="text-blue-500" size={24} />
          <div className="text-2xl font-black text-slate-800 dark:text-white">840K</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bottles Redeemed</div>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <TrendingDown size={18} className="text-rose-500 rotate-180" />
            Air Quality Comparison (AQI)
          </h2>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lower = Healthier</span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" opacity={0.1} />
              <XAxis type="number" domain={[0, 'dataMax + 20']} hide />
              <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'transparent' }} formatter={(value) => [`${value} AQI`, 'Air Quality']} />
              <Bar dataKey="aqi" radius={[0, 4, 4, 0]} barSize={20}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
        <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
          <Layers size={18} className="text-blue-500" />
          Recovery Composition
        </h2>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="h-48 w-48 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={wasteData} 
                  innerRadius={60} 
                  outerRadius={80} 
                  paddingAngle={5} 
                  dataKey="value"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full">
            {wasteData.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">{item.name}</span>
                <span className="text-xs font-black text-slate-400 ml-auto">{Math.round(item.value/11)}%</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
