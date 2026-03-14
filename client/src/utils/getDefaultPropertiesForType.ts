export function getDefaultPropertiesForType(type: string): Record<string, number | string> {
  switch (type) {
    case 'google-ads':
      return { cpc: 2.0, budget: 4000 };
    case 'facebook-ads':
      return { cpc: 1.5, budget: 3000 };
    case 'landing-page':
      return { conversionRate: 0.15 };
    case 'booking-form':
      return { conversionRate: 0.25 };
    case 'email-campaign':
      return { recipients: 1000, clickThroughRate: 0.05, cost: 100 };
    default:
      return {};
  }
}
