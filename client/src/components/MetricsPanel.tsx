import React from 'react';
import { TrendingUp, Users, DollarSign, Target } from 'lucide-react';
import type { SimulationMetrics } from '../types';

interface MetricsPanelProps {
  metrics: SimulationMetrics;
}

export const MetricsPanel: React.FC<MetricsPanelProps> = ({ metrics }) => {
  const metricItems = [
    { label: 'Visitors', value: metrics.visitors.toLocaleString(), icon: Users, color: 'text-blue-400' },
    { label: 'Bookings', value: metrics.bookings.toLocaleString(), icon: Target, color: 'text-green-400' },
    { label: 'Revenue', value: `$${metrics.revenue.toLocaleString()}`, icon: DollarSign, color: 'text-yellow-400' },
    { label: 'Profit', value: `$${metrics.profit.toLocaleString()}`, icon: TrendingUp, color: 'text-purple-400' },
    { label: 'ROI', value: `${metrics.roi}%`, icon: TrendingUp, color: 'text-pink-400' },
    { label: 'Loyal Customers', value: metrics.loyalCustomers.toLocaleString(), icon: Users, color: 'text-indigo-400' },
  ];

  return (
    <div className="bg-gray-850/50 border border-gray-800 rounded-surface p-6 shadow-surface">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-5">Live Metrics</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metricItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Icon size={14} className={`${item.color} opacity-60`} />
                <span className="text-xs text-gray-500 font-medium">{item.label}</span>
              </div>
              <div className={`text-2xl font-semibold ${item.color} tracking-tight`}>{item.value}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
