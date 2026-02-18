import React from 'react';
import { Layers } from 'lucide-react';

interface SidebarProps {
  onAddComponent: (type: string) => void;
}

const componentTypes = [
  { type: 'google-ads', name: 'Google Ads', icon: '🎯', color: 'var(--color-google-ads)' },
  { type: 'facebook-ads', name: 'Facebook Ads', icon: '📘', color: 'var(--color-facebook-ads)' },
  { type: 'landing-page', name: 'Landing Page', icon: '📄', color: 'var(--color-landing-page)' },
  { type: 'booking-form', name: 'Booking Form', icon: '📝', color: 'var(--color-booking-form)' },
  { type: 'email-campaign', name: 'Email Campaign', icon: '📧', color: 'var(--color-email-campaign)' },
];

export const Sidebar: React.FC<SidebarProps> = ({ onAddComponent }) => {
  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto">
      <div className="flex items-center gap-2 mb-6">
        <Layers size={24} />
        <h2 className="text-xl font-semibold">Components</h2>
      </div>
      
      <div className="space-y-2">
        {componentTypes.map((component) => (
          <button
            key={component.type}
            onClick={() => onAddComponent(component.type)}
            className="sidebar-component-card w-full p-3 rounded-lg text-left transition-all flex items-center gap-3"
            style={{
              background: `linear-gradient(135deg, ${component.color}20 0%, ${component.color}10 100%)`,
              borderLeft: `3px solid ${component.color}`,
            }}
          >
            <span className="text-2xl">{component.icon}</span>
            <span>{component.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
