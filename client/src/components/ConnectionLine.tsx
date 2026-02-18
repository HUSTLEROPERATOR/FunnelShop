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

  // Calculate connection points (bottom of source to top of target)
  const componentWidth = 150;
  const componentHeight = 80;
  
  const sourceX = sourceComponent.position.x + componentWidth / 2;
  const sourceY = sourceComponent.position.y + componentHeight;
  const targetX = targetComponent.position.x + componentWidth / 2;
  const targetY = targetComponent.position.y;

  // Create a smooth Bezier curve
  const dy = targetY - sourceY;
  const controlPointOffset = Math.max(Math.abs(dy) * 0.5, 50);
  
  const pathD = `M ${sourceX} ${sourceY} C ${sourceX} ${sourceY + controlPointOffset}, ${targetX} ${targetY - controlPointOffset}, ${targetX} ${targetY}`;

  return (
    <g onClick={onSelect} style={{ cursor: 'pointer' }}>
      {/* Invisible wider path for easier clicking */}
      <path
        d={pathD}
        fill="none"
        stroke="transparent"
        strokeWidth="20"
      />
      {/* Glow effect for selected */}
      {isSelected && (
        <path
          d={pathD}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="6"
          opacity="0.3"
          style={{
            filter: 'blur(4px)',
          }}
        />
      )}
      {/* Visible path with gradient */}
      <path
        d={pathD}
        fill="none"
        stroke={isSelected ? 'url(#selectedGradient)' : 'url(#defaultGradient)'}
        strokeWidth={isSelected ? '3' : '2'}
        strokeDasharray={isSelected ? '0' : '5,5'}
        markerEnd={`url(#arrowhead-${isSelected ? 'selected' : 'default'})`}
        style={{
          transition: 'all 0.3s ease',
        }}
      />
      {/* Animated flow indicator when selected */}
      {isSelected && (
        <circle r="4" fill="#3b82f6">
          <animateMotion
            dur="2s"
            repeatCount="indefinite"
            path={pathD}
          />
        </circle>
      )}
      {/* Arrow markers and gradients */}
      <defs>
        <linearGradient id="selectedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="defaultGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6b7280" />
          <stop offset="100%" stopColor="#4b5563" />
        </linearGradient>
        <marker
          id="arrowhead-selected"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon
            points="0 0, 10 3, 0 6"
            fill="#3b82f6"
          />
        </marker>
        <marker
          id="arrowhead-default"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon
            points="0 0, 10 3, 0 6"
            fill="#6b7280"
          />
        </marker>
      </defs>
    </g>
  );
};
