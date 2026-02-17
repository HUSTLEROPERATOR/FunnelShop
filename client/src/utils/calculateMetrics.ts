import { FunnelComponent, GlobalParameters, SimulationMetrics } from '../types';

/**
 * Calculate simulation metrics based on funnel components and global parameters
 */
export function calculateMetrics(
  components: FunnelComponent[],
  globalParameters: GlobalParameters
): SimulationMetrics {
  const { monthlyBudget, averageCheckSize, customerLifetimeVisits, profitMargin } = globalParameters;

  // Initialize metrics
  let visitors = 0;
  let conversionRate = 0.02; // Default 2% conversion
  let totalCost = 0;

  // Process each component to calculate metrics
  components.forEach((component) => {
    const { type, properties } = component;

    switch (type) {
      case 'google-ads':
        const cpc = properties.cpc || 2.0;
        const budget = properties.budget || monthlyBudget * 0.4;
        const clicks = budget / cpc;
        visitors += clicks;
        totalCost += budget;
        break;

      case 'facebook-ads':
        const fbCpc = properties.cpc || 1.5;
        const fbBudget = properties.budget || monthlyBudget * 0.3;
        const fbClicks = fbBudget / fbCpc;
        visitors += fbClicks;
        totalCost += fbBudget;
        break;

      case 'landing-page':
        const lpConversion = properties.conversionRate || 0.15;
        conversionRate *= lpConversion;
        break;

      case 'booking-form':
        const bfConversion = properties.conversionRate || 0.25;
        conversionRate *= bfConversion;
        break;

      case 'email-campaign':
        const emailVisitors = properties.recipients || 1000;
        const emailCtr = properties.clickThroughRate || 0.05;
        visitors += emailVisitors * emailCtr;
        const emailCost = properties.cost || 100;
        totalCost += emailCost;
        break;

      default:
        // Handle other component types with generic logic
        if (properties.conversionRate) {
          conversionRate *= properties.conversionRate;
        }
        if (properties.cost) {
          totalCost += properties.cost;
        }
    }
  });

  // Calculate final metrics
  const bookings = Math.round(visitors * Math.max(conversionRate, 0.001));
  const revenue = bookings * averageCheckSize * customerLifetimeVisits;
  const profit = revenue * profitMargin - totalCost;
  const roi = totalCost > 0 ? ((profit / totalCost) * 100) : 0;
  const loyalCustomers = Math.round(bookings * 0.3); // Assume 30% become loyal

  return {
    visitors: Math.round(visitors),
    bookings,
    revenue: Math.round(revenue),
    profit: Math.round(profit),
    roi: Math.round(roi * 100) / 100, // Round to 2 decimals
    loyalCustomers,
  };
}
