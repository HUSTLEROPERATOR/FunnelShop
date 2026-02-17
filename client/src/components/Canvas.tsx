import React from 'react';
import { Trash2 } from 'lucide-react';
import type { FunnelComponent } from '../types';

interface CanvasProps {
  components: FunnelComponent[];
  selectedId: string | null;
  onSelectComponent: (id: string) => void;
  onMoveComponent: (id: string, x: number, y: number) => void;
  onDeleteComponent: (id: string) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  components,
  selectedId,
  onSelectComponent,
  onMoveComponent,
  onDeleteComponent,
}) => {
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

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDeleteComponent(id);
  };

  return (
    <div
      className="flex-1 bg-gray-900 relative overflow-auto"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={{
        backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }}
    >
      <div className="relative min-h-full p-8">
        {components.map((component) => (
          <div
            key={component.id}
            draggable
            onDragStart={(e) => handleDragStart(e, component.id)}
            onClick={() => onSelectComponent(component.id)}
            className={`absolute cursor-move p-4 bg-gray-700 rounded-lg border-2 transition-all group ${
              selectedId === component.id
                ? 'border-blue-500 shadow-lg shadow-blue-500/50'
                : 'border-gray-600 hover:border-gray-500'
            }`}
            style={{
              left: `${component.position.x}px`,
              top: `${component.position.y}px`,
              minWidth: '150px',
            }}
          >
            <button
              onClick={(e) => handleDelete(e, component.id)}
              className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              title="Delete component (Delete/Backspace)"
            >
              <Trash2 size={14} />
            </button>
            <div className="text-sm font-medium">{component.name}</div>
            <div className="text-xs text-gray-400 mt-1">{component.type}</div>
          </div>
        ))}
        
        {components.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-xl mb-2">Drop components here to start building your funnel</p>
              <p className="text-sm">Click on a component from the sidebar to add it to the canvas</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
