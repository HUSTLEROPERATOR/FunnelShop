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
  const incomingEdges = new Map<string, string[]>();
  connections.forEach(conn => {
    if (!graph.has(conn.sourceId)) {
      graph.set(conn.sourceId, []);
    }
    graph.get(conn.sourceId)!.push(conn.targetId);
    
    if (!incomingEdges.has(conn.targetId)) {
      incomingEdges.set(conn.targetId, []);
    }
    incomingEdges.get(conn.targetId)!.push(conn.sourceId);
  });

  // Detect cycles using DFS
  const hasCycle = detectCycle(graph, components);
  if (hasCycle) {
    console.warn('Cycle detected in funnel graph. Simulation may not be accurate.');
    // Return safe default metrics
    return {
      visitors: 0,
      bookings: 0,
      revenue: 0,
      profit: 0,
      roi: 0,
      loyalCustomers: 0,
    };
  }

  // Find source components (traffic generators with no incoming connections)
  const sourceComponents = components.filter(c => {
    const isTrafficSource = ['google-ads', 'facebook-ads', 'email-campaign'].includes(c.type);
    return isTrafficSource && !incomingEdges.has(c.id);
  });

  // Track incoming flow per node (accumulate before applying conversion)
  const incomingFlow = new Map<string, number>();
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

    incomingFlow.set(component.id, visitors);
    totalCost += cost;
  });

  // Propagate visitors through the graph using topological ordering
  const visited = new Set<string>();
  const processing = new Set<string>();
  
  const processNode = (nodeId: string): number => {
    if (visited.has(nodeId)) {
      return incomingFlow.get(nodeId) || 0;
    }
    
    if (processing.has(nodeId)) {
      // Cycle detected during traversal
      return 0;
    }
    
    processing.add(nodeId);
    
    // Accumulate incoming flow from all sources
    const sources = incomingEdges.get(nodeId) || [];
    let totalIncoming = incomingFlow.get(nodeId) || 0;
    
    sources.forEach(sourceId => {
      const sourceFlow = processNode(sourceId);
      totalIncoming += sourceFlow;
    });
    
    // Apply conversion rate for this node (if it has one)
    const currentComponent = components.find(c => c.id === nodeId);
    if (currentComponent && totalIncoming > 0) {
      const { type, properties } = currentComponent;
      
      if (type === 'landing-page') {
        const conversionRate = Number(properties.conversionRate) || 0.15;
        totalIncoming = totalIncoming * conversionRate;
      } else if (type === 'booking-form') {
        const conversionRate = Number(properties.conversionRate) || 0.25;
        totalIncoming = totalIncoming * conversionRate;
      }
    }
    
    incomingFlow.set(nodeId, totalIncoming);
    processing.delete(nodeId);
    visited.add(nodeId);
    
    return totalIncoming;
  };

  // Process all nodes
  components.forEach(component => {
    processNode(component.id);
  });

  // Calculate final metrics from end components (components with no outgoing connections)
  const endComponents = components.filter(c => {
    const hasOutgoing = graph.has(c.id) && (graph.get(c.id)?.length || 0) > 0;
    return !hasOutgoing && incomingFlow.has(c.id);
  });

  let totalBookings = 0;
  endComponents.forEach(component => {
    const flow = incomingFlow.get(component.id) || 0;
    // Flow already has conversion applied, just add it
    totalBookings += flow;
  });

  const totalVisitors = sourceComponents.reduce((sum, c) => sum + (incomingFlow.get(c.id) || 0), 0);
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
 * Detect cycles in the graph using DFS
 */
function detectCycle(
  graph: Map<string, string[]>,
  components: FunnelComponent[]
): boolean {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  
  const dfs = (nodeId: string): boolean => {
    visited.add(nodeId);
    recursionStack.add(nodeId);
    
    const neighbors = graph.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) {
          return true;
        }
      } else if (recursionStack.has(neighbor)) {
        return true; // Cycle detected
      }
    }
    
    recursionStack.delete(nodeId);
    return false;
  };
  
  for (const component of components) {
    if (!visited.has(component.id)) {
      if (dfs(component.id)) {
        return true;
      }
    }
  }
  
  return false;
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
