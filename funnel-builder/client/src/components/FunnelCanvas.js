import React, { useMemo } from 'react';
import { useDrop } from 'react-dnd';
import FunnelComponent from './FunnelComponent';
import ConnectionLine from './ConnectionLine';

const FunnelCanvas = ({
  components,
  selectedComponent,
  onSelectComponent,
  onDrop,
  onAddComponent,
  onRemoveComponent
}) => {
  // Calculate connections between components
  const connections = useMemo(() => {
    if (components.length < 2) return [];
    
    // Sort components by vertical position
    const sortedComponents = [...components].sort((a, b) => a.position.y - b.position.y);
    
    // Create connections between consecutive components
    const lines = [];
    for (let i = 0; i < sortedComponents.length - 1; i++) {
      const fromComp = sortedComponents[i];
      const toComp = sortedComponents[i + 1];
      
      // Calculate center points of components (approximate)
      const from = {
        x: fromComp.position.x + 110, // ~half of min-width (220px)
        y: fromComp.position.y + 60   // approximate component height
      };
      const to = {
        x: toComp.position.x + 110,
        y: toComp.position.y
      };
      
      lines.push({ from, to, id: `${fromComp.id}-${toComp.id}` });
    }
    
    return lines;
  }, [components]);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'component',
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset();
      const canvasRect = monitor.getDropResult()?.getBoundingClientRect();
      
      if (offset && canvasRect) {
        const position = {
          x: offset.x - canvasRect.left,
          y: offset.y - canvasRect.top
        };
        
        if (item.id) {
          // Moving existing component
          onDrop(item, monitor);
        } else {
          // Adding new component
          onAddComponent(item.type, position);
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div 
      ref={drop}
      className={`funnel-canvas ${isOver ? 'drag-over' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onSelectComponent(null);
        }
      }}
    >
      <div className="canvas-background">
        <div className="grid-pattern"></div>
        <div className="canvas-instructions">
          {components.length === 0 ? (
            <div className="empty-state">
              <h3>🎯 Start Building Your Funnel</h3>
              <p>Drag components from the sidebar to create your marketing funnel</p>
              <div className="empty-state-features">
                <div className="empty-state-feature">
                  ✨ Drag & Drop components to the canvas
                </div>
                <div className="empty-state-feature">
                  🎨 Configure each component's properties
                </div>
                <div className="empty-state-feature">
                  📊 Watch live metrics update in real-time
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      
      {/* Draw connection lines */}
      {connections.map((connection) => (
        <ConnectionLine
          key={connection.id}
          from={connection.from}
          to={connection.to}
          color="#a0aec0"
        />
      ))}
      
      {components.map((component) => (
        <FunnelComponent
          key={component.id}
          component={component}
          isSelected={selectedComponent?.id === component.id}
          onSelect={() => onSelectComponent(component)}
          onRemove={() => onRemoveComponent(component.id)}
        />
      ))}
    </div>
  );
};

export default FunnelCanvas;