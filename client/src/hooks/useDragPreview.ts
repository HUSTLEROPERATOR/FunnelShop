import { useEffect, type RefObject } from 'react';

interface DragPreviewOptions {
  opacity?: number;
  scale?: number;
  rotation?: number;
}

export const useDragPreview = (
  elementRef: RefObject<HTMLElement>,
  isDragging: boolean,
  options: DragPreviewOptions = {}
) => {
  const { opacity = 0.7, scale = 1.05, rotation = 2 } = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (isDragging) {
      element.style.opacity = opacity.toString();
      element.style.transform = `rotate(${rotation}deg) scale(${scale})`;
      element.style.boxShadow = 'var(--shadow-drag)';
      element.style.cursor = 'grabbing';
    } else {
      element.style.opacity = '1';
      element.style.transform = '';
      element.style.boxShadow = '';
      element.style.cursor = '';
    }
  }, [isDragging, elementRef, opacity, scale, rotation]);
};
