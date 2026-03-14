import React from 'react';
import { TrendingUp, Users, DollarSign, Target, Star, BarChart2 } from 'lucide-react';
import type { SimulationMetrics } from '../types';

interface MetricsPanelProps {
  metrics: SimulationMetrics;
}

const metricConfig = [
  {
    key: 'visitors' as const,
    label: 'Visitors',
    icon: Users,
    color: 'var(--color-metric-blue)',
    bg: 'var(--color-metric-blue-bg)',
    format: (v: number) => v.toLocaleString(),
  },
  {
    key: 'bookings' as const,
    label: 'Bookings',
    icon: Target,
    color: 'var(--color-metric-green)',
    bg: 'var(--color-metric-green-bg)',
    format: (v: number) => v.toLocaleString(),
  },
  {
    key: 'revenue' as const,
    label: 'Revenue',
    icon: DollarSign,
    color: 'var(--color-metric-yellow)',
    bg: 'var(--color-metric-yellow-bg)',
    format: (v: number) => `$${v.toLocaleString()}`,
  },
  {
    key: 'profit' as const,
    label: 'Profit',
    icon: TrendingUp,
    color: 'var(--color-metric-purple)',
    bg: 'var(--color-metric-purple-bg)',
    format: (v: number) => `$${v.toLocaleString()}`,
  },
  {
    key: 'roi' as const,
    label: 'ROI',
    icon: BarChart2,
    color: 'var(--color-metric-pink)',
    bg: 'var(--color-metric-pink-bg)',
    format: (v: number) => `${v}%`,
  },
  {
    key: 'loyalCustomers' as const,
    label: 'Loyal Customers',
    icon: Star,
    color: 'var(--color-metric-indigo)',
    bg: 'var(--color-metric-indigo-bg)',
    format: (v: number) => v.toLocaleString(),
  },
];

export const MetricsPanel: React.FC<MetricsPanelProps> = ({ metrics }) => {
  const allZero = metricConfig.every((m) => metrics[m.key] === 0);

  return (
    <div
      style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        padding: 'var(--space-4) var(--space-5)',
        display: 'flex',
        alignItems: 'stretch',
        gap: 0,
      }}
    >
      {metricConfig.map((item, index) => {
        const Icon = item.icon;
        const value = metrics[item.key];
        const isEmpty = allZero;

        return (
          <React.Fragment key={item.label}>
            {/* Metric cell */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-1)',
                padding: '0 var(--space-4)',
              }}
            >
              {/* Label row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-1)',
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    background: item.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={10} style={{ color: item.color }} />
                </div>
                <span className="text-metric-label">{item.label}</span>
              </div>

              {/* Value */}
              <div
                className="text-metric-value"
                style={{
                  color: isEmpty ? 'var(--color-text-tertiary)' : item.color,
                  transition: 'color 200ms ease',
                }}
              >
                {isEmpty ? '—' : item.format(value)}
              </div>
            </div>

            {/* Vertical divider between cells */}
            {index < metricConfig.length - 1 && (
              <div
                style={{
                  width: 1,
                  background: 'var(--color-border-muted)',
                  alignSelf: 'stretch',
                  flexShrink: 0,
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
