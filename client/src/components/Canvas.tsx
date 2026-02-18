import React, { useState, useCallback, memo } from 'react';
import type { FunnelComponent, Connection } from '../types';
import { ConnectionLine } from './ConnectionLine';
import { Grid, Trash2, HelpCircle } from 'lucide-react';

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
  snapToGrid?: (x: number, y: number) => { x: number; y: number };
  snapEnabled?: boolean;
  onToggleSnap?: () => void;
  onClearAll?: () => void;
  onShowHelp?: () => void;
}

const ComponentCard = memo(({ 
  component, 
  isSelected, 
  isConnecting, 
  connectionMode,
  onClick,
  onDragStart
}: {
  component: FunnelComponent;
  isSelected: boolean;
  isConnecting: boolean;
  connectionMode: boolean;
  onClick: (e: React.MouseEvent) => void;
  onDragStart: (e: React.DragEvent) => void;
}) => {
  const [isDragging, setIsDragging] = useState(false);
  
  const getComponentColor = (type: string) => {
    const colors: Record<string, { main: string; dark: string }> = {
      'google-ads': { main: '#ea4335', dark: '#c5221f' },
      'facebook-ads': { main: '#1877f2', dark: '#0c63d4' },
      'landing-page': { main: '#8b5cf6', dark: '#7c3aed' },
      'booking-form': { main: '#10b981', dark: '#059669' },
      'email-campaign': { main: '#f59e0b', dark: '#d97706' },
    };
    return colors[type] || { main: '#6b7280', dark: '#4b5563' };
  };

  const colors = getComponentColor(component.type);

  return (
    <div
      draggable={!connectionMode}
      onDragStart={(e) => {
        setIsDragging(true);
        onDragStart(e);
      }}
      onDragEnd={() => setIsDragging(false)}
      onClick={onClick}
      className={`absolute component-card rounded-lg border-2 transition-all ${
        isConnecting
          ? 'border-green-500 shadow-lg shadow-green-500/50 scale-105'
          : isSelected
          ? 'border-blue-500 shadow-lg shadow-blue-500/50'
          : 'border-gray-600 hover:border-gray-500'
      } ${connectionMode ? 'cursor-pointer' : 'cursor-move'} ${
        isDragging ? 'dragging' : ''
      }`}
      style={{
        left: `${component.position.x}px`,
        top: `${component.position.y}px`,
        minWidth: '150px',
        boxShadow: isDragging ? 'var(--shadow-drag)' : 'var(--shadow-idle)',
        background: `linear-gradient(135deg, ${colors.main}, ${colors.dark})`,
      }}
    >
      {/* Connection point - top */}
      <div 
        className="connection-point absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"
        style={{ zIndex: 10 }}
      />
      
      <div className="p-4">
        <div className="text-sm font-medium text-white">{component.name}</div>
        <div className="text-xs text-white/70 mt-1">{component.type}</div>
      </div>
      
      {/* Connection point - bottom */}
      <div 
        className="connection-point absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"
        style={{ zIndex: 10 }}
      />
    </div>
  );
});

ComponentCard.displayName = 'ComponentCard';

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
  snapToGrid,
  snapEnabled = false,
  onToggleSnap,
  onClearAll,
  onShowHelp,
}) => {
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('componentId', id);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const componentId = e.dataTransfer.getData('componentId');
    if (componentId) {
      const rect = e.currentTarget.getBoundingClientRect();
      let x = e.clientX - rect.left - 75;
      let y = e.clientY - rect.top - 40;
      
      if (snapToGrid) {
        const snapped = snapToGrid(x, y);
        x = snapped.x;
        y = snapped.y;
      }
      
      onMoveComponent(componentId, x, y);
    }
  }, [onMoveComponent, snapToGrid]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleComponentClick = useCallback((e: React.MouseEvent, componentId: string) => {
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
  }, [connectionMode, connectingFrom, onCreateConnection, onSelectComponent]);

  const handleCanvasClick = useCallback(() => {
    if (connectionMode && connectingFrom) {
      setConnectingFrom(null);
    }
  }, [connectionMode, connectingFrom]);

  const handleClearAll = useCallback(() => {
    if (onClearAll && window.confirm('Are you sure you want to clear all components? This action cannot be undone.')) {
      onClearAll();
    }
  }, [onClearAll]);

  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      {/* Toolbar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center gap-3">
        {onToggleSnap && (
          <button
            onClick={onToggleSnap}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
              snapEnabled
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            <Grid size={16} />
            Snap to Grid
          </button>
        )}
        
        {onClearAll && components.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-red-600 rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
          >
            <Trash2 size={16} />
            Clear All
          </button>
        )}
        
        <div className="flex-1" />
        
        {onShowHelp && (
          <button
            onClick={onShowHelp}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300 transition-colors"
            title="Keyboard shortcuts"
          >
            <HelpCircle size={16} />
            Help
          </button>
        )}
      </div>

      {/* Canvas area */}
      <div
        className={`flex-1 relative overflow-auto ${isDragOver ? 'drop-zone-active' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleCanvasClick}
        style={{
          backgroundImage: snapEnabled 
            ? 'radial-gradient(circle, #475569 1.5px, transparent 1.5px)'
            : 'radial-gradient(circle, #334155 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        <div className="relative min-h-full p-8">
          {/* SVG layer for connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            <g className="pointer-events-auto">
              {connections.map((connection) => (
                <ConnectionLine
                  key={connection.id}
                  connection={connection}
                  components={components}
                  isSelected={selectedConnectionId === connection.id}
                  onSelect={() => onSelectConnection(connection.id)}
                />
              ))}
            </g>
          </svg>

          {/* Components layer */}
          <div className="relative" style={{ zIndex: 2 }}>
            {components.map((component) => (
              <ComponentCard
                key={component.id}
                component={component}
                isSelected={selectedId === component.id}
                isConnecting={connectionMode && connectingFrom === component.id}
                connectionMode={connectionMode}
                onClick={(e) => handleComponentClick(e, component.id)}
                onDragStart={(e) => handleDragStart(e, component.id)}
              />
            ))}
          </div>
          
          {components.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 3 }}>
              <div className="text-center text-gray-500">
                <p className="text-xl mb-2">Drop components here to start building your funnel</p>
                <p className="text-sm">Click on a component from the sidebar to add it to the canvas</p>
              </div>
            </div>
          )}

          {connectionMode && connectingFrom && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse" style={{ zIndex: 4 }}>
              Click on another component to connect
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
