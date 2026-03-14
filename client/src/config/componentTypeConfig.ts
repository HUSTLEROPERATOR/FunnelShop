import { Target, Facebook, FileText, ClipboardList, Mail } from 'lucide-react';
import type React from 'react';

/**
 * Visual and categorical metadata for each canvas component type.
 * Single source of truth used by Canvas, Sidebar, and any future
 * Figma-driven redesign of the card system.
 */
export interface ComponentTypeConfig {
  /** Display label shown in sidebar item and card type badge */
  label: string;
  /** Lucide icon component for the type badge */
  icon: React.ElementType;
  /** Accent color — must be a CSS variable token, never a raw hex value */
  color: string;
  /** Background tint — must be a CSS variable token, never a raw hex value */
  bg: string;
  /** Sidebar grouping category */
  category: 'Traffic' | 'Conversion' | 'Nurture';
  /** One-line description of the component's role in the funnel */
  helperText: string;
}

export const COMPONENT_TYPE_CONFIG: Record<string, ComponentTypeConfig> = {
  'google-ads': {
    label: 'Google Ads',
    icon: Target,
    color: 'var(--color-type-google)',
    bg: 'var(--color-type-google-bg)',
    category: 'Traffic',
    helperText: 'Drive paid search traffic from Google',
  },
  'facebook-ads': {
    label: 'Facebook Ads',
    icon: Facebook,
    color: 'var(--color-type-facebook)',
    bg: 'var(--color-type-facebook-bg)',
    category: 'Traffic',
    helperText: 'Reach audiences with Meta social ads',
  },
  'landing-page': {
    label: 'Landing Page',
    icon: FileText,
    color: 'var(--color-type-landing)',
    bg: 'var(--color-type-landing-bg)',
    category: 'Conversion',
    helperText: 'Convert visitors with a focused page',
  },
  'booking-form': {
    label: 'Booking Form',
    icon: ClipboardList,
    color: 'var(--color-type-booking)',
    bg: 'var(--color-type-booking-bg)',
    category: 'Conversion',
    helperText: 'Capture bookings and appointments',
  },
  'email-campaign': {
    label: 'Email Campaign',
    icon: Mail,
    color: 'var(--color-type-email)',
    bg: 'var(--color-type-email-bg)',
    category: 'Nurture',
    helperText: 'Re-engage leads with targeted emails',
  },
};

/** Fallback used when a component type is not found in COMPONENT_TYPE_CONFIG */
export const FALLBACK_COMPONENT_TYPE_CONFIG: ComponentTypeConfig = {
  label: 'Component',
  icon: FileText,
  color: 'var(--color-text-secondary)',
  bg: 'var(--color-bg-control)',
  category: 'Conversion',
  helperText: '',
};

/** Ordered array of all registered component type keys */
export const COMPONENT_TYPE_KEYS = Object.keys(COMPONENT_TYPE_CONFIG);
