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

  return (
    <g onClick={onSelect} style={{ cursor: 'pointer' }}>
      {/* Invisible wider path for easier clicking */}
      <path
        d={pathD}
        fill="none"
        stroke="transparent"
        strokeWidth="20"
      />
      {/* Visible path */}
      <path
        d={pathD}
        fill="none"
        stroke={isSelected ? '#3b82f6' : '#6b7280'}
        strokeWidth={isSelected ? '3' : '2'}
        markerEnd="url(#arrowhead)"
      />
      {/* Arrow marker */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon
            points="0 0, 10 3, 0 6"
            fill={isSelected ? '#3b82f6' : '#6b7280'}
          />
        </marker>
      </defs>
    </g>
  );
};
