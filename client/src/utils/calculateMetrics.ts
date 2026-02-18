import type { FunnelComponent, GlobalParameters, SimulationMetrics, Connection } from '../types';

/**
 * Calculate simulation metrics based on funnel components, connections, and global parameters
 * If connections exist, metrics flow through the connected graph
 * If no connections exist, falls back to simple aggregation
 */
export function calculateMetrics(
  components: FunnelComponent[],
  globalParameters: GlobalParameters,
  connections: Connection[] = []
): SimulationMetrics {
  const { monthlyBudget, averageCheckSize, customerLifetimeVisits, profitMargin } = globalParameters;

  // If we have connections, use graph-based calculation
  if (connections.length > 0) {
    return calculateWithConnections(components, connections, globalParameters);
  }

  // Otherwise, use simple aggregation (backward compatibility)
  return calculateSimple(components, monthlyBudget, averageCheckSize, customerLifetimeVisits, profitMargin);
}

/**
 * Calculate metrics by flowing data through connections
 */
function calculateWithConnections(
  components: FunnelComponent[],
  connections: Connection[],
  globalParameters: GlobalParameters
): SimulationMetrics {
  const { monthlyBudget, averageCheckSize, customerLifetimeVisits, profitMargin } = globalParameters;

  // Build adjacency map for the graph
  const graph = new Map<string, string[]>();
  connections.forEach(conn => {
    if (!graph.has(conn.sourceId)) {
      graph.set(conn.sourceId, []);
    }
    graph.get(conn.sourceId)!.push(conn.targetId);
  });

  // Find source components (traffic generators with no incoming connections)
  const hasIncoming = new Set(connections.map(c => c.targetId));
  const sourceComponents = components.filter(c => {
    const isTrafficSource = ['google-ads', 'facebook-ads', 'email-campaign'].includes(c.type);
    return isTrafficSource && !hasIncoming.has(c.id);
  });

  // Track visitors and conversion rates through the funnel
  const visitorFlow = new Map<string, number>();
  const conversionRates = new Map<string, number>();
  let totalCost = 0;

  // Calculate initial traffic from sources
  sourceComponents.forEach(component => {
    const { type, properties } = component;
    let visitors = 0;
    let cost = 0;

    switch (type) {
      case 'google-ads': {
        const cpc = Number(properties.cpc) || 2.0;
        const budget = Number(properties.budget) || monthlyBudget * 0.4;
        visitors = budget / cpc;
        cost = budget;
        break;
      }
      case 'facebook-ads': {
        const cpc = Number(properties.cpc) || 1.5;
        const budget = Number(properties.budget) || monthlyBudget * 0.3;
        visitors = budget / cpc;
        cost = budget;
        break;
      }
      case 'email-campaign': {
        const recipients = Number(properties.recipients) || 1000;
        const ctr = Number(properties.clickThroughRate) || 0.05;
        visitors = recipients * ctr;
        cost = Number(properties.cost) || 100;
        break;
      }
    }

    visitorFlow.set(component.id, visitors);
    totalCost += cost;
  });

  // Propagate visitors through the graph using BFS
  const queue = [...sourceComponents.map(c => c.id)];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (visited.has(currentId)) continue;
    visited.add(currentId);

    const currentVisitors = visitorFlow.get(currentId) || 0;
    const targets = graph.get(currentId) || [];

    targets.forEach(targetId => {
      const targetComponent = components.find(c => c.id === targetId);
      if (!targetComponent) return;

      // Apply conversion rate
      const { type, properties } = targetComponent;
      let conversionRate = 1.0;

      if (type === 'landing-page') {
        conversionRate = Number(properties.conversionRate) || 0.15;
      } else if (type === 'booking-form') {
        conversionRate = Number(properties.conversionRate) || 0.25;
      }

      const targetVisitors = currentVisitors * conversionRate;
      visitorFlow.set(targetId, (visitorFlow.get(targetId) || 0) + targetVisitors);
      conversionRates.set(targetId, conversionRate);

      queue.push(targetId);
    });
  }

  // Calculate final metrics from end components (booking forms or components with no outgoing connections)
  const endComponents = components.filter(c => {
    const hasOutgoing = graph.has(c.id);
    return c.type === 'booking-form' || !hasOutgoing && visitorFlow.has(c.id);
  });

  let totalBookings = 0;
  endComponents.forEach(component => {
    const visitors = visitorFlow.get(component.id) || 0;
    totalBookings += visitors;
  });

  const totalVisitors = sourceComponents.reduce((sum, c) => sum + (visitorFlow.get(c.id) || 0), 0);
  const bookings = Math.round(totalBookings);
  const revenue = bookings * averageCheckSize * customerLifetimeVisits;
  const profit = revenue * profitMargin - totalCost;
  const roi = totalCost > 0 ? ((profit / totalCost) * 100) : 0;
  const loyalCustomers = Math.round(bookings * 0.3);

  return {
    visitors: Math.round(totalVisitors),
    bookings,
    revenue: Math.round(revenue),
    profit: Math.round(profit),
    roi: Math.round(roi * 100) / 100,
    loyalCustomers,
  };
}

/**
 * Simple aggregation calculation (original logic)
 */
function calculateSimple(
  components: FunnelComponent[],
  monthlyBudget: number,
  averageCheckSize: number,
  customerLifetimeVisits: number,
  profitMargin: number
): SimulationMetrics {

  // Initialize metrics
  let visitors = 0;
  let conversionRate = 0.02; // Default 2% conversion
  let totalCost = 0;

  // Process each component to calculate metrics
  components.forEach((component) => {
    const { type, properties } = component;

    switch (type) {
      case 'google-ads': {
        const cpc = Number(properties.cpc) || 2.0;
        const budget = Number(properties.budget) || monthlyBudget * 0.4;
        const clicks = budget / cpc;
        visitors += clicks;
        totalCost += budget;
        break;
      }

      case 'facebook-ads': {
        const fbCpc = Number(properties.cpc) || 1.5;
        const fbBudget = Number(properties.budget) || monthlyBudget * 0.3;
        const fbClicks = fbBudget / fbCpc;
        visitors += fbClicks;
        totalCost += fbBudget;
        break;
      }

      case 'landing-page': {
        const lpConversion = Number(properties.conversionRate) || 0.15;
        conversionRate *= lpConversion;
        break;
      }

      case 'booking-form': {
        const bfConversion = Number(properties.conversionRate) || 0.25;
        conversionRate *= bfConversion;
        break;
      }

      case 'email-campaign': {
        const emailVisitors = Number(properties.recipients) || 1000;
        const emailCtr = Number(properties.clickThroughRate) || 0.05;
        visitors += emailVisitors * emailCtr;
        const emailCost = Number(properties.cost) || 100;
        totalCost += emailCost;
        break;
      }

      default:
        // Handle other component types with generic logic
        if (properties.conversionRate) {
          conversionRate *= Number(properties.conversionRate);
        }
        if (properties.cost) {
          totalCost += Number(properties.cost);
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
