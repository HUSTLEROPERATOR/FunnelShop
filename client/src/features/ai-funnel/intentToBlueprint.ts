import type { Connection, FunnelComponent } from '../../types';
import { getDefaultPropertiesForType } from '../../utils/getDefaultPropertiesForType';

export type FunnelIntent =
  | 'restaurant-booking-ads'
  | 'event-promotion-funnel'
  | 'email-nurture-funnel'
  | 'menu-discovery-funnel';

export type GeneratedFunnelNode = FunnelComponent;

export interface GeneratedFunnelBlueprint {
  intent: FunnelIntent;
  scenarioName: string;
  components: GeneratedFunnelNode[];
  connections: Connection[];
}

interface BlueprintContext {
  normalizedPrompt: string;
}

const X_POSITIONS = [180, 420, 660, 900];
const DEFAULT_Y = 180;

const createNode = (
  intent: FunnelIntent,
  type: FunnelComponent['type'],
  name: string,
  index: number
): GeneratedFunnelNode => ({
  id: `ai-${intent}-${type}-${index + 1}`,
  type,
  name,
  position: { x: X_POSITIONS[index] ?? X_POSITIONS[X_POSITIONS.length - 1], y: DEFAULT_Y },
  properties: getDefaultPropertiesForType(type),
});

const connectSequentially = (components: GeneratedFunnelNode[]): Connection[] =>
  components.slice(1).map((component, index) => ({
    id: `ai-connection-${index + 1}`,
    sourceId: components[index].id,
    targetId: component.id,
  }));

const buildRestaurantBookingAds = ({
  normalizedPrompt,
}: BlueprintContext): GeneratedFunnelBlueprint => {
  const trafficType =
    normalizedPrompt.includes('google') || normalizedPrompt.includes('search')
      ? 'google-ads'
      : 'facebook-ads';
  const trafficName =
    trafficType === 'google-ads' ? 'Google Reservation Ads' : 'Meta Reservation Ads';

  const components = [
    createNode('restaurant-booking-ads', trafficType, trafficName, 0),
    createNode('restaurant-booking-ads', 'landing-page', 'Reservation Landing Page', 1),
    createNode('restaurant-booking-ads', 'booking-form', 'Reservation Booking Form', 2),
  ];

  return {
    intent: 'restaurant-booking-ads',
    scenarioName: 'AI: Restaurant Booking Funnel',
    components,
    connections: connectSequentially(components),
  };
};

const buildEventPromotionFunnel = (): GeneratedFunnelBlueprint => {
  const components = [
    createNode('event-promotion-funnel', 'facebook-ads', 'Event Promotion Ads', 0),
    createNode('event-promotion-funnel', 'landing-page', 'Event Landing Page', 1),
    createNode('event-promotion-funnel', 'booking-form', 'Event Booking Form', 2),
  ];

  return {
    intent: 'event-promotion-funnel',
    scenarioName: 'AI: Event Promotion Funnel',
    components,
    connections: connectSequentially(components),
  };
};

const buildEmailNurtureFunnel = (): GeneratedFunnelBlueprint => {
  const components = [
    createNode('email-nurture-funnel', 'facebook-ads', 'Lead Capture Ads', 0),
    createNode('email-nurture-funnel', 'landing-page', 'Lead Capture Landing Page', 1),
    createNode('email-nurture-funnel', 'email-campaign', 'Email Nurture Sequence', 2),
    createNode('email-nurture-funnel', 'booking-form', 'Returning Customer Booking Form', 3),
  ];

  return {
    intent: 'email-nurture-funnel',
    scenarioName: 'AI: Email Nurture Funnel',
    components,
    connections: connectSequentially(components),
  };
};

const buildMenuDiscoveryFunnel = (): GeneratedFunnelBlueprint => {
  const components = [
    createNode('menu-discovery-funnel', 'facebook-ads', 'Menu Discovery Ads', 0),
    createNode('menu-discovery-funnel', 'landing-page', 'Seasonal Menu Landing Page', 1),
    createNode('menu-discovery-funnel', 'booking-form', 'Menu Booking Form', 2),
  ];

  return {
    intent: 'menu-discovery-funnel',
    scenarioName: 'AI: Menu Discovery Funnel',
    components,
    connections: connectSequentially(components),
  };
};

const INTENT_BLUEPRINT_BUILDERS: Record<
  FunnelIntent,
  (context: BlueprintContext) => GeneratedFunnelBlueprint
> = {
  'restaurant-booking-ads': buildRestaurantBookingAds,
  'event-promotion-funnel': buildEventPromotionFunnel,
  'email-nurture-funnel': buildEmailNurtureFunnel,
  'menu-discovery-funnel': buildMenuDiscoveryFunnel,
};

export function buildBlueprintForIntent(
  intent: FunnelIntent,
  context: BlueprintContext
): GeneratedFunnelBlueprint {
  return INTENT_BLUEPRINT_BUILDERS[intent](context);
}
