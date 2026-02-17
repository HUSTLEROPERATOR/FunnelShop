import React from 'react';
import { useDrag } from 'react-dnd';
import { 
  Target, 
  Search, 
  FileText, 
  Mail, 
  Calendar, 
  RotateCcw,
  X
} from 'lucide-react';

const FunnelComponent = ({ component, isSelected, onSelect, onRemove }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'component',
    item: { ...component },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const getIcon = (type) => {
    const iconMap = {
      SocialMediaAds: Target,
      GoogleAds: Search,
      LandingPage: FileText,
      EmailSequence: Mail,
      BookingSystem: Calendar,
      RetargetingAds: RotateCcw
    };
    return iconMap[type] || Target;
  };

  const getDisplayName = (type) => {
    const nameMap = {
      SocialMediaAds: 'Social Media Ads',
      GoogleAds: 'Google Ads',
      LandingPage: 'Landing Page',
      EmailSequence: 'Email Sequence',
      BookingSystem: 'Booking System',
      RetargetingAds: 'Retargeting'
    };
    return nameMap[type] || type;
  };

  const getComponentColor = (type) => {
    const colorMap = {
      SocialMediaAds: '#1877f2',
      GoogleAds: '#4285f4',
      LandingPage: '#ff6b35',
      EmailSequence: '#34d399',
      BookingSystem: '#8b5cf6',
      RetargetingAds: '#f59e0b'
    };
    return colorMap[type] || '#6b7280';
  };

  const getComponentColorDark = (type) => {
    const colorMap = {
      SocialMediaAds: '#145dbf',
      GoogleAds: '#3367d6',
      LandingPage: '#d4511f',
      EmailSequence: '#10b981',
      BookingSystem: '#7c3aed',
      RetargetingAds: '#d97706'
    };
    return colorMap[type] || '#4a5568';
  };

  const Icon = getIcon(component.type);
  const displayName = getDisplayName(component.type);
  const color = getComponentColor(component.type);
  const colorDark = getComponentColorDark(component.type);

  return (
    <div
      ref={drag}
      className={`funnel-component ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{
        left: component.position.x,
        top: component.position.y,
        opacity: isDragging ? 0.7 : 1,
        borderColor: color,
        '--component-color': color,
        '--component-color-dark': colorDark
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <div className="component-header">
        <Icon size={16} color="white" />
        <span className="component-title">{displayName}</span>
        <button
          className="remove-button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <X size={14} />
        </button>
      </div>
      
      <div className="component-body">
        {component.type === 'SocialMediaAds' && (
          <div className="component-stats">
            <div>Platform: {component.props.platform}</div>
            <div>Budget: ${component.props.budget}</div>
            <div>CPC: ${component.props.cpc}</div>
          </div>
        )}
        
        {component.type === 'GoogleAds' && (
          <div className="component-stats">
            <div>Budget: ${component.props.budget}</div>
            <div>CPC: ${component.props.cpc}</div>
            <div>Keywords: {component.props.keywords}</div>
          </div>
        )}
        
        {component.type === 'LandingPage' && (
          <div className="component-stats">
            <div>Conv. Rate: {component.props.conversionRate}%</div>
            <div>Offer: {component.props.offerType}</div>
          </div>
        )}
        
        {component.type === 'EmailSequence' && (
          <div className="component-stats">
            <div>Open Rate: {component.props.openRate}%</div>
            <div>Click Rate: {component.props.clickRate}%</div>
            <div>Conv. Rate: {component.props.conversionRate}%</div>
          </div>
        )}
        
        {component.type === 'BookingSystem' && (
          <div className="component-stats">
            <div>Conv. Rate: {component.props.conversionRate}%</div>
            <div>Avg. Value: ${component.props.averageBookingValue}</div>
          </div>
        )}
        
        {component.type === 'RetargetingAds' && (
          <div className="component-stats">
            <div>Budget: ${component.props.budget}</div>
            <div>CPC: ${component.props.cpc}</div>
            <div>Audience: {component.props.audienceSize}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FunnelComponent;