import { describe, it, expect } from 'vitest';
import { calculateMetrics } from './calculateMetrics';
import type { FunnelComponent, GlobalParameters, Connection } from '../types';

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

  describe('with connections', () => {
    it('should calculate metrics using graph flow when connections exist', () => {
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

      const connections: Connection[] = [
        { id: 'c1', sourceId: '1', targetId: '2' },
        { id: 'c2', sourceId: '2', targetId: '3' },
      ];

      const metrics = calculateMetrics(components, defaultGlobalParams, connections);
      
      expect(metrics.visitors).toBe(2000); // 4000 / 2.0
      // Bookings should be visitors * 0.2 (landing page) * 0.3 (booking form) = 2000 * 0.06 = 120
      expect(metrics.bookings).toBe(120);
      expect(metrics.revenue).toBeGreaterThan(0);
    });

    it('should handle multiple traffic sources in connected graph', () => {
      const components: FunnelComponent[] = [
        {
          id: '1',
          type: 'google-ads',
          name: 'Google Ads',
          position: { x: 0, y: 0 },
          properties: {
            cpc: 2.0,
            budget: 2000,
          },
        },
        {
          id: '2',
          type: 'facebook-ads',
          name: 'Facebook Ads',
          position: { x: 0, y: 100 },
          properties: {
            cpc: 1.5,
            budget: 1500,
          },
        },
        {
          id: '3',
          type: 'landing-page',
          name: 'Landing Page',
          position: { x: 200, y: 50 },
          properties: {
            conversionRate: 0.2,
          },
        },
      ];

      const connections: Connection[] = [
        { id: 'c1', sourceId: '1', targetId: '3' },
        { id: 'c2', sourceId: '2', targetId: '3' },
      ];

      const metrics = calculateMetrics(components, defaultGlobalParams, connections);
      
      // Visitors: (2000/2.0) + (1500/1.5) = 1000 + 1000 = 2000
      expect(metrics.visitors).toBe(2000);
      // Both sources flow to landing page, so bookings = 2000 * 0.2 = 400
      expect(metrics.bookings).toBe(400);
    });

    it('should ignore disconnected components in graph mode', () => {
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
          name: 'Landing Page Connected',
          position: { x: 100, y: 0 },
          properties: {
            conversionRate: 0.5,
          },
        },
        {
          id: '3',
          type: 'landing-page',
          name: 'Landing Page Disconnected',
          position: { x: 100, y: 100 },
          properties: {
            conversionRate: 0.1,
          },
        },
      ];

      const connections: Connection[] = [
        { id: 'c1', sourceId: '1', targetId: '2' },
        // Note: component '3' is not connected
      ];

      const metrics = calculateMetrics(components, defaultGlobalParams, connections);
      
      expect(metrics.visitors).toBe(2000);
      // Only the connected landing page should be used: 2000 * 0.5 = 1000
      expect(metrics.bookings).toBe(1000);
    });
  });
});
