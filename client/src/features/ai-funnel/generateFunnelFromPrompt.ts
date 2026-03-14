import {
  AI_FUNNEL_EMPTY_PROMPT_MESSAGE,
  AI_FUNNEL_UNKNOWN_PROMPT_MESSAGE,
} from './funnelPromptTemplates';
import {
  buildBlueprintForIntent,
  type FunnelIntent,
  type GeneratedFunnelBlueprint,
  type GeneratedFunnelNode,
} from './intentToBlueprint';
import type { Connection } from '../../types';

export interface GeneratedFunnelFailure {
  recognized: false;
  intent: null;
  components: [];
  connections: [];
  message: string;
}

export interface GeneratedFunnelSuccess extends GeneratedFunnelBlueprint {
  recognized: true;
  components: GeneratedFunnelNode[];
  connections: Connection[];
  message: string;
}

export type GeneratedFunnelResult = GeneratedFunnelSuccess | GeneratedFunnelFailure;

interface IntentDetectionRule {
  intent: FunnelIntent;
  keywords: string[];
}

const INTENT_PRIORITY: IntentDetectionRule[] = [
  {
    intent: 'restaurant-booking-ads',
    keywords: ['booking', 'bookings', 'reservation', 'reservations', 'prenotazioni'],
  },
  {
    intent: 'email-nurture-funnel',
    keywords: ['email', 'newsletter', 'lead nurture', 'nurture', 'follow-up', 'follow up'],
  },
  {
    intent: 'event-promotion-funnel',
    keywords: [
      'event',
      'evento',
      'special night',
      'serata',
      'themed',
      'promotion night',
      'dinner event',
    ],
  },
  {
    intent: 'menu-discovery-funnel',
    keywords: ['menu', 'dishes', 'seasonal', 'discover', 'food'],
  },
];

const createFailure = (message: string): GeneratedFunnelFailure => ({
  recognized: false,
  intent: null,
  components: [],
  connections: [],
  message,
});

const normalizePrompt = (prompt: string) => prompt.trim().toLowerCase().replace(/\s+/g, ' ');

const promptMatchesIntent = (normalizedPrompt: string, keywords: string[]) =>
  keywords.some((keyword) => normalizedPrompt.includes(keyword));

const detectIntent = (normalizedPrompt: string): FunnelIntent | null =>
  INTENT_PRIORITY.find((rule) => promptMatchesIntent(normalizedPrompt, rule.keywords))?.intent ??
  null;

export function generateFunnelFromPrompt(prompt: string): GeneratedFunnelResult {
  const normalizedPrompt = normalizePrompt(prompt);

  if (!normalizedPrompt) {
    return createFailure(AI_FUNNEL_EMPTY_PROMPT_MESSAGE);
  }

  const intent = detectIntent(normalizedPrompt);

  if (!intent) {
    return createFailure(AI_FUNNEL_UNKNOWN_PROMPT_MESSAGE);
  }

  const blueprint = buildBlueprintForIntent(intent, { normalizedPrompt });

  if (blueprint.components.length === 0) {
    return createFailure(AI_FUNNEL_UNKNOWN_PROMPT_MESSAGE);
  }

  return {
    ...blueprint,
    recognized: true,
    message: `Generated ${blueprint.scenarioName.replace('AI: ', '')}.`,
  };
}
