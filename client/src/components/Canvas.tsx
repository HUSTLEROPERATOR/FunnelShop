import React, { useState } from 'react';
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
    if (connectionMode && connectingFrom) {
      setConnectingFrom(null);
    }
  };

  return (
    <div
      className="flex-1 bg-gray-900 relative overflow-auto"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={handleCanvasClick}
      style={{
        backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)',
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
            <div
              key={component.id}
              draggable={!connectionMode}
              onDragStart={(e) => handleDragStart(e, component.id)}
              onClick={(e) => handleComponentClick(e, component.id)}
              className={`absolute p-4 bg-gray-700 rounded-lg border-2 transition-all ${
                connectionMode && connectingFrom === component.id
                  ? 'border-green-500 shadow-lg shadow-green-500/50'
                  : selectedId === component.id
                  ? 'border-blue-500 shadow-lg shadow-blue-500/50'
                  : 'border-gray-600 hover:border-gray-500'
              } ${connectionMode ? 'cursor-pointer' : 'cursor-move'}`}
              style={{
                left: `${component.position.x}px`,
                top: `${component.position.y}px`,
                minWidth: '150px',
              }}
            >
              <div className="text-sm font-medium">{component.name}</div>
              <div className="text-xs text-gray-400 mt-1">{component.type}</div>
            </div>
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
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg" style={{ zIndex: 4 }}>
            Click on another component to connect
          </div>
        )}
      </div>
    </div>
  );
};
