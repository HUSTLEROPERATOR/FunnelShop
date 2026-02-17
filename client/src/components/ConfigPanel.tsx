import React from 'react';
import { X, Trash2 } from 'lucide-react';
import type { FunnelComponent } from '../types';

interface ConfigPanelProps {
  component: FunnelComponent | null;
  onUpdate: (id: string, properties: Record<string, number | string>) => void;
  onClose: () => void;
  onDelete: () => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ component, onUpdate, onClose, onDelete }) => {
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
        <label className="block text-sm font-medium mb-2 capitalize">
          {key.replace(/([A-Z])/g, ' $1').trim()}
        </label>
        <input
          type="number"
          value={numValue}
          onChange={(e) => handlePropertyChange(key, parseFloat(e.target.value))}
          step={key.includes('Rate') ? '0.01' : '1'}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
        />
      </div>
    );
  };

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Configuration</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-700 rounded transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">{component.name}</h3>
        <p className="text-sm text-gray-400">Type: {component.type}</p>
      </div>

      <div>
        <h4 className="text-md font-medium mb-3">Properties</h4>
        {Object.entries(component.properties).map(([key, value]) =>
          renderPropertyInput(key, value as number | string)
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-700">
        <button
          onClick={onDelete}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          <Trash2 size={18} />
          Delete Component
        </button>
      </div>
    </div>
  );
};
