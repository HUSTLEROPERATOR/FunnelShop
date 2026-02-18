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
      <div key={key} style={{ marginBottom: 'var(--space-4)' }}>
        <label
          className="text-label"
          style={{
            display: 'block',
            marginBottom: 'var(--space-2)',
            textTransform: 'capitalize',
            color: 'var(--color-text-secondary)',
          }}
        >
          {key.replace(/([A-Z])/g, ' $1').trim()}
        </label>
        <input
          type="number"
          value={numValue}
          onChange={(e) => handlePropertyChange(key, parseFloat(e.target.value))}
          step={key.includes('Rate') ? '0.01' : '1'}
          className="control-input"
          style={{ width: '100%' }}
        />
      </div>
    );
  };

  return (
    <div
      style={{
        width: 300,
        background: 'var(--color-bg-surface)',
        borderLeft: '1px solid var(--color-border)',
        padding: 'var(--space-5)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-5)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Settings size={16} style={{ color: 'var(--color-text-secondary)' }} />
          <span className="text-section-title">Configuration</span>
        </div>
        <button
          onClick={onClose}
          className="btn-icon"
          style={{ width: 32, height: 32 }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Component info */}
      <div
        style={{
          padding: 'var(--space-4)',
          background: 'var(--color-bg-surface-raised)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border-muted)',
        }}
      >
        <div
          className="text-label"
          style={{ fontWeight: 'var(--weight-semibold)', marginBottom: 'var(--space-1)' }}
        >
          {component.name}
        </div>
        <div className="text-helper">{component.type}</div>
      </div>

      {/* Properties */}
      <div>
        <div
          className="text-metric-label"
          style={{ marginBottom: 'var(--space-3)' }}
        >
          Properties
        </div>
        {Object.entries(component.properties).map(([key, value]) =>
          renderPropertyInput(key, value as number | string)
        )}
      </div>
    </div>
  );
};
