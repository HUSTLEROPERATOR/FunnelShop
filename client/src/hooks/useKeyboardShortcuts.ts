import { useEffect, useCallback } from 'react';

interface KeyboardShortcutsConfig {
  onDelete?: () => void;
  onSave?: () => void;
  onEscape?: () => void;
  onToggleGrid?: () => void;
  onToggleConnect?: () => void;
  onShowHelp?: () => void;
}

export const useKeyboardShortcuts = (config: KeyboardShortcutsConfig) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in input fields
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }

    // Delete/Backspace
    if ((event.key === 'Delete' || event.key === 'Backspace') && config.onDelete) {
      event.preventDefault();
      config.onDelete();
    }

    // Escape
    if (event.key === 'Escape' && config.onEscape) {
      event.preventDefault();
      config.onEscape();
    }

    // Ctrl/Cmd + S (Save)
    if ((event.ctrlKey || event.metaKey) && event.key === 's' && config.onSave) {
      event.preventDefault();
      config.onSave();
    }

    // Ctrl/Cmd + G (Toggle Grid)
    if ((event.ctrlKey || event.metaKey) && event.key === 'g' && config.onToggleGrid) {
      event.preventDefault();
      config.onToggleGrid();
    }

    // C (Connection mode)
    if (event.key === 'c' && config.onToggleConnect) {
      event.preventDefault();
      config.onToggleConnect();
    }

    // ? (Show help)
    if (event.key === '?' && config.onShowHelp) {
      event.preventDefault();
      config.onShowHelp();
    }
  }, [config]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};
