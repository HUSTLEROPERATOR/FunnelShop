import React from 'react';
import { useDrop } from 'react-dnd';
import FunnelComponent from './FunnelComponent';

const FunnelCanvas = ({
  components,
  selectedComponent,
  onSelectComponent,
  onDrop,
  onAddComponent,
  onRemoveComponent,
  onDuplicateComponent
}) => {
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
      
      {components.map((component) => (
        <FunnelComponent
          key={component.id}
          component={component}
          isSelected={selectedComponent?.id === component.id}
          onSelect={() => onSelectComponent(component)}
          onRemove={() => onRemoveComponent(component.id)}
          onDuplicate={() => onDuplicateComponent(component)}
        />
      ))}
    </div>
  );
};

export default FunnelCanvas;