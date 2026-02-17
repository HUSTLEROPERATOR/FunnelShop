import React from 'react';

/**
 * Draws a curved connection line between two points
 */
const ConnectionLine = ({ from, to, color = '#cbd5e0' }) => {
  if (!from || !to) return null;

  // Calculate control points for a smooth curve
  const controlPointOffset = Math.abs(to.x - from.x) * 0.5;
  const cp1x = from.x + controlPointOffset;
  const cp1y = from.y;
  const cp2x = to.x - controlPointOffset;
  const cp2y = to.y;

  const path = `M ${from.x} ${from.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${to.x} ${to.y}`;

  return (
    <svg
      className="connection-line"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0
      }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 10 3, 0 6" fill={color} />
        </marker>
      </defs>
      <path
        d={path}
        stroke={color}
        strokeWidth="2"
        fill="none"
        markerEnd="url(#arrowhead)"
        className="connection-path"
      />
    </svg>
  );
};

export default ConnectionLine;
