import React, { useState } from 'react';
import { Grid3x3, Trash2, HelpCircle, X } from 'lucide-react';

interface CanvasToolbarProps {
  gridEnabled: boolean;
  onToggleGrid: () => void;
  onClearAll: () => void;
  componentCount: number;
  totalBudget: number;
}

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  gridEnabled,
  onToggleGrid,
  onClearAll,
  componentCount,
  totalBudget,
}) => {
  const [showHelp, setShowHelp] = useState(false);

  const handleClearAll = () => {
    if (componentCount === 0) {
      return;
    }
    if (confirm(`Are you sure you want to clear all ${componentCount} components? This cannot be undone.`)) {
      onClearAll();
    }
  };

  return (
    <>
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {/* Live stats */}
        <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-lg px-4 py-2 text-sm">
          <span className="text-gray-400">Components:</span>{' '}
          <span className="text-white font-semibold">{componentCount}</span>
          <span className="text-gray-400 mx-2">|</span>
          <span className="text-gray-400">Budget:</span>{' '}
          <span className="text-green-400 font-semibold">${totalBudget.toLocaleString()}</span>
        </div>

        {/* Grid toggle */}
        <button
          onClick={onToggleGrid}
          className={`p-2 rounded-lg transition-all ${
            gridEnabled
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
              : 'bg-gray-800/90 hover:bg-gray-700 text-gray-300'
          } backdrop-blur-sm border border-gray-700`}
          title={`Grid: ${gridEnabled ? 'ON (G)' : 'OFF (G)'}`}
        >
          <Grid3x3 size={18} />
        </button>

        {/* Clear all */}
        <button
          onClick={handleClearAll}
          disabled={componentCount === 0}
          className="p-2 rounded-lg transition-all bg-gray-800/90 hover:bg-red-600 text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm border border-gray-700"
          title="Clear All (Ctrl+Shift+Delete)"
        >
          <Trash2 size={18} />
        </button>

        {/* Help */}
        <button
          onClick={() => setShowHelp(true)}
          className="p-2 rounded-lg transition-all bg-gray-800/90 hover:bg-gray-700 text-gray-300 backdrop-blur-sm border border-gray-700"
          title="Keyboard Shortcuts"
        >
          <HelpCircle size={18} />
        </button>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowHelp(false)}>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Keyboard Shortcuts</h3>
              <button onClick={() => setShowHelp(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-gray-700">
                <span className="text-gray-300">Delete selected</span>
                <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Delete / Backspace</kbd>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-700">
                <span className="text-gray-300">Deselect / Cancel</span>
                <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Esc</kbd>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-700">
                <span className="text-gray-300">Toggle grid snap</span>
                <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">G</kbd>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-700">
                <span className="text-gray-300">Duplicate component</span>
                <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Ctrl + D</kbd>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-300">Clear all</span>
                <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Ctrl + Shift + Delete</kbd>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              Note: Shortcuts are disabled when typing in input fields
            </p>
          </div>
        </div>
      )}
    </>
  );
};
