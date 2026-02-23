import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MetricsPanel } from './MetricsPanel';
import type { SimulationMetrics } from '../types';

describe('MetricsPanel', () => {
  const defaultMetrics: SimulationMetrics = {
    visitors: 2000,
    bookings: 75,
    revenue: 18750,
    profit: 3625,
    roi: 36.25,
    loyalCustomers: 22,
  };

  it('should render all metric labels', () => {
    render(<MetricsPanel metrics={defaultMetrics} />);

    expect(screen.getByText('Visitors')).toBeInTheDocument();
    expect(screen.getByText('Bookings')).toBeInTheDocument();
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('Profit')).toBeInTheDocument();
    expect(screen.getByText('ROI')).toBeInTheDocument();
    expect(screen.getByText('Loyal Customers')).toBeInTheDocument();
  });

  it('should display formatted numeric values', () => {
    render(<MetricsPanel metrics={defaultMetrics} />);

    expect(screen.getByText('2,000')).toBeInTheDocument();
    expect(screen.getByText('75')).toBeInTheDocument();
    expect(screen.getByText('$18,750')).toBeInTheDocument();
    expect(screen.getByText('$3,625')).toBeInTheDocument();
    expect(screen.getByText('36.25%')).toBeInTheDocument();
    expect(screen.getByText('22')).toBeInTheDocument();
  });

  it('should display zero values correctly', () => {
    const zeroMetrics: SimulationMetrics = {
      visitors: 0,
      bookings: 0,
      revenue: 0,
      profit: 0,
      roi: 0,
      loyalCustomers: 0,
    };

    render(<MetricsPanel metrics={zeroMetrics} />);

    // Multiple metrics show 0 (visitors, bookings, loyal customers)
    expect(screen.getAllByText('0').length).toBeGreaterThan(0);
    // Revenue and Profit both show $0
    expect(screen.getAllByText('$0').length).toBe(2);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('should display negative profit correctly', () => {
    const lossMetrics: SimulationMetrics = {
      ...defaultMetrics,
      profit: -1500,
      roi: -15,
    };

    render(<MetricsPanel metrics={lossMetrics} />);

    expect(screen.getByText('$-1,500')).toBeInTheDocument();
    expect(screen.getByText('-15%')).toBeInTheDocument();
  });
});
