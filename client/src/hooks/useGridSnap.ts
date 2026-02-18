import { useState, useCallback } from 'react';

export const useGridSnap = (gridSize: number = 20) => {
  const [snapEnabled, setSnapEnabled] = useState(false);

  const snapToGrid = useCallback((x: number, y: number) => {
    if (!snapEnabled) {
      return { x, y };
    }
    
    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize,
    };
  }, [snapEnabled, gridSize]);

  const toggleSnap = useCallback(() => {
    setSnapEnabled(prev => !prev);
  }, []);

  return {
    snapEnabled,
    toggleSnap,
    snapToGrid,
  };
};
