import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

const KeyboardShortcuts = () => {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts = [
    { keys: ['Delete', 'Backspace'], description: 'Delete selected component' },
    { keys: ['Esc'], description: 'Deselect component' },
    { keys: ['G'], description: 'Toggle snap to grid' },
    { keys: ['Ctrl', 'D'], description: 'Duplicate selected component' },
    { keys: ['Ctrl', 'Shift', 'Delete'], description: 'Clear all components' },
  ];

  return (
    <>
      <button
        className="keyboard-shortcuts-button"
        onClick={() => setIsOpen(true)}
        title="Keyboard Shortcuts"
      >
        <HelpCircle size={20} />
      </button>

      {isOpen && (
        <div className="shortcuts-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="shortcuts-modal" onClick={(e) => e.stopPropagation()}>
            <div className="shortcuts-header">
              <h3>⌨️ Keyboard Shortcuts</h3>
              <button className="close-button" onClick={() => setIsOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="shortcuts-list">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="shortcut-item">
                  <div className="shortcut-keys">
                    {shortcut.keys.map((key, i) => (
                      <React.Fragment key={i}>
                        <kbd className="keyboard-key">{key}</kbd>
                        {i < shortcut.keys.length - 1 && <span className="key-separator">+</span>}
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="shortcut-description">{shortcut.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default KeyboardShortcuts;
