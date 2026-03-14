import { describe, it, expect } from 'vitest';
import {
  COMPONENT_TYPE_CONFIG,
  FALLBACK_COMPONENT_TYPE_CONFIG,
  COMPONENT_TYPE_KEYS,
} from './componentTypeConfig';

describe('componentTypeConfig', () => {
  const EXPECTED_TYPES = [
    'google-ads',
    'facebook-ads',
    'landing-page',
    'booking-form',
    'email-campaign',
  ];

  it('should define all expected component types', () => {
    for (const type of EXPECTED_TYPES) {
      expect(COMPONENT_TYPE_CONFIG).toHaveProperty(type);
    }
  });

  it('COMPONENT_TYPE_KEYS should match config keys', () => {
    expect(COMPONENT_TYPE_KEYS).toHaveLength(EXPECTED_TYPES.length);
    for (const type of EXPECTED_TYPES) {
      expect(COMPONENT_TYPE_KEYS).toContain(type);
    }
  });

  it('each type config should have all required fields with valid CSS variable tokens', () => {
    for (const [type, config] of Object.entries(COMPONENT_TYPE_CONFIG)) {
      expect(config.label, `${type}: label`).toBeTruthy();
      expect(config.icon, `${type}: icon`).toBeDefined();
      expect(config.color, `${type}: color must reference a CSS variable`).toMatch(/^var\(--/);
      expect(config.bg, `${type}: bg must reference a CSS variable`).toMatch(/^var\(--/);
      expect(
        config.category,
        `${type}: category must be Traffic, Conversion, or Nurture`,
      ).toMatch(/^(Traffic|Conversion|Nurture)$/);
      expect(config.helperText, `${type}: helperText`).toBeTruthy();
    }
  });

  it('fallback config should have all required fields', () => {
    expect(FALLBACK_COMPONENT_TYPE_CONFIG.label).toBeTruthy();
    expect(FALLBACK_COMPONENT_TYPE_CONFIG.icon).toBeDefined();
    expect(FALLBACK_COMPONENT_TYPE_CONFIG.color).toMatch(/^var\(--/);
    expect(FALLBACK_COMPONENT_TYPE_CONFIG.bg).toMatch(/^var\(--/);
  });

  it('Traffic category should include google-ads and facebook-ads', () => {
    const trafficTypes = COMPONENT_TYPE_KEYS.filter(
      (k) => COMPONENT_TYPE_CONFIG[k].category === 'Traffic',
    );
    expect(trafficTypes).toContain('google-ads');
    expect(trafficTypes).toContain('facebook-ads');
  });

  it('Conversion category should include landing-page and booking-form', () => {
    const conversionTypes = COMPONENT_TYPE_KEYS.filter(
      (k) => COMPONENT_TYPE_CONFIG[k].category === 'Conversion',
    );
    expect(conversionTypes).toContain('landing-page');
    expect(conversionTypes).toContain('booking-form');
  });

  it('Nurture category should include email-campaign', () => {
    const nurtureTypes = COMPONENT_TYPE_KEYS.filter(
      (k) => COMPONENT_TYPE_CONFIG[k].category === 'Nurture',
    );
    expect(nurtureTypes).toContain('email-campaign');
  });
});
