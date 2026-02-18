import React from 'react';
import { TrendingUp, Users, DollarSign, Target } from 'lucide-react';
import type { SimulationMetrics } from '../../types';

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
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Live Metrics</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {metricItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={20} className={item.color} />
                <span className="text-sm text-gray-400">{item.label}</span>
              </div>
              <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
