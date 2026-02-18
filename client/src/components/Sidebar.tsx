import React from 'react';
import { Layers, Target, Facebook, Globe, Mail, FileText } from 'lucide-react';

interface SidebarProps {
  onAddComponent: (type: string) => void;
}

const componentTypes = [
  { type: 'google-ads', name: 'Google Ads', icon: Target },
  { type: 'facebook-ads', name: 'Facebook Ads', icon: Facebook },
  { type: 'landing-page', name: 'Landing Page', icon: Globe },
  { type: 'booking-form', name: 'Booking Form', icon: FileText },
  { type: 'email-campaign', name: 'Email Campaign', icon: Mail },
];

export const Sidebar: React.FC<SidebarProps> = ({ onAddComponent }) => {
  return (
    <div className="w-64 bg-gray-850/50 border-r border-gray-800 p-5 overflow-y-auto">
      <div className="flex items-center gap-2.5 mb-6">
        <Layers size={18} className="text-gray-400" />
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Components</h2>
      </div>
      
      <div className="space-y-2">
        {componentTypes.map((component) => {
          const Icon = component.icon;
          return (
            <button
              key={component.type}
              onClick={() => onAddComponent(component.type)}
              className="w-full h-10 px-3.5 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600 rounded-control text-left transition-all flex items-center gap-3 text-sm font-medium text-gray-300 hover:text-white group"
            >
              <Icon size={16} className="text-gray-500 group-hover:text-gray-400 transition-colors" />
              <span>{component.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
