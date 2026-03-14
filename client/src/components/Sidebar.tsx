import React from 'react';
import { Layers, Target, Facebook, FileText, ClipboardList, Mail } from 'lucide-react';

interface SidebarProps {
  onAddComponent: (type: string) => void;
}

const componentTypes = [
  {
    type: 'google-ads',
    name: 'Google Ads',
    icon: Target,
    color: 'var(--color-type-google)',
    bg: 'var(--color-type-google-bg)',
    group: 'Traffic',
  },
  {
    type: 'facebook-ads',
    name: 'Facebook Ads',
    icon: Facebook,
    color: 'var(--color-type-facebook)',
    bg: 'var(--color-type-facebook-bg)',
    group: 'Traffic',
  },
  {
    type: 'landing-page',
    name: 'Landing Page',
    icon: FileText,
    color: 'var(--color-type-landing)',
    bg: 'var(--color-type-landing-bg)',
    group: 'Conversion',
  },
  {
    type: 'booking-form',
    name: 'Booking Form',
    icon: ClipboardList,
    color: 'var(--color-type-booking)',
    bg: 'var(--color-type-booking-bg)',
    group: 'Conversion',
  },
  {
    type: 'email-campaign',
    name: 'Email Campaign',
    icon: Mail,
    color: 'var(--color-type-email)',
    bg: 'var(--color-type-email-bg)',
    group: 'Nurture',
  },
];

/* Group items by their category */
const groups: Record<string, typeof componentTypes> = {};
for (const ct of componentTypes) {
  if (!groups[ct.group]) groups[ct.group] = [];
  groups[ct.group].push(ct);
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
                  aria-label={`Add ${component.name}`}
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
                  <span>{component.name}</span>
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
