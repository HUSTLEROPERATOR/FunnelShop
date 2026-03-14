import React from 'react';
import { Layers } from 'lucide-react';
import {
  COMPONENT_TYPE_CONFIG,
  COMPONENT_TYPE_KEYS,
} from '../config/componentTypeConfig';

interface SidebarProps {
  onAddComponent: (type: string) => void;
}

/* Build a list of sidebar entries from the shared config */
const componentTypeList = COMPONENT_TYPE_KEYS.map((key) => ({
  type: key,
  ...COMPONENT_TYPE_CONFIG[key],
}));

/* Group entries by category */
const groups: Record<string, typeof componentTypeList> = {};
for (const ct of componentTypeList) {
  const cat = ct.category;
  if (!groups[cat]) groups[cat] = [];
  groups[cat].push(ct);
}

export const Sidebar: React.FC<SidebarProps> = ({ onAddComponent }) => {
  return (
    <div
      style={{
        width: 220,
        background: 'var(--color-bg-surface)',
        borderRight: '1px solid var(--color-border)',
        padding: 'var(--space-4)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          paddingBottom: 'var(--space-3)',
          borderBottom: '1px solid var(--color-border-muted)',
        }}
      >
        <Layers size={15} style={{ color: 'var(--color-text-secondary)' }} />
        <span className="text-section-title">Components</span>
      </div>

      {/* Groups */}
      {Object.entries(groups).map(([group, items]) => (
        <div key={group}>
          {/* Group label */}
          <div
            style={{
              fontSize: 'var(--text-metric-label)',
              fontWeight: 'var(--weight-semibold)',
              color: 'var(--color-text-tertiary)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: 'var(--space-2)',
              paddingLeft: 'var(--space-1)',
            }}
          >
            {group}
          </div>

          {/* Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {items.map((component) => {
              const Icon = component.icon;
              return (
                <button
                  key={component.type}
                  onClick={() => onAddComponent(component.type)}
                  aria-label={`Add ${component.label}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    width: '100%',
                    padding: 'var(--space-2) var(--space-2)',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'background var(--transition-fast)',
                    color: 'var(--color-text-primary)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: 'var(--text-label)',
                    fontWeight: 'var(--weight-medium)',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      'var(--color-bg-control)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  }}
                >
                  {/* Type-colored icon badge */}
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 'var(--radius-sm)',
                      background: component.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={15} style={{ color: component.color }} />
                  </div>
                  <span>{component.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Footer hint */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: 'var(--space-3)',
          borderTop: '1px solid var(--color-border-muted)',
          fontSize: 'var(--text-helper)',
          color: 'var(--color-text-tertiary)',
          lineHeight: 'var(--leading-normal)',
          textAlign: 'center',
        }}
      >
        Click to add · Drag to position
      </div>
    </div>
  );
};
