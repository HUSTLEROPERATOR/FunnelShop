export interface FunnelComponent {
  id: string;
  type: string;
  name: string;
  position: { x: number; y: number };
  properties: Record<string, any>;
}

export interface GlobalParameters {
  monthlyBudget: number;
  averageCheckSize: number;
  customerLifetimeVisits: number;
  profitMargin: number;
}

export interface SimulationMetrics {
  visitors: number;
  bookings: number;
  revenue: number;
  profit: number;
  roi: number;
  loyalCustomers: number;
}

export interface FunnelScenario {
  id: string;
  name: string;
  description?: string;
  components: FunnelComponent[];
  globalParameters: GlobalParameters;
  createdAt: string;
  updatedAt: string;
}

export interface Blueprint {
  id: string;
  name: string;
  description: string;
  components: FunnelComponent[];
  globalParameters: GlobalParameters;
}
