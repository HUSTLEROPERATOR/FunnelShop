import { useEffect } from 'react';
import { getEmptyImage } from 'react-dnd-html5-backend';

/**
 * Custom hook to create a custom drag preview
 * This removes the default browser drag preview and allows for custom styling
 */
export function useDragPreview(drag, preview) {
  useEffect(() => {
    if (preview) {
      // Use empty image as a drag preview to hide the default one
      preview(getEmptyImage(), { captureDraggingState: true });
    }
  }, [preview]);

  return drag;
}
