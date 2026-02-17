import React from 'react';
import { useDrag } from 'react-dnd';
import { 
  Target, 
  Search, 
  FileText, 
  Mail, 
  Calendar, 
  RotateCcw 
} from 'lucide-react';

const ComponentSidebar = () => {
  const componentTypes = [
    { 
      type: 'SocialMediaAds', 
      label: 'Social Media Ads', 
      icon: Target,
      description: 'Facebook, Instagram ads'
    },
    { 
      type: 'GoogleAds', 
      label: 'Google Ads', 
      icon: Search,
      description: 'Search & display ads'
    },
    { 
      type: 'LandingPage', 
      label: 'Landing Page', 
      icon: FileText,
      description: 'Conversion-focused page'
    },
    { 
      type: 'EmailSequence', 
      label: 'Email Sequence', 
      icon: Mail,
      description: 'Automated email follow-up'
    },
    { 
      type: 'BookingSystem', 
      label: 'Booking System', 
      icon: Calendar,
      description: 'Restaurant reservations'
    },
    { 
      type: 'RetargetingAds', 
      label: 'Retargeting', 
      icon: RotateCcw,
      description: 'Re-engage visitors'
    }
  ];

  return (
    <div className="component-sidebar">
      <h3>📦 Components</h3>
      <div className="component-list">
        {componentTypes.map((componentType) => (
          <DraggableComponent
            key={componentType.type}
            type={componentType.type}
            label={componentType.label}
            icon={componentType.icon}
            description={componentType.description}
          />
        ))}
      </div>
    </div>
  );
};

const DraggableComponent = ({ type, label, icon: Icon, description }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'component',
    item: { type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`draggable-component ${isDragging ? 'dragging' : ''}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div className="component-icon">
        <Icon size={20} />
      </div>
      <div className="component-info">
        <div className="component-label">{label}</div>
        <div className="component-description">{description}</div>
      </div>
    </div>
  );
};

export default ComponentSidebar;