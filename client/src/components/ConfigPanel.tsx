import React from 'react';
import { X, Settings } from 'lucide-react';
import type { FunnelComponent } from '../types';

interface ConfigPanelProps {
  component: FunnelComponent | null;
  onUpdate: (id: string, properties: Record<string, number | string>) => void;
  onClose: () => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ component, onUpdate, onClose }) => {
  if (!component) return null;

  const handlePropertyChange = (key: string, value: number | string) => {
    onUpdate(component.id, {
      ...component.properties,
      [key]: value,
    });
  };

  const renderPropertyInput = (key: string, value: number | string) => {
    const numValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
    
    return (
      <div key={key} className="mb-4">
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          {key.replace(/([A-Z])/g, ' $1').trim()}
        </label>
        <input
          type="number"
          value={numValue}
          onChange={(e) => handlePropertyChange(key, parseFloat(e.target.value))}
          step={key.includes('Rate') ? '0.01' : '1'}
          className="w-full h-10 px-4 bg-gray-800/50 border border-gray-700 rounded-control text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-colors"
        />
      </div>
    );
  };

  return (
    <div className="w-80 bg-gray-850/50 border-l border-gray-800 p-5 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <Settings size={18} className="text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Configuration</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-gray-800 rounded-md transition-colors text-gray-400 hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      <div className="mb-6 pb-6 border-b border-gray-800">
        <h3 className="text-base font-semibold mb-1.5 text-white">{component.name}</h3>
        <p className="text-xs text-gray-500 font-medium">Type: {component.type}</p>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Properties</h4>
        {Object.entries(component.properties).map(([key, value]) =>
          renderPropertyInput(key, value as number | string)
        )}
      </div>
    </div>
  );
};
