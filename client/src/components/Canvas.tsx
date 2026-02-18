import React, { useState, useCallback } from 'react';
import type { FunnelComponent, Connection } from '../types';
import { ConnectionLine } from './ConnectionLine';
import { CanvasNode } from './CanvasNode';
import { CanvasToolbar } from './CanvasToolbar';

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
  gridEnabled: boolean;
  onToggleGrid: () => void;
  onClearAll: () => void;
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
  gridEnabled,
  onToggleGrid,
  onClearAll,
}) => {
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const snapToGrid = useCallback((value: number) => {
    if (!gridEnabled) return value;
    const gridSize = 20;
    return Math.round(value / gridSize) * gridSize;
  }, [gridEnabled]);

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('componentId', id);
    setDraggingId(id);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const componentId = e.dataTransfer.getData('componentId');
    if (componentId) {
      const rect = e.currentTarget.getBoundingClientRect();
      const rawX = e.clientX - rect.left - 75; // Center the component (150px width / 2)
      const rawY = e.clientY - rect.top - 40; // Center the component (80px height / 2)
      const x = snapToGrid(Math.max(0, rawX));
      const y = snapToGrid(Math.max(0, rawY));
      onMoveComponent(componentId, x, y);
    }
    setDraggingId(null);
  }, [snapToGrid, onMoveComponent]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only set false if we're actually leaving the canvas
    if (e.currentTarget === e.target) {
      setIsDraggingOver(false);
    }
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
    if (connectionMode) {
      if (connectingFrom) {
        setConnectingFrom(null);
      }
    } else {
      // Clear selection when clicking canvas
      onSelectComponent('');
      onSelectConnection('');
    }
  }, [connectionMode, connectingFrom, onSelectComponent, onSelectConnection]);

  const totalBudget = components.reduce((sum, comp) => {
    const budget = comp.properties.budget;
    return sum + (typeof budget === 'number' ? budget : 0);
  }, 0);

  return (
    <div
      className={`flex-1 bg-gray-900 relative overflow-auto transition-all ${
        isDraggingOver ? 'canvas-drop-zone-active' : ''
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleCanvasClick}
      style={{
        backgroundImage: gridEnabled
          ? 'radial-gradient(circle, #475569 1px, transparent 1px)'
          : 'radial-gradient(circle, #334155 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        cursor: connectionMode ? 'crosshair' : 'default',
      }}
    >
      <CanvasToolbar
        gridEnabled={gridEnabled}
        onToggleGrid={onToggleGrid}
        onClearAll={onClearAll}
        componentCount={components.length}
        totalBudget={totalBudget}
      />

      <div className="relative min-h-full p-8">
        {/* SVG layer for connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
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
        <div className="relative" style={{ zIndex: 2 }} onDragEnd={handleDragEnd}>
          {components.map((component) => (
            <CanvasNode
              key={component.id}
              component={component}
              isSelected={selectedId === component.id}
              isConnecting={connectionMode && connectingFrom === component.id}
              isDragging={draggingId === component.id}
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
  );
};
