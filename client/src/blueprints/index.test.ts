import { describe, expect, it } from 'vitest';
import { blueprints, getBlueprintById } from './index';

describe('blueprint registry', () => {
  it('exposes the required predefined templates from local JSON files', () => {
    expect(blueprints.map((blueprint) => blueprint.name)).toEqual([
      'Restaurant Ads Funnel',
      'Email Marketing Funnel',
      'Event Promotion Funnel',
    ]);
  });

  it('returns blueprint canvas data including connections', () => {
    const blueprint = getBlueprintById('restaurant-ads-funnel');

    expect(blueprint).toBeDefined();
    expect(blueprint?.components.length).toBeGreaterThan(0);
    expect(blueprint?.connections.length).toBeGreaterThan(0);
  });
});
