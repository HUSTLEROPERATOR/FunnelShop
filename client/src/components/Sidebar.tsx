import React from 'react';
import { Layers } from 'lucide-react';

interface SidebarProps {
  onAddComponent: (type: string) => void;
}

const componentTypes = [
  { type: 'google-ads', name: 'Google Ads', icon: '🎯' },
  { type: 'facebook-ads', name: 'Facebook Ads', icon: '📘' },
  { type: 'landing-page', name: 'Landing Page', icon: '📄' },
  { type: 'booking-form', name: 'Booking Form', icon: '📝' },
  { type: 'email-campaign', name: 'Email Campaign', icon: '📧' },
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
            className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors flex items-center gap-3"
          >
            <span className="text-2xl">{component.icon}</span>
            <span>{component.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
