import React from 'react';
import { X } from 'lucide-react';
import type { FunnelComponent } from '../types';
import { Card, Input } from './ui';

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
    const label = key.replace(/([A-Z])/g, ' $1').trim();
    const formattedLabel = label.charAt(0).toUpperCase() + label.slice(1);
    
    return (
      <div key={key} className="mb-4">
        <Input
          type="number"
          value={numValue}
          onChange={(e) => handlePropertyChange(key, parseFloat(e.target.value))}
          step={key.includes('Rate') ? '0.01' : '1'}
          label={formattedLabel}
        />
      </div>
    );
  };

  return (
    <div className="w-80 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
      <Card className="shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Configuration</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="mb-6 pb-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">{component.name}</h3>
          <p className="text-xs text-gray-500">Type: {component.type}</p>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">Properties</h4>
          {Object.entries(component.properties).map(([key, value]) =>
            renderPropertyInput(key, value as number | string)
          )}
        </div>
      </Card>
    </div>
  );
};
