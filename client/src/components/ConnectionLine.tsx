import React from 'react';
import type { Connection, FunnelComponent } from '../types';

interface ConnectionLineProps {
  connection: Connection;
  components: FunnelComponent[];
  isSelected: boolean;
  onSelect: () => void;
}

export const ConnectionLine: React.FC<ConnectionLineProps> = ({
  connection,
  components,
  isSelected,
  onSelect,
}) => {
  const sourceComponent = components.find((c) => c.id === connection.sourceId);
  const targetComponent = components.find((c) => c.id === connection.targetId);

  if (!sourceComponent || !targetComponent) {
    return null;
  }

  // Calculate connection points (center-right of source to center-left of target)
  const sourceX = sourceComponent.position.x + 150; // Component width
  const sourceY = sourceComponent.position.y + 40; // Half component height
  const targetX = targetComponent.position.x;
  const targetY = targetComponent.position.y + 40;

  // Create a curved path
  const midX = (sourceX + targetX) / 2;
  const pathD = `M ${sourceX} ${sourceY} Q ${midX} ${sourceY}, ${midX} ${(sourceY + targetY) / 2} T ${targetX} ${targetY}`;

  const strokeColor = isSelected ? '#3b82f6' : '#c4c9d4';

  return (
    <g>
      {/* Invisible wider path for easier clicking */}
      <path
        d={pathD}
        fill="none"
        stroke="transparent"
        strokeWidth="20"
        style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
        onClick={onSelect}
      />
      {/* Visible path */}
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth={isSelected ? '2.5' : '1.5'}
        strokeDasharray={isSelected ? 'none' : 'none'}
        markerEnd={`url(#arrowhead-${isSelected ? 'selected' : 'default'})`}
        style={{ pointerEvents: 'none' }}
      />
      {/* Arrow markers */}
      <defs>
        <marker
          id="arrowhead-default"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon points="0 0, 10 3, 0 6" fill="#c4c9d4" />
        </marker>
        <marker
          id="arrowhead-selected"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon points="0 0, 10 3, 0 6" fill="#3b82f6" />
        </marker>
      </defs>
    </g>
  );
};
