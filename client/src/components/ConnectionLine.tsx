import React from 'react';
import type { Connection, FunnelComponent } from '../types';

interface ConnectionLineProps {
  connection: Connection;
  components: FunnelComponent[];
  isSelected: boolean;
  onSelect: () => void;
}

const CARD_WIDTH = 180;
const CARD_HEIGHT = 88; // approx height of upgraded card (3px strip + ~85px body)

export const ConnectionLine: React.FC<ConnectionLineProps> = ({
  connection,
  components,
  isSelected,
  onSelect,
}) => {
  const sourceComponent = components.find((c) => c.id === connection.sourceId);
  const targetComponent = components.find((c) => c.id === connection.targetId);

  if (!sourceComponent || !targetComponent) return null;

  // Exit: right-center of source card
  const sx = sourceComponent.position.x + CARD_WIDTH;
  const sy = sourceComponent.position.y + CARD_HEIGHT / 2;

  // Entry: left-center of target card
  const tx = targetComponent.position.x;
  const ty = targetComponent.position.y + CARD_HEIGHT / 2;

  // Cubic bezier control points — horizontal tension proportional to distance
  const dx = Math.abs(tx - sx);
  const tension = Math.max(60, dx * 0.45);
  const c1x = sx + tension;
  const c1y = sy;
  const c2x = tx - tension;
  const c2y = ty;

  const pathD = `M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${tx} ${ty}`;

  const strokeColor = isSelected ? '#3b82f6' : '#c4c9d4';
  const strokeWidth = isSelected ? 2 : 1.5;
  const markerId = isSelected ? 'arrow-selected' : 'arrow-default';

  return (
    <g>
      {/* Wide invisible hit area */}
      <path
        d={pathD}
        fill="none"
        stroke="transparent"
        strokeWidth="20"
        style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
        onClick={onSelect}
      />
      {/* Subtle glow for selected */}
      {isSelected && (
        <path
          d={pathD}
          fill="none"
          stroke="rgba(59, 130, 246, 0.18)"
          strokeWidth="6"
          strokeLinecap="round"
          style={{ pointerEvents: 'none' }}
        />
      )}
      {/* Visible path */}
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        markerEnd={`url(#${markerId})`}
        style={{
          pointerEvents: 'none',
          transition: 'stroke 150ms ease, stroke-width 150ms ease',
        }}
      />
    </g>
  );
};
