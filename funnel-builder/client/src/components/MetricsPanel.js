import React from 'react';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Percent, 
  Heart 
} from 'lucide-react';

const MetricsPanel = ({ metrics }) => {
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return Math.round(num).toLocaleString();
  };

  const formatCurrency = (num) => {
    return '$' + formatNumber(num);
  };

  const formatPercentage = (num) => {
    return Math.round(num * 100) / 100 + '%';
  };

  return (
    <div className="metrics-panel">
      <h3>📊 Metrics</h3>
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">
            <Users size={24} color="#3b82f6" />
          </div>
          <div className="metric-content">
            <div className="metric-label">Visitors</div>
            <div className="metric-value">{formatNumber(metrics.visitors)}</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <Calendar size={24} color="#8b5cf6" />
          </div>
          <div className="metric-content">
            <div className="metric-label">Bookings</div>
            <div className="metric-value">{formatNumber(metrics.bookings)}</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <DollarSign size={24} color="#10b981" />
          </div>
          <div className="metric-content">
            <div className="metric-label">Revenue</div>
            <div className="metric-value">{formatCurrency(metrics.revenue)}</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <TrendingUp size={24} color="#f59e0b" />
          </div>
          <div className="metric-content">
            <div className="metric-label">Profit</div>
            <div className="metric-value">{formatCurrency(metrics.profit)}</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <Percent size={24} color="#ef4444" />
          </div>
          <div className="metric-content">
            <div className="metric-label">ROI</div>
            <div className="metric-value">{formatPercentage(metrics.roi)}</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <Heart size={24} color="#ec4899" />
          </div>
          <div className="metric-content">
            <div className="metric-label">Loyal Customers</div>
            <div className="metric-value">{formatNumber(metrics.loyalCustomers)}</div>
          </div>
        </div>
      </div>

      <div className="metrics-summary">
        <h4>📈 Performance Summary</h4>
        <div className="summary-stats">
          <div className="summary-item">
            <span>Conversion Rate:</span>
            <span>{metrics.bookings > 0 ? ((metrics.bookings / metrics.visitors) * 100).toFixed(2) : 0}%</span>
          </div>
          <div className="summary-item">
            <span>Cost per Booking:</span>
            <span>{metrics.bookings > 0 ? formatCurrency((metrics.revenue - metrics.profit) / metrics.bookings) : '$0'}</span>
          </div>
          <div className="summary-item">
            <span>Customer LTV:</span>
            <span>{formatCurrency(metrics.bookings > 0 ? metrics.revenue / metrics.bookings * 1.5 : 0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsPanel;