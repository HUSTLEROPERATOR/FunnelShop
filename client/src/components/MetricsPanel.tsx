import React from 'react';
import { TrendingUp, Users, DollarSign, Target } from 'lucide-react';
import type { SimulationMetrics } from '../types';

interface MetricsPanelProps {
  metrics: SimulationMetrics;
}

// Helper function to format large numbers
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toLocaleString();
};

// Helper function to format currency
const formatCurrency = (num: number): string => {
  if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `$${(num / 1000).toFixed(1)}K`;
  }
  return `$${num.toLocaleString()}`;
};

export const MetricsPanel: React.FC<MetricsPanelProps> = ({ metrics }) => {
  const metricItems = [
    { 
      label: 'Visitors', 
      value: formatNumber(metrics.visitors), 
      icon: Users, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    { 
      label: 'Bookings', 
      value: formatNumber(metrics.bookings), 
      icon: Target, 
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    { 
      label: 'Revenue', 
      value: formatCurrency(metrics.revenue), 
      icon: DollarSign, 
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    { 
      label: 'Profit', 
      value: formatCurrency(metrics.profit), 
      icon: TrendingUp, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    { 
      label: 'ROI', 
      value: `${metrics.roi}%`, 
      icon: TrendingUp, 
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
    },
    { 
      label: 'Loyal Customers', 
      value: formatNumber(metrics.loyalCustomers), 
      icon: Users, 
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {metricItems.map((item) => {
        const Icon = item.icon;
        return (
          <div 
            key={item.label} 
            className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 rounded-md ${item.bgColor}`}>
                <Icon size={14} className={item.color} />
              </div>
              <span className="text-xs font-medium text-gray-600">{item.label}</span>
            </div>
            <div className={`text-lg font-bold ${item.color}`}>{item.value}</div>
          </div>
        );
      })}
    </div>
  );
};
