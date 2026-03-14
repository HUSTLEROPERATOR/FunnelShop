import React, { useState } from 'react';
import { Target, Facebook, FileText, ClipboardList, Mail } from 'lucide-react';
import type { FunnelComponent, Connection } from '../types';
import { ConnectionLine } from './ConnectionLine';

interface CanvasProps {
  components: FunnelComponent[];
  connections: Connection[];
  selectedId: string | null;
  selectedConnectionId: string | null;
  connectionMode: boolean;
  onSelectComponent: (id: string) => void;
  onSelectConnection: (id: string) => void;
  onMoveComponent: (id: string, x: number, y: number) => void;
  onCreateConnection: (sourceId: string, targetId: string) => void;
}

/* Per-type config: icon, accent color, bg tint, label */
const typeConfig: Record<
  string,
  { icon: React.ElementType; color: string; bg: string; label: string }
> = {
  'google-ads': {
    icon: Target,
    color: 'var(--color-type-google)',
    bg: 'var(--color-type-google-bg)',
    label: 'Google Ads',
  },
  'facebook-ads': {
    icon: Facebook,
    color: 'var(--color-type-facebook)',
    bg: 'var(--color-type-facebook-bg)',
    label: 'Facebook Ads',
  },
  'landing-page': {
    icon: FileText,
    color: 'var(--color-type-landing)',
    bg: 'var(--color-type-landing-bg)',
    label: 'Landing Page',
  },
  'booking-form': {
    icon: ClipboardList,
    color: 'var(--color-type-booking)',
    bg: 'var(--color-type-booking-bg)',
    label: 'Booking Form',
  },
  'email-campaign': {
    icon: Mail,
    color: 'var(--color-type-email)',
    bg: 'var(--color-type-email-bg)',
    label: 'Email Campaign',
  },
};

const fallbackConfig = {
  icon: FileText,
  color: 'var(--color-text-secondary)',
  bg: 'var(--color-bg-control)',
  label: 'Component',
};

export const Canvas: React.FC<CanvasProps> = ({
  components,
  connections,
  selectedId,
  selectedConnectionId,
  connectionMode,
  onSelectComponent,
  onSelectConnection,
  onMoveComponent,
  onCreateConnection,
}) => {
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('componentId', id);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const componentId = e.dataTransfer.getData('componentId');
    if (componentId) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left - 85; // half of 170px card width
      const y = e.clientY - rect.top - 44;  // half of ~88px card height
      onMoveComponent(componentId, x, y);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleComponentClick = (e: React.MouseEvent, componentId: string) => {
    e.stopPropagation();

    if (connectionMode) {
      if (connectingFrom === null) {
        setConnectingFrom(componentId);
      } else if (connectingFrom !== componentId) {
        onCreateConnection(connectingFrom, componentId);
        setConnectingFrom(null);
      }
    } else {
      onSelectComponent(componentId);
    }
  };

  const handleCanvasClick = () => {
    if (connectionMode) {
      if (connectingFrom) {
        setConnectingFrom(null);
      }
    } else {
      onSelectComponent('');
      onSelectConnection('');
    }
  };

  /* ── Card border + shadow based on state ── */
  const cardStyle = (component: FunnelComponent): React.CSSProperties => {
    const isSelected = selectedId === component.id;
    const isConnecting = connectionMode && connectingFrom === component.id;
    const isConnectTarget = connectionMode && connectingFrom !== null && connectingFrom !== component.id;

    let border: string;
    let boxShadow: string;
    if (isConnecting) {
      border = '2px solid var(--color-success)';
      boxShadow = 'var(--shadow-connection)';
    } else if (isSelected) {
      border = '2px solid var(--color-primary)';
      boxShadow = 'var(--shadow-selection)';
    } else if (isConnectTarget) {
      border = '2px solid var(--color-border-strong)';
      boxShadow = 'var(--shadow-md)';
    } else {
      border = '1.5px solid var(--color-border)';
      boxShadow = 'var(--shadow-sm)';
    }

    return {
      position: 'absolute',
      left: component.position.x,
      top: component.position.y,
      width: 180,
      background: 'var(--color-bg-surface)',
      borderRadius: 'var(--radius-lg)',
      border,
      boxShadow,
      cursor: connectionMode ? 'pointer' : 'move',
      // GPU-composited transitions — only transform/opacity/border-color/box-shadow
      transition: 'border-color 150ms ease, box-shadow 150ms ease',
      willChange: 'transform',
      userSelect: 'none',
    };
  };

  return (
    <div
      className="flex-1 relative overflow-auto"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={handleCanvasClick}
      style={{
        backgroundImage: `
          linear-gradient(180deg, var(--canvas-gradient-from) 0%, var(--canvas-gradient-to) 100%),
          radial-gradient(circle, var(--canvas-grid-color) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 24px 24px',
        cursor: connectionMode ? 'crosshair' : 'default',
      }}
    >
      <div className="relative min-h-full" style={{ padding: 'var(--space-8)' }}>
        {/* SVG layer for connections */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 'var(--z-canvas)' as unknown as number }}
        >
          <defs>
            <marker
              id="arrow-default"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="4"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,1 L7,4 L0,7" fill="none" stroke="#c4c9d4" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </marker>
            <marker
              id="arrow-selected"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="4"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,1 L7,4 L0,7" fill="none" stroke="#3b82f6" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </marker>
          </defs>
          {connections.map((connection) => (
            <ConnectionLine
              key={connection.id}
              connection={connection}
              components={components}
              isSelected={selectedConnectionId === connection.id}
              onSelect={() => onSelectConnection(connection.id)}
            />
          ))}
        </svg>

        {/* Components layer */}
        <div className="relative" style={{ zIndex: 'var(--z-components)' as unknown as number }}>
          {components.map((component) => {
            const config = typeConfig[component.type] || fallbackConfig;
            const Icon = config.icon;

            return (
              <div
                key={component.id}
                draggable={!connectionMode}
                onDragStart={(e) => handleDragStart(e, component.id)}
                onClick={(e) => handleComponentClick(e, component.id)}
                style={cardStyle(component)}
              >
                {/* Colored top strip */}
                <div
                  style={{
                    height: 3,
                    background: config.color,
                    borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
                    opacity: 0.85,
                  }}
                />

                {/* Card body */}
                <div style={{ padding: 'var(--space-3) var(--space-3) var(--space-3)' }}>
                  {/* Icon + name row */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      marginBottom: 'var(--space-2)',
                    }}
                  >
                    {/* Type icon badge */}
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 'var(--radius-sm)',
                        background: config.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={14} style={{ color: config.color }} />
                    </div>

                    {/* Component name */}
                    <span
                      style={{
                        fontSize: 'var(--text-label)',
                        fontWeight: 'var(--weight-semibold)',
                        color: 'var(--color-text-primary)',
                        lineHeight: 'var(--leading-tight)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {component.name}
                    </span>
                  </div>

                  {/* Type badge */}
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '2px 7px',
                      borderRadius: 'var(--radius-full)',
                      background: config.bg,
                      fontSize: 'var(--text-metric-label)',
                      fontWeight: 'var(--weight-medium)',
                      color: config.color,
                      letterSpacing: '0.01em',
                    }}
                  >
                    {config.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {components.length === 0 && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ zIndex: 'var(--z-overlay)' as unknown as number }}
          >
            <div style={{ textAlign: 'center', maxWidth: 320 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--color-bg-surface)',
                  border: '1.5px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto var(--space-4)',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                <FileText size={20} style={{ color: 'var(--color-text-tertiary)' }} />
              </div>
              <p
                style={{
                  fontSize: 'var(--text-section-title)',
                  fontWeight: 'var(--weight-semibold)',
                  color: 'var(--color-text-secondary)',
                  marginBottom: 'var(--space-2)',
                  margin: '0 0 var(--space-2)',
                }}
              >
                Your canvas is empty
              </p>
              <p
                className="text-helper"
                style={{ margin: 0 }}
              >
                Click a component in the sidebar to add it to your funnel
              </p>
            </div>
          </div>
        )}

        {/* Floating connection-mode pill */}
        {connectionMode && connectingFrom && (
          <div
            style={{
              position: 'absolute',
              top: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 'var(--z-floating)' as unknown as number,
              background: 'var(--toolbar-bg)',
              backdropFilter: `blur(var(--toolbar-blur))`,
              WebkitBackdropFilter: `blur(var(--toolbar-blur))`,
              border: '1px solid var(--color-success)',
              boxShadow: 'var(--shadow-connection)',
              borderRadius: 'var(--radius-full)',
              padding: 'var(--space-2) var(--space-4)',
              fontSize: 'var(--text-label)',
              fontWeight: 'var(--weight-medium)',
              color: 'var(--color-success)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              whiteSpace: 'nowrap',
            }}
          >
            {/* Animated pulse dot */}
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: 'var(--color-success)',
                display: 'inline-block',
                animation: 'pulse 1.4s ease-in-out infinite',
              }}
            />
            Click another component to connect
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.75); }
        }
      `}</style>
    </div>
  );
};
