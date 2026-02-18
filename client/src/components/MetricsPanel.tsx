import React from 'react';
import { TrendingUp, Users, DollarSign, Target } from 'lucide-react';
import type { SimulationMetrics } from '../types';

interface MetricsPanelProps {
  metrics: SimulationMetrics;
}

export const MetricsPanel: React.FC<MetricsPanelProps> = ({ metrics }) => {
  const metricItems = [
    { label: 'Visitors', value: metrics.visitors.toLocaleString(), icon: Users, color: 'var(--color-metric-blue)', bg: 'var(--color-metric-blue-bg)' },
    { label: 'Bookings', value: metrics.bookings.toLocaleString(), icon: Target, color: 'var(--color-metric-green)', bg: 'var(--color-metric-green-bg)' },
    { label: 'Revenue', value: `$${metrics.revenue.toLocaleString()}`, icon: DollarSign, color: 'var(--color-metric-yellow)', bg: 'var(--color-metric-yellow-bg)' },
    { label: 'Profit', value: `$${metrics.profit.toLocaleString()}`, icon: TrendingUp, color: 'var(--color-metric-purple)', bg: 'var(--color-metric-purple-bg)' },
    { label: 'ROI', value: `${metrics.roi}%`, icon: TrendingUp, color: 'var(--color-metric-pink)', bg: 'var(--color-metric-pink-bg)' },
    { label: 'Loyal Customers', value: metrics.loyalCustomers.toLocaleString(), icon: Users, color: 'var(--color-metric-indigo)', bg: 'var(--color-metric-indigo-bg)' },
  ];

  return (
    <div
      className="surface-raised"
      style={{ padding: 'var(--space-5)' }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: 'var(--space-3)',
        }}
      >
        {metricItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              style={{
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-md)',
                background: item.bg,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  marginBottom: 'var(--space-2)',
                }}
              >
                <Icon size={14} style={{ color: item.color, opacity: 0.7 }} />
                <span className="text-metric-label">{item.label}</span>
              </div>
              <div
                className="text-metric-value"
                style={{ color: item.color }}
              >
                {item.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
