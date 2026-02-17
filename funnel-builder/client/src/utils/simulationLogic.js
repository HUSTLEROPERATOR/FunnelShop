// Simple simulation logic for calculating funnel metrics
export const calculateMetrics = (components, globalParams) => {
  if (!components || components.length === 0) {
    return {
      visitors: 0,
      bookings: 0,
      revenue: 0,
      profit: 0,
      roi: 0,
      loyalCustomers: 0
    };
  }

  let totalVisitors = 0;
  let totalSpend = 0;
  let totalBookings = 0;
  let totalRevenue = 0;

  // Calculate visitors from traffic sources
  const trafficSources = components.filter(c => 
    ['SocialMediaAds', 'GoogleAds', 'RetargetingAds'].includes(c.type)
  );

  trafficSources.forEach(source => {
    const { budget = 0, cpc = 1 } = source.props;
    const clicks = budget / cpc;
    const adjustedClicks = clicks * globalParams.seasonality * (2 - globalParams.competitionLevel);
    totalVisitors += Math.round(adjustedClicks);
    totalSpend += budget;
  });

  // Apply market size constraint
  totalVisitors = Math.min(totalVisitors, globalParams.marketSize * 0.1);

  if (totalVisitors === 0) return {
    visitors: 0,
    bookings: 0,
    revenue: 0,
    profit: 0,
    roi: 0,
    loyalCustomers: 0
  };

  // Calculate conversions through landing pages
  const landingPages = components.filter(c => c.type === 'LandingPage');
  let conversionRate = 0.02; // Default 2% conversion rate
  
  if (landingPages.length > 0) {
    conversionRate = landingPages.reduce((acc, lp) => {
      return acc + (lp.props.conversionRate || 15) / 100;
    }, 0) / landingPages.length;
  }

  let leads = Math.round(totalVisitors * conversionRate);

  // Email sequence boost
  const emailSequences = components.filter(c => c.type === 'EmailSequence');
  if (emailSequences.length > 0) {
    const emailBoost = emailSequences.reduce((acc, es) => {
      const openRate = (es.props.openRate || 25) / 100;
      const clickRate = (es.props.clickRate || 8) / 100;
      const convRate = (es.props.conversionRate || 12) / 100;
      return acc + (openRate * clickRate * convRate);
    }, 0);
    leads = Math.round(leads * (1 + emailBoost));
  }

  // Booking system conversion
  const bookingSystems = components.filter(c => c.type === 'BookingSystem');
  let bookingConversionRate = 0.3; // Default 30%
  let averageBookingValue = 35; // Default $35

  if (bookingSystems.length > 0) {
    bookingConversionRate = bookingSystems.reduce((acc, bs) => {
      return acc + (bs.props.conversionRate || 80) / 100;
    }, 0) / bookingSystems.length;
    
    averageBookingValue = bookingSystems.reduce((acc, bs) => {
      return acc + (bs.props.averageBookingValue || 45);
    }, 0) / bookingSystems.length;
  }

  totalBookings = Math.round(leads * bookingConversionRate);
  totalRevenue = totalBookings * averageBookingValue;

  // Calculate profit (assume 40% margin on bookings)
  const directCosts = totalRevenue * 0.6; // 60% COGS
  const totalProfit = totalRevenue - directCosts - totalSpend;

  // Calculate ROI
  const roi = totalSpend > 0 ? ((totalProfit / totalSpend) * 100) : 0;

  // Estimate loyal customers (assume 20% become repeat customers)
  const loyalCustomers = Math.round(totalBookings * 0.2);

  return {
    visitors: totalVisitors,
    bookings: totalBookings,
    revenue: totalRevenue,
    profit: totalProfit,
    roi: roi,
    loyalCustomers: loyalCustomers
  };
};