import React from 'react';
import { Layers } from 'lucide-react';

interface SidebarProps {
  onAddComponent: (type: string) => void;
}

const componentTypes = [
  { type: 'google-ads', name: 'Google Ads', icon: '🎯', color: '#ea4335' },
  { type: 'facebook-ads', name: 'Facebook Ads', icon: '📘', color: '#1877f2' },
  { type: 'landing-page', name: 'Landing Page', icon: '📄', color: '#8b5cf6' },
  { type: 'booking-form', name: 'Booking Form', icon: '📝', color: '#10b981' },
  { type: 'email-campaign', name: 'Email Campaign', icon: '📧', color: '#f59e0b' },
];

export const Sidebar: React.FC<SidebarProps> = ({ onAddComponent }) => {
  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto">
      <div className="flex items-center gap-2 mb-6">
        <Layers size={24} className="text-blue-400" />
        <h2 className="text-xl font-semibold">Components</h2>
      </div>
      
      <div className="space-y-2">
        {componentTypes.map((component) => (
          <button
            key={component.type}
            onClick={() => onAddComponent(component.type)}
            className="w-full p-4 rounded-lg text-left transition-all flex items-center gap-3 group relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${component.color}22, ${component.color}11)`,
              border: `1px solid ${component.color}44`,
            }}
          >
            {/* Hover effect background */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                background: `linear-gradient(135deg, ${component.color}33, ${component.color}22)`,
              }}
            />
            
            <span className="text-2xl relative z-10">{component.icon}</span>
            <div className="relative z-10">
              <div className="font-medium text-white">{component.name}</div>
              <div className="text-xs text-gray-400 mt-0.5">Click to add</div>
            </div>
            
            {/* Accent border on hover */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{
                boxShadow: `inset 0 0 0 2px ${component.color}`,
                borderRadius: '0.5rem',
              }}
            />
          </button>
        ))}
      </div>
      
      <div className="mt-6 p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
        <p className="text-xs text-blue-300">
          <strong>Tip:</strong> Drag components from the canvas to reposition them.
        </p>
      </div>
    </div>
  );
};
