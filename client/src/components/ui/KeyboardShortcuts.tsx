import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = [
  { key: 'Delete/Backspace', description: 'Delete selected component or connection' },
  { key: 'Esc', description: 'Deselect or exit mode' },
  { key: 'Ctrl/Cmd + S', description: 'Save scenario' },
  { key: 'Ctrl/Cmd + Z', description: 'Undo (planned)' },
  { key: 'Ctrl/Cmd + Y', description: 'Redo (planned)' },
  { key: 'Space + Drag', description: 'Pan canvas (planned)' },
  { key: 'Ctrl/Cmd + G', description: 'Toggle grid snap' },
  { key: 'C', description: 'Enter connection mode' },
  { key: '?', description: 'Show this help' },
];

export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: 'var(--shadow-xl)' }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Keyboard className="text-blue-400" size={24} />
            <h2 className="text-xl font-semibold">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-3">
            {shortcuts.map((shortcut, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <span className="text-gray-300">{shortcut.description}</span>
                <kbd className="px-3 py-1.5 text-sm font-mono bg-gray-900 text-gray-300 rounded border border-gray-600 shadow-sm">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
            <p className="text-sm text-blue-300">
              <strong>Tip:</strong> Press <kbd className="px-2 py-1 bg-gray-900 rounded text-xs">?</kbd> anytime to show this help dialog.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
