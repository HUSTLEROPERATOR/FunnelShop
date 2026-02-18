import React, { useState } from 'react';
import { Box } from 'lucide-react';
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

/* Map component type → small icon label for the card header */
const typeLabels: Record<string, string> = {
  'google-ads': 'Google Ads',
  'facebook-ads': 'Facebook Ads',
  'landing-page': 'Landing Page',
  'booking-form': 'Booking Form',
  'email-campaign': 'Email Campaign',
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
      const x = e.clientX - rect.left - 75; // Center the component (150px width / 2)
      const y = e.clientY - rect.top - 40; // Center the component (80px height / 2)
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
      // Clear selection when clicking canvas
      onSelectComponent('');
      onSelectConnection('');
    }
  };

  /* ── Compute card style based on state ── */
  const cardStyle = (component: FunnelComponent): React.CSSProperties => {
    const isSelected = selectedId === component.id;
    const isConnecting = connectionMode && connectingFrom === component.id;

    return {
      position: 'absolute',
      left: component.position.x,
      top: component.position.y,
      minWidth: 170,
      padding: 'var(--space-4)',
      background: 'var(--color-bg-surface)',
      borderRadius: 'var(--radius-lg)',
      border: `2px solid ${
        isConnecting
          ? 'var(--color-success)'
          : isSelected
          ? 'var(--color-primary)'
          : 'var(--color-border)'
      }`,
      boxShadow: isConnecting
        ? 'var(--shadow-connection)'
        : isSelected
        ? 'var(--shadow-selection)'
        : 'var(--shadow-sm)',
      cursor: connectionMode ? 'pointer' : 'move',
      transition: 'border-color 150ms ease, box-shadow 150ms ease',
    };
  };

  return (
    <div
      className="flex-1 relative overflow-auto"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={handleCanvasClick}
      style={{
        background: 'linear-gradient(180deg, var(--canvas-gradient-from) 0%, var(--canvas-gradient-to) 100%)',
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
          style={{ zIndex: 1 }}
        >
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
        <div className="relative" style={{ zIndex: 2 }}>
          {components.map((component) => (
            <div
              key={component.id}
              draggable={!connectionMode}
              onDragStart={(e) => handleDragStart(e, component.id)}
              onClick={(e) => handleComponentClick(e, component.id)}
              style={cardStyle(component)}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  marginBottom: 'var(--space-1)',
                }}
              >
                <Box
                  size={14}
                  style={{ color: 'var(--color-text-tertiary)', flexShrink: 0 }}
                />
                <span
                  className="text-label"
                  style={{ fontWeight: 'var(--weight-semibold)' }}
                >
                  {component.name}
                </span>
              </div>
              <div
                className="text-helper"
                style={{ paddingLeft: 22 }}
              >
                {typeLabels[component.type] || component.type}
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {components.length === 0 && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ zIndex: 3 }}
          >
            <div style={{ textAlign: 'center' }}>
              <p
                style={{
                  fontSize: 'var(--text-section-title)',
                  fontWeight: 'var(--weight-medium)',
                  color: 'var(--color-text-tertiary)',
                  marginBottom: 'var(--space-2)',
                }}
              >
                Drop components here to start building your funnel
              </p>
              <p className="text-helper">
                Click on a component from the sidebar to add it to the canvas
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
              zIndex: 4,
              background: 'var(--toolbar-bg)',
              backdropFilter: `blur(var(--toolbar-blur))`,
              WebkitBackdropFilter: `blur(var(--toolbar-blur))`,
              border: '1px solid var(--toolbar-border)',
              boxShadow: 'var(--toolbar-shadow)',
              borderRadius: 'var(--radius-full)',
              padding: 'var(--space-2) var(--space-4)',
              fontSize: 'var(--text-label)',
              fontWeight: 'var(--weight-medium)',
              color: 'var(--color-text-primary)',
            }}
          >
            Click on another component to connect
          </div>
        )}
      </div>
    </div>
  );
};
