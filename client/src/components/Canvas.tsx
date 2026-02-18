import React, { useState } from 'react';
import { Grid3x3, Link2, Trash2, HelpCircle, BarChart3 } from 'lucide-react';
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
  onDeleteComponent: (id: string) => void;
  onDeleteConnection: (id: string) => void;
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
  onDeleteComponent,
  onDeleteConnection,
}) => {
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [localConnectionMode, setLocalConnectionMode] = useState(connectionMode);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('componentId', id);
    setDraggingId(id);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const componentId = e.dataTransfer.getData('componentId');
    if (componentId) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left - 90; // Center the component (180px width / 2)
      const y = e.clientY - rect.top - 40; // Center the component (80px height / 2)
      onMoveComponent(componentId, x, y);
    }
    setDraggingId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleComponentClick = (e: React.MouseEvent, componentId: string) => {
    e.stopPropagation();
    
    if (localConnectionMode || connectionMode) {
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
    if (localConnectionMode || connectionMode) {
      if (connectingFrom) {
        setConnectingFrom(null);
      }
    } else {
      // Clear selection when clicking canvas
      onSelectComponent('');
      onSelectConnection('');
    }
  };

  const toggleConnectionMode = () => {
    setLocalConnectionMode(!localConnectionMode);
    setConnectingFrom(null);
  };

  const handleClearCanvas = () => {
    if (window.confirm('Are you sure you want to clear the entire canvas?')) {
      components.forEach(comp => onDeleteComponent(comp.id));
    }
  };

  const getComponentGradient = (type: string): string => {
    const gradients: Record<string, string> = {
      'google-ads': 'from-blue-500 to-green-500',
      'facebook-ads': 'from-blue-600 to-blue-700',
      'landing-page': 'from-purple-500 to-purple-600',
      'booking-form': 'from-green-500 to-green-600',
      'email-campaign': 'from-yellow-500 to-orange-600',
    };
    return gradients[type] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Floating Toolbar - Pill Style */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-lg px-3 py-2">
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`p-2 rounded-lg transition-all ${showGrid ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
          title="Toggle Grid"
        >
          <Grid3x3 size={16} />
        </button>
        <div className="w-px h-5 bg-gray-300"></div>
        <button
          onClick={toggleConnectionMode}
          className={`p-2 rounded-lg transition-all ${localConnectionMode || connectionMode ? 'bg-green-100 text-green-600' : 'text-gray-600 hover:bg-gray-100'}`}
          title="Connection Mode"
        >
          <Link2 size={16} />
        </button>
        {(selectedId || selectedConnectionId) && (
          <>
            <div className="w-px h-5 bg-gray-300"></div>
            <button
              onClick={() => {
                if (selectedId) {
                  onDeleteComponent(selectedId);
                } else if (selectedConnectionId) {
                  onDeleteConnection(selectedConnectionId);
                }
              }}
              className="p-2 rounded-lg text-red-600 hover:bg-red-100 transition-all"
              title="Delete Selected"
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
        <div className="w-px h-5 bg-gray-300"></div>
        <button
          onClick={handleClearCanvas}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all"
          title="Clear Canvas"
        >
          <Trash2 size={16} />
        </button>
        <button
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all"
          title="Keyboard Shortcuts"
        >
          <HelpCircle size={16} />
        </button>
        <button
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all"
          title="Show Stats"
        >
          <BarChart3 size={16} />
        </button>
      </div>

      {/* Canvas Area */}
      <div
        className="flex-1 relative overflow-auto"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleCanvasClick}
        style={{
          backgroundImage: showGrid 
            ? 'radial-gradient(circle, rgba(0, 0, 0, 0.05) 1px, transparent 1px)' 
            : 'none',
          backgroundSize: '20px 20px',
          cursor: localConnectionMode || connectionMode ? 'crosshair' : 'default',
          backgroundColor: '#fafafa',
        }}
      >
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
          <div className="relative" style={{ zIndex: 2 }}>
            {components.map((component) => {
              const isSelected = selectedId === component.id;
              const isDragging = draggingId === component.id;
              const isHovered = hoveredId === component.id;
              const isConnecting = (localConnectionMode || connectionMode) && connectingFrom === component.id;
              
              return (
                <div
                  key={component.id}
                  draggable={!localConnectionMode && !connectionMode}
                  onDragStart={(e) => handleDragStart(e, component.id)}
                  onDragEnd={handleDragEnd}
                  onClick={(e) => handleComponentClick(e, component.id)}
                  onMouseEnter={() => setHoveredId(component.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`node-component absolute bg-white rounded-xl border-2 overflow-hidden
                    ${isConnecting
                      ? 'border-green-500 shadow-lg scale-105'
                      : isSelected
                      ? 'border-blue-500 selected'
                      : 'border-gray-200'
                    } 
                    ${isDragging ? 'dragging' : ''}
                    ${(localConnectionMode || connectionMode) ? 'cursor-pointer' : 'cursor-move'}
                  `}
                  style={{
                    left: `${component.position.x}px`,
                    top: `${component.position.y}px`,
                    minWidth: '180px',
                  }}
                >
                  {/* Gradient Header */}
                  <div className={`bg-gradient-to-r ${getComponentGradient(component.type)} px-4 py-2`}>
                    <div className="text-sm font-semibold text-white">{component.name}</div>
                  </div>
                  
                  {/* Body */}
                  <div className="px-4 py-3 bg-white">
                    <div className="text-xs text-gray-500">{component.type}</div>
                  </div>
                  
                  {/* Connection Points - show on hover */}
                  {(isHovered || isSelected || isConnecting) && (
                    <>
                      {/* Left connection point */}
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 border-blue-500 shadow-sm"></div>
                      {/* Right connection point */}
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 border-blue-500 shadow-sm"></div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
          
          {components.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 3 }}>
              <div className="text-center text-gray-400">
                <p className="text-lg font-medium mb-2">Start building your funnel</p>
                <p className="text-sm">Click on components in the sidebar to add them to the canvas</p>
              </div>
            </div>
          )}

          {(localConnectionMode || connectionMode) && connectingFrom && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium" style={{ zIndex: 4 }}>
              Click another component to create connection
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
