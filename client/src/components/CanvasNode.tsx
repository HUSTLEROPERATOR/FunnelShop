import React, { memo } from 'react';
import type { FunnelComponent } from '../types';

interface CanvasNodeProps {
  component: FunnelComponent;
  isSelected: boolean;
  isConnecting: boolean;
  isDragging: boolean;
  connectionMode: boolean;
  onClick: (e: React.MouseEvent) => void;
  onDragStart: (e: React.DragEvent) => void;
}

const componentColors: Record<string, { bg: string; bgDark: string; border: string }> = {
  'google-ads': {
    bg: 'var(--color-google-ads)',
    bgDark: 'var(--color-google-ads-dark)',
    border: '#4285f4',
  },
  'facebook-ads': {
    bg: 'var(--color-facebook-ads)',
    bgDark: 'var(--color-facebook-ads-dark)',
    border: '#1877f2',
  },
  'landing-page': {
    bg: 'var(--color-landing-page)',
    bgDark: 'var(--color-landing-page-dark)',
    border: '#10b981',
  },
  'booking-form': {
    bg: 'var(--color-booking-form)',
    bgDark: 'var(--color-booking-form-dark)',
    border: '#8b5cf6',
  },
  'email-campaign': {
    bg: 'var(--color-email-campaign)',
    bgDark: 'var(--color-email-campaign-dark)',
    border: '#f59e0b',
  },
};

export const CanvasNode: React.FC<CanvasNodeProps> = memo(({
  component,
  isSelected,
  isConnecting,
  isDragging,
  connectionMode,
  onClick,
  onDragStart,
}) => {
  const colors = componentColors[component.type] || {
    bg: 'var(--color-bg-medium)',
    bgDark: 'var(--color-bg-dark)',
    border: '#475569',
  };

  const getClassName = () => {
    const base = 'absolute p-4 rounded-lg border-2 transition-all select-none';
    const cursor = connectionMode ? 'cursor-pointer' : 'cursor-move';
    
    if (isConnecting) {
      return `${base} ${cursor} border-green-500 canvas-node-connecting`;
    }
    if (isSelected) {
      return `${base} ${cursor} border-blue-400 canvas-node-selected`;
    }
    return `${base} ${cursor} border-gray-600 canvas-node-idle`;
  };

  const getStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      left: `${component.position.x}px`,
      top: `${component.position.y}px`,
      minWidth: '150px',
      background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.bgDark} 100%)`,
      borderColor: isSelected ? '#60a5fa' : isConnecting ? '#10b981' : colors.border,
    };

    if (isDragging) {
      return {
        ...baseStyle,
        transform: 'rotate(2deg)',
        opacity: 0.7,
        boxShadow: 'var(--shadow-drag)',
      };
    }

    return baseStyle;
  };

  return (
    <div
      draggable={!connectionMode}
      onDragStart={onDragStart}
      onClick={onClick}
      className={getClassName()}
      style={getStyle()}
    >
      {/* Connection points (visible on hover) */}
      <div className="canvas-node-connection-point top" />
      <div className="canvas-node-connection-point bottom" />
      
      <div className="text-sm font-medium text-white">{component.name}</div>
      <div className="text-xs text-gray-300 mt-1">{component.type}</div>
    </div>
  );
});

CanvasNode.displayName = 'CanvasNode';
