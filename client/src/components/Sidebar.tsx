import React from 'react';
import { Layers, Target, Facebook, FileText, ClipboardList, Mail } from 'lucide-react';

interface SidebarProps {
  onAddComponent: (type: string) => void;
}

const componentTypes = [
  { type: 'google-ads', name: 'Google Ads', icon: Target },
  { type: 'facebook-ads', name: 'Facebook Ads', icon: Facebook },
  { type: 'landing-page', name: 'Landing Page', icon: FileText },
  { type: 'booking-form', name: 'Booking Form', icon: ClipboardList },
  { type: 'email-campaign', name: 'Email Campaign', icon: Mail },
];

export const Sidebar: React.FC<SidebarProps> = ({ onAddComponent }) => {
  return (
    <div
      style={{
        width: 240,
        background: 'var(--color-bg-surface)',
        borderRight: '1px solid var(--color-border)',
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
          gap: 'var(--space-2)',
        }}
      >
        <Layers size={16} style={{ color: 'var(--color-text-secondary)' }} />
        <span className="text-section-title">Components</span>
      </div>

      {/* Component list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
        {componentTypes.map((component) => {
          const Icon = component.icon;
          return (
            <button
              key={component.type}
              onClick={() => onAddComponent(component.type)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                width: '100%',
                padding: 'var(--space-3) var(--space-3)',
                background: 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'background 120ms ease',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-label)',
                fontWeight: 'var(--weight-medium)',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-bg-control)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-bg-control)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon size={16} style={{ color: 'var(--color-text-secondary)' }} />
              </div>
              <span>{component.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
