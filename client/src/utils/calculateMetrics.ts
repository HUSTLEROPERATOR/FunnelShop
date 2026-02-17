import type { FunnelComponent, GlobalParameters, SimulationMetrics } from '../types';

/**
 * Calculate simulation metrics based on funnel components and global parameters
 * Improved with better edge case handling and validation
 */
export function calculateMetrics(
  components: FunnelComponent[],
  globalParameters: GlobalParameters
): SimulationMetrics {
  const { monthlyBudget, averageCheckSize, customerLifetimeVisits, profitMargin } = globalParameters;

  // Validate global parameters
  if (monthlyBudget < 0 || averageCheckSize < 0 || customerLifetimeVisits < 0 || profitMargin < 0) {
    return {
      visitors: 0,
      bookings: 0,
      revenue: 0,
      profit: 0,
      roi: 0,
      loyalCustomers: 0,
    };
  }

  // Initialize metrics
  let visitors = 0;
  let conversionRate = 1.0; // Start at 100%, multiply by conversion rates
  let totalCost = 0;
  let hasConversionComponent = false;

  // Process each component to calculate metrics
  components.forEach((component) => {
    const { type, properties } = component;

    switch (type) {
      case 'google-ads': {
        const cpc = properties.cpc !== undefined ? Math.max(0, Number(properties.cpc)) : 2.0;
        const budget = properties.budget !== undefined ? Math.max(0, Number(properties.budget)) : monthlyBudget * 0.4;
        const clicks = cpc > 0 ? budget / cpc : 0;
        visitors += clicks;
        totalCost += budget;
        break;
      }

      case 'facebook-ads': {
        const fbCpc = properties.cpc !== undefined ? Math.max(0, Number(properties.cpc)) : 1.5;
        const fbBudget = properties.budget !== undefined ? Math.max(0, Number(properties.budget)) : monthlyBudget * 0.3;
        const fbClicks = fbCpc > 0 ? fbBudget / fbCpc : 0;
        visitors += fbClicks;
        totalCost += fbBudget;
        break;
      }

      case 'landing-page': {
        const lpConversion = properties.conversionRate !== undefined 
          ? Math.max(0, Math.min(1, Number(properties.conversionRate))) 
          : 0.15;
        conversionRate *= lpConversion;
        hasConversionComponent = true;
        break;
      }

      case 'booking-form': {
        const bfConversion = properties.conversionRate !== undefined 
          ? Math.max(0, Math.min(1, Number(properties.conversionRate))) 
          : 0.25;
        conversionRate *= bfConversion;
        hasConversionComponent = true;
        break;
      }

      case 'email-campaign': {
        const emailVisitors = properties.recipients !== undefined ? Math.max(0, Number(properties.recipients)) : 1000;
        const emailCtr = properties.clickThroughRate !== undefined 
          ? Math.max(0, Math.min(1, Number(properties.clickThroughRate))) 
          : 0.05;
        visitors += emailVisitors * emailCtr;
        const emailCost = properties.cost !== undefined ? Math.max(0, Number(properties.cost)) : 100;
        totalCost += emailCost;
        break;
      }

      default:
        // Handle other component types with generic logic
        if (properties.conversionRate !== undefined) {
          const genericConversion = Math.max(0, Math.min(1, Number(properties.conversionRate)));
          conversionRate *= genericConversion;
          hasConversionComponent = true;
        }
        if (properties.cost !== undefined) {
          totalCost += Math.max(0, Number(properties.cost));
        }
    }
  });

  // Apply default conversion rate if no conversion components
  if (!hasConversionComponent && visitors > 0) {
    conversionRate = 0.02; // Default 2% conversion
  }

  // Calculate final metrics
  const bookings = Math.round(visitors * Math.max(0, conversionRate));
  const revenue = Math.max(0, bookings * Math.max(0, averageCheckSize) * Math.max(0, customerLifetimeVisits));
  const profit = revenue * Math.max(0, Math.min(1, profitMargin)) - totalCost;
  const roi = totalCost > 0 ? ((profit / totalCost) * 100) : 0;
  const loyalCustomers = Math.round(bookings * 0.3); // Assume 30% become loyal

  return {
    visitors: Math.round(Math.max(0, visitors)),
    bookings: Math.max(0, bookings),
    revenue: Math.round(Math.max(0, revenue)),
    profit: Math.round(profit), // Can be negative
    roi: Math.round(roi * 100) / 100, // Round to 2 decimals
    loyalCustomers: Math.max(0, loyalCustomers),
  };
}
