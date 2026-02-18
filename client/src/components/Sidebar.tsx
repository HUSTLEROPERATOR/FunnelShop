import React from 'react';
import { Layers } from 'lucide-react';
import { Card } from './ui/Card';

interface SidebarProps {
  onAddComponent: (type: string) => void;
}

const componentTypes = [
  { type: 'google-ads', name: 'Google Ads', icon: '🎯', color: 'from-blue-500 to-green-500' },
  { type: 'facebook-ads', name: 'Facebook Ads', icon: '📘', color: 'from-blue-600 to-blue-700' },
  { type: 'landing-page', name: 'Landing Page', icon: '📄', color: 'from-purple-500 to-purple-600' },
  { type: 'booking-form', name: 'Booking Form', icon: '📝', color: 'from-green-500 to-green-600' },
  { type: 'email-campaign', name: 'Email Campaign', icon: '📧', color: 'from-yellow-500 to-orange-600' },
];

export const Sidebar: React.FC<SidebarProps> = ({ onAddComponent }) => {
  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
      <Card className="shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Layers size={20} className="text-gray-700" />
          <h2 className="text-sm font-semibold text-gray-900">Components</h2>
        </div>
        
        <div className="space-y-2">
          {componentTypes.map((component) => (
            <button
              key={component.type}
              onClick={() => onAddComponent(component.type)}
              className="w-full p-3 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg text-left transition-all flex items-center gap-3 shadow-sm hover:shadow-md"
            >
              <span className="text-xl">{component.icon}</span>
              <span className="text-sm font-medium text-gray-700">{component.name}</span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
};
