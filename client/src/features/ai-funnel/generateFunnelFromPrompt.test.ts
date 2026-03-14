import { describe, expect, it } from 'vitest';
import { generateFunnelFromPrompt } from './generateFunnelFromPrompt';

describe('generateFunnelFromPrompt', () => {
  it('returns a fallback message for an empty prompt', () => {
    expect(generateFunnelFromPrompt('   ')).toEqual({
      recognized: false,
      intent: null,
      components: [],
      connections: [],
      message: 'Enter a prompt to generate a funnel.',
    });
  });

  it('maps reservation prompts to the restaurant booking funnel with Meta traffic when requested', () => {
    const result = generateFunnelFromPrompt('Meta ads funnel for restaurant reservations');

    expect(result.recognized).toBe(true);
    expect(result.intent).toBe('restaurant-booking-ads');
    expect(result.components.map((component) => component.type)).toEqual([
      'facebook-ads',
      'landing-page',
      'booking-form',
    ]);
  });

  it('maps event prompts to the event promotion funnel', () => {
    const result = generateFunnelFromPrompt('Promote a special dinner event');

    expect(result.recognized).toBe(true);
    expect(result.intent).toBe('event-promotion-funnel');
    expect(result.components.map((component) => component.type)).toEqual([
      'facebook-ads',
      'landing-page',
      'booking-form',
    ]);
  });

  it('maps email prompts to the email nurture funnel', () => {
    const result = generateFunnelFromPrompt('Email campaign funnel for returning customers');

    expect(result.recognized).toBe(true);
    expect(result.intent).toBe('email-nurture-funnel');
    expect(result.components.map((component) => component.type)).toEqual([
      'facebook-ads',
      'landing-page',
      'email-campaign',
      'booking-form',
    ]);
  });

  it('prefers the email nurture funnel over menu discovery when both keyword groups appear', () => {
    const result = generateFunnelFromPrompt('Email follow-up for a seasonal menu launch');

    expect(result.recognized).toBe(true);
    expect(result.intent).toBe('email-nurture-funnel');
  });

  it('maps menu prompts to the menu discovery funnel', () => {
    const result = generateFunnelFromPrompt('Seasonal menu discovery funnel');

    expect(result.recognized).toBe(true);
    expect(result.intent).toBe('menu-discovery-funnel');
    expect(result.components.map((component) => component.type)).toEqual([
      'facebook-ads',
      'landing-page',
      'booking-form',
    ]);
  });

  it('returns a fallback message when the prompt is not recognized', () => {
    expect(generateFunnelFromPrompt('Need a loyalty points dashboard')).toEqual({
      recognized: false,
      intent: null,
      components: [],
      connections: [],
      message: 'Prompt not recognized. Try one of the examples.',
    });
  });
});
