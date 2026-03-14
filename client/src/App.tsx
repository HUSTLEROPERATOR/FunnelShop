import { useState, useEffect, useCallback, useRef } from 'react';
import { Save, Sparkles, Link2, Trash2, HelpCircle } from 'lucide-react';
import type { FunnelComponent, GlobalParameters, Connection } from './types';
import { blueprints, cloneBlueprint, getBlueprintById } from './blueprints';
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { ConfigPanel } from './components/ConfigPanel';
import { MetricsPanel } from './components/MetricsPanel';
import { HelpPanel } from './components/HelpPanel';
import { AIFunnelGenerator } from './features/ai-funnel/AIFunnelGenerator';
import type { GeneratedFunnelSuccess } from './features/ai-funnel/generateFunnelFromPrompt';
import { calculateMetrics } from './utils/calculateMetrics';
import { getDefaultPropertiesForType } from './utils/getDefaultPropertiesForType';

const API_BASE = '/api';

function App() {
  const [components, setComponents] = useState<FunnelComponent[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [connectionMode, setConnectionMode] = useState(false);
  const [globalParameters, setGlobalParameters] = useState<GlobalParameters>({
    monthlyBudget: 10000,
    averageCheckSize: 50,
    customerLifetimeVisits: 5,
    profitMargin: 0.3,
  });
  const [scenarioName, setScenarioName] = useState('Untitled Scenario');
  const [isSaving, setIsSaving] = useState(false);
  const [isHelpPanelOpen, setIsHelpPanelOpen] = useState(false);
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);
  const helpButtonRef = useRef<HTMLButtonElement | null>(null);
  const helpPanelRef = useRef<HTMLDivElement | null>(null);
  const templateButtonRef = useRef<HTMLButtonElement | null>(null);
  const templateMenuRef = useRef<HTMLDivElement | null>(null);

  const metrics = calculateMetrics(components, globalParameters, connections);

  const selectedComponent = components.find((c) => c.id === selectedComponentId) || null;

  const replaceCanvasState = useCallback(
    ({
      nextComponents,
      nextConnections,
      nextScenarioName,
      nextGlobalParameters,
    }: {
      nextComponents: FunnelComponent[];
      nextConnections: Connection[];
      nextScenarioName: string;
      nextGlobalParameters?: GlobalParameters;
    }) => {
      setComponents(nextComponents);
      setConnections(nextConnections);
      if (nextGlobalParameters) {
        setGlobalParameters(nextGlobalParameters);
      }
      setScenarioName(nextScenarioName);
      setSelectedComponentId(null);
      setSelectedConnectionId(null);
      setConnectionMode(false);
      setIsTemplateMenuOpen(false);
      setIsHelpPanelOpen(false);
    },
    []
  );

  // Define callbacks before useEffect that uses them
  const deleteComponent = useCallback((id: string) => {
    setComponents(prev => prev.filter((c) => c.id !== id));
    setConnections(prev => prev.filter((conn) => conn.sourceId !== id && conn.targetId !== id));
    if (selectedComponentId === id) {
      setSelectedComponentId(null);
    }
  }, [selectedComponentId]);

  const deleteConnection = useCallback((id: string) => {
    setConnections(prev => prev.filter((conn) => conn.id !== id));
    if (selectedConnectionId === id) {
      setSelectedConnectionId(null);
    }
  }, [selectedConnectionId]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if focus is on an input element
      const target = e.target as HTMLElement;
      const isInputFocused =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable;

      // ESC always deselects (even when input focused)
      if (e.key === 'Escape') {
        setSelectedComponentId(null);
        setSelectedConnectionId(null);
        if (connectionMode) {
          setConnectionMode(false);
        }
        if (isHelpPanelOpen) {
          setIsHelpPanelOpen(false);
        }
        if (isTemplateMenuOpen) {
          setIsTemplateMenuOpen(false);
        }
        return;
      }

      // Other keyboard shortcuts only work when input is not focused
      if (isInputFocused) {
        return;
      }

      // Delete or Backspace to delete selected item
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        if (selectedComponentId) {
          deleteComponent(selectedComponentId);
        } else if (selectedConnectionId) {
          deleteConnection(selectedConnectionId);
        }
      }

      // Ctrl/Cmd + D to duplicate (placeholder for future)
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        // Future: implement duplication
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedComponentId,
    selectedConnectionId,
    connectionMode,
    deleteComponent,
    deleteConnection,
    isHelpPanelOpen,
    isTemplateMenuOpen,
  ]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        isHelpPanelOpen &&
        !helpPanelRef.current?.contains(target) &&
        !helpButtonRef.current?.contains(target)
      ) {
        setIsHelpPanelOpen(false);
      }

      if (
        isTemplateMenuOpen &&
        !templateMenuRef.current?.contains(target) &&
        !templateButtonRef.current?.contains(target)
      ) {
        setIsTemplateMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isHelpPanelOpen, isTemplateMenuOpen]);

  const addComponent = (type: string) => {
    const newComponent: FunnelComponent = {
      id: `${type}-${Date.now()}`,
      type,
      name: `${type} ${components.filter((c) => c.type === type).length + 1}`,
      position: { x: 50 + components.length * 20, y: 50 + components.length * 20 },
      properties: getDefaultPropertiesForType(type),
    };
    setComponents([...components, newComponent]);
    setSelectedComponentId(newComponent.id);
  };

  const moveComponent = (id: string, x: number, y: number) => {
    setComponents(
      components.map((c) =>
        c.id === id ? { ...c, position: { x: Math.max(0, x), y: Math.max(0, y) } } : c
      )
    );
  };

  const updateComponentProperties = (id: string, properties: Record<string, number | string>) => {
    setComponents(components.map((c) => (c.id === id ? { ...c, properties } : c)));
  };

  const createConnection = (sourceId: string, targetId: string) => {
    // Check if connection already exists
    const exists = connections.some(
      (conn) => conn.sourceId === sourceId && conn.targetId === targetId
    );
    if (!exists && sourceId !== targetId) {
      const newConnection: Connection = {
        id: `conn-${Date.now()}`,
        sourceId,
        targetId,
      };
      setConnections([...connections, newConnection]);
    }
  };

  const saveScenario = async () => {
    setIsSaving(true);
    try {
      const scenario = {
        name: scenarioName,
        components,
        connections,
        globalParameters,
      };
      const response = await fetch(`${API_BASE}/scenarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scenario),
      });
      if (response.ok) {
        alert('Scenario saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save scenario:', error);
      alert('Failed to save scenario');
    } finally {
      setIsSaving(false);
    }
  };

  const loadBlueprint = (blueprintId: string) => {
    const blueprint = getBlueprintById(blueprintId);

    if (!blueprint) {
      return;
    }

    const nextBlueprint = cloneBlueprint(blueprint);
    replaceCanvasState({
      nextComponents: nextBlueprint.components,
      nextConnections: nextBlueprint.connections,
      nextScenarioName: nextBlueprint.name,
      nextGlobalParameters: nextBlueprint.globalParameters,
    });
  };

  const handleGenerateFunnel = (generatedFunnel: GeneratedFunnelSuccess) => {
    replaceCanvasState({
      nextComponents: generatedFunnel.components,
      nextConnections: generatedFunnel.connections,
      nextScenarioName: generatedFunnel.scenarioName,
    });
  };

  return (
    <div
      className="h-screen flex flex-col"
      style={{ background: 'var(--color-bg-app)', color: 'var(--color-text-primary)' }}
    >
      {/* ─── Top Bar ─── */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between"
        style={{
          height: 56,
          padding: '0 var(--space-5)',
          background: 'var(--color-bg-surface)',
          borderBottom: '1px solid var(--color-border)',
          boxShadow: '0 1px 0 var(--color-border-muted)',
        }}
      >
        {/* Left: wordmark + scenario name */}
        <div className="flex items-center" style={{ gap: 'var(--space-3)' }}>
          {/* Wordmark / logo */}
          <div className="flex items-center" style={{ gap: 'var(--space-2)', flexShrink: 0 }}>
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={14} style={{ color: '#fff' }} />
            </div>
            <h1 className="text-page-title" style={{ margin: 0 }}>
              FunnelShop
            </h1>
          </div>

          <div style={{ width: 1, height: 20, background: 'var(--color-border)', flexShrink: 0 }} />

          {/* Scenario name */}
          <input
            type="text"
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
            className="control-input"
            style={{ width: 200, height: 32, fontSize: 'var(--text-label)' }}
            aria-label="Scenario name"
          />
        </div>

        {/* Right: action buttons — grouped by purpose */}
        <div className="flex items-center" style={{ gap: 'var(--space-1)' }}>
          {/* Canvas mode controls */}
          <button
            onClick={() => {
              setConnectionMode(!connectionMode);
              setSelectedConnectionId(null);
            }}
            className={`btn ${connectionMode ? 'btn-success' : 'btn-ghost'}`}
            style={{ height: 32 }}
            aria-pressed={connectionMode}
          >
            <Link2 size={14} />
            {connectionMode ? 'Exit Connect' : 'Connect'}
          </button>

          {(selectedComponentId || selectedConnectionId) && (
            <button
              onClick={() => {
                if (selectedComponentId) {
                  deleteComponent(selectedComponentId);
                } else if (selectedConnectionId) {
                  deleteConnection(selectedConnectionId);
                }
              }}
              className="btn btn-danger"
              style={{ height: 32 }}
            >
              <Trash2 size={14} />
              Delete
            </button>
          )}

          {/* Divider */}
          <div style={{ width: 1, height: 20, background: 'var(--color-border)', margin: '0 var(--space-1)' }} />

          {/* File actions */}
          <button
            ref={templateButtonRef}
            onClick={() => {
              setIsTemplateMenuOpen((prev) => !prev);
              setIsHelpPanelOpen(false);
            }}
            className="btn btn-ghost"
            style={{ height: 32 }}
            aria-haspopup="dialog"
            aria-expanded={isTemplateMenuOpen}
          >
            <Sparkles size={14} />
            Load Template
          </button>

          <button
            onClick={saveScenario}
            disabled={isSaving}
            className="btn btn-primary"
            style={{ height: 32 }}
          >
            <Save size={14} />
            {isSaving ? 'Saving…' : 'Save'}
          </button>

          <button
            ref={helpButtonRef}
            onClick={() => {
              setIsHelpPanelOpen((prev) => !prev);
              setIsTemplateMenuOpen(false);
            }}
            className="btn-icon"
            style={{ width: 32, height: 32 }}
            title="Help"
            aria-label="Help"
            aria-expanded={isHelpPanelOpen}
          >
            <HelpCircle size={16} />
          </button>
        </div>
      </header>

      {isTemplateMenuOpen && (
        <div
          ref={templateMenuRef}
          role="dialog"
          aria-label="Load a template"
          style={{
            position: 'fixed',
            top: 72,
            right: 72,
            width: 340,
            maxWidth: 'calc(100vw - 32px)',
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-float)',
            padding: 'var(--space-4)',
            zIndex: 'calc(var(--z-header) + 2)',
          }}
        >
          <div style={{ marginBottom: 'var(--space-3)' }}>
            <div
              style={{
                fontSize: 'var(--text-section-title)',
                fontWeight: 'var(--weight-semibold)',
                marginBottom: 4,
              }}
            >
              Blueprint Library
            </div>
            <p className="text-helper" style={{ margin: 0 }}>
              Start from a proven funnel layout, then customize the cards on your canvas.
            </p>
          </div>

          <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
            {blueprints.map((blueprint) => (
              <button
                key={blueprint.id}
                onClick={() => loadBlueprint(blueprint.id)}
                className="btn btn-ghost"
                style={{
                  height: 'auto',
                  width: '100%',
                  justifyContent: 'flex-start',
                  padding: 'var(--space-3)',
                  textAlign: 'left',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                }}
                aria-label={blueprint.name}
              >
                <span
                  style={{
                    fontSize: 'var(--text-label)',
                    fontWeight: 'var(--weight-semibold)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {blueprint.name}
                </span>
                <span className="text-helper" style={{ marginTop: 4 }}>
                  {blueprint.description}
                </span>
                <span className="text-helper" style={{ marginTop: 'var(--space-2)' }}>
                  {blueprint.components.length} steps · {blueprint.connections.length} links
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <HelpPanel ref={helpPanelRef} isOpen={isHelpPanelOpen} onClose={() => setIsHelpPanelOpen(false)} />

      <div style={{ padding: 'var(--space-3) var(--space-5) 0' }}>
        <AIFunnelGenerator onGenerateFunnel={handleGenerateFunnel} />
      </div>

      {/* ─── Metrics strip ─── */}
      <div style={{ padding: 'var(--space-3) var(--space-5)' }}>
        <MetricsPanel metrics={metrics} />
      </div>

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex overflow-hidden" style={{ gap: 0 }}>
        <Sidebar onAddComponent={addComponent} />
        <Canvas
          components={components}
          connections={connections}
          selectedId={selectedComponentId}
          selectedConnectionId={selectedConnectionId}
          connectionMode={connectionMode}
          onSelectComponent={setSelectedComponentId}
          onSelectConnection={setSelectedConnectionId}
          onMoveComponent={moveComponent}
          onCreateConnection={createConnection}
        />
        {selectedComponent && (
          <ConfigPanel
            component={selectedComponent}
            onUpdate={updateComponentProperties}
            onClose={() => setSelectedComponentId(null)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
