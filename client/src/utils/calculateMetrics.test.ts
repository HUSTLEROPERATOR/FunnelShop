import { describe, it, expect } from 'vitest';
import { calculateMetrics } from './calculateMetrics';
import type { FunnelComponent, GlobalParameters } from '../types';

describe('calculateMetrics', () => {
  const defaultGlobalParams: GlobalParameters = {
    monthlyBudget: 10000,
    averageCheckSize: 50,
    customerLifetimeVisits: 5,
    profitMargin: 0.3,
  };

  it('should calculate metrics for empty components', () => {
    const metrics = calculateMetrics([], defaultGlobalParams);
    
    expect(metrics.visitors).toBe(0);
    expect(metrics.bookings).toBe(0);
    expect(metrics.revenue).toBe(0);
    expect(metrics.profit).toBe(0);
    expect(metrics.roi).toBe(0);
    expect(metrics.loyalCustomers).toBe(0);
  });

  it('should calculate metrics for Google Ads component', () => {
    const components: FunnelComponent[] = [
      {
        id: '1',
        type: 'google-ads',
        name: 'Google Ads Campaign',
        position: { x: 0, y: 0 },
        properties: {
          cpc: 2.0,
          budget: 4000,
        },
      },
    ];

    const metrics = calculateMetrics(components, defaultGlobalParams);
    
    expect(metrics.visitors).toBe(2000); // 4000 / 2.0
    expect(metrics.bookings).toBeGreaterThan(0);
  });

  it('should calculate metrics for multiple components', () => {
    const components: FunnelComponent[] = [
      {
        id: '1',
        type: 'google-ads',
        name: 'Google Ads',
        position: { x: 0, y: 0 },
        properties: {
          cpc: 2.0,
          budget: 4000,
        },
      },
      {
        id: '2',
        type: 'landing-page',
        name: 'Landing Page',
        position: { x: 100, y: 0 },
        properties: {
          conversionRate: 0.2,
        },
      },
      {
        id: '3',
        type: 'booking-form',
        name: 'Booking Form',
        position: { x: 200, y: 0 },
        properties: {
          conversionRate: 0.3,
        },
      },
    ];

    const metrics = calculateMetrics(components, defaultGlobalParams);
    
    expect(metrics.visitors).toBe(2000);
    expect(metrics.bookings).toBeGreaterThan(0);
    expect(metrics.revenue).toBeGreaterThan(0);
    expect(metrics.profit).toBeLessThan(metrics.revenue);
  });

  it('should calculate ROI correctly', () => {
    const components: FunnelComponent[] = [
      {
        id: '1',
        type: 'google-ads',
        name: 'Google Ads',
        position: { x: 0, y: 0 },
        properties: {
          cpc: 1.0,
          budget: 1000,
        },
      },
      {
        id: '2',
        type: 'landing-page',
        name: 'Landing Page',
        position: { x: 100, y: 0 },
        properties: {
          conversionRate: 0.5,
        },
      },
    ];

    const metrics = calculateMetrics(components, defaultGlobalParams);
    
    expect(metrics.roi).toBeDefined();
    expect(typeof metrics.roi).toBe('number');
    // ROI should be calculated as (profit / totalCost) * 100
    if (metrics.profit > 0) {
      expect(metrics.roi).toBeGreaterThan(0);
    }
  });

  it('should handle components with missing properties', () => {
    const components: FunnelComponent[] = [
      {
        id: '1',
        type: 'google-ads',
        name: 'Google Ads',
        position: { x: 0, y: 0 },
        properties: {},
      },
    ];

    const metrics = calculateMetrics(components, defaultGlobalParams);
    
    // Should use default values
    expect(metrics.visitors).toBeGreaterThan(0);
    expect(metrics).toHaveProperty('bookings');
    expect(metrics).toHaveProperty('revenue');
  });

  it('should calculate loyal customers as 30% of bookings', () => {
    const components: FunnelComponent[] = [
      {
        id: '1',
        type: 'google-ads',
        name: 'Google Ads',
        position: { x: 0, y: 0 },
        properties: {
          cpc: 1.0,
          budget: 5000,
        },
      },
      {
        id: '2',
        type: 'landing-page',
        name: 'Landing Page',
        position: { x: 100, y: 0 },
        properties: {
          conversionRate: 0.1,
        },
      },
    ];

    const metrics = calculateMetrics(components, defaultGlobalParams);
    
    const expectedLoyalCustomers = Math.round(metrics.bookings * 0.3);
    expect(metrics.loyalCustomers).toBe(expectedLoyalCustomers);
  });

  // New edge case tests
  it('should handle negative values by treating them as zero', () => {
    const components: FunnelComponent[] = [
      {
        id: '1',
        type: 'google-ads',
        name: 'Google Ads',
        position: { x: 0, y: 0 },
        properties: {
          cpc: -5.0,
          budget: -1000,
        },
      },
    ];

    const metrics = calculateMetrics(components, defaultGlobalParams);
    
    expect(metrics.visitors).toBe(0);
    expect(metrics.bookings).toBe(0);
  });

  it('should handle conversion rates greater than 1 by capping at 1', () => {
    const components: FunnelComponent[] = [
      {
        id: '1',
        type: 'google-ads',
        name: 'Google Ads',
        position: { x: 0, y: 0 },
        properties: {
          cpc: 1.0,
          budget: 1000,
        },
      },
      {
        id: '2',
        type: 'landing-page',
        name: 'Landing Page',
        position: { x: 100, y: 0 },
        properties: {
          conversionRate: 2.5, // Invalid: greater than 100%
        },
      },
    ];

    const metrics = calculateMetrics(components, defaultGlobalParams);
    
    // Should cap conversion rate, so bookings should be reasonable
    expect(metrics.bookings).toBeLessThanOrEqual(metrics.visitors);
  });

  it('should handle invalid global parameters gracefully', () => {
    const invalidGlobalParams: GlobalParameters = {
      monthlyBudget: -10000,
      averageCheckSize: -50,
      customerLifetimeVisits: -5,
      profitMargin: -0.3,
    };

    const components: FunnelComponent[] = [
      {
        id: '1',
        type: 'google-ads',
        name: 'Google Ads',
        position: { x: 0, y: 0 },
        properties: {
          cpc: 1.0,
          budget: 1000,
        },
      },
    ];

    const metrics = calculateMetrics(components, invalidGlobalParams);
    
    // Should return zeros for invalid global params
    expect(metrics.visitors).toBe(0);
    expect(metrics.bookings).toBe(0);
    expect(metrics.revenue).toBe(0);
    expect(metrics.profit).toBe(0);
  });

  it('should handle division by zero in CPC', () => {
    const components: FunnelComponent[] = [
      {
        id: '1',
        type: 'google-ads',
        name: 'Google Ads',
        position: { x: 0, y: 0 },
        properties: {
          cpc: 0,
          budget: 1000,
        },
      },
    ];

    const metrics = calculateMetrics(components, defaultGlobalParams);
    
    expect(metrics.visitors).toBe(0);
    expect(Number.isFinite(metrics.visitors)).toBe(true);
  });

  it('should handle email campaign correctly', () => {
    const components: FunnelComponent[] = [
      {
        id: '1',
        type: 'email-campaign',
        name: 'Email Campaign',
        position: { x: 0, y: 0 },
        properties: {
          recipients: 5000,
          clickThroughRate: 0.1,
          cost: 200,
        },
      },
    ];

    const metrics = calculateMetrics(components, defaultGlobalParams);
    
    expect(metrics.visitors).toBe(500); // 5000 * 0.1
    expect(metrics.bookings).toBeGreaterThan(0);
  });
});
