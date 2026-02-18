import { useState, useEffect, useCallback } from 'react';
import { Save, Sparkles, Link2, Trash2, HelpCircle } from 'lucide-react';
import type { FunnelComponent, GlobalParameters, Blueprint, Connection } from './types';
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { ConfigPanel } from './components/ConfigPanel';
import { MetricsPanel } from './components/MetricsPanel';
import { calculateMetrics } from './utils/calculateMetrics';

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

  const metrics = calculateMetrics(components, globalParameters, connections);

  const selectedComponent = components.find((c) => c.id === selectedComponentId) || null;

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
  }, [selectedComponentId, selectedConnectionId, connectionMode, deleteComponent, deleteConnection]);

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

  const loadBlueprint = async (blueprintId: string) => {
    try {
      const response = await fetch(`${API_BASE}/blueprints`);
      const blueprints: Blueprint[] = await response.json();
      const blueprint = blueprints.find((b) => b.id === blueprintId);
      if (blueprint) {
        setComponents(blueprint.components);
        setConnections([]); // Blueprints don't have connections yet
        setGlobalParameters(blueprint.globalParameters);
        setScenarioName(blueprint.name);
      }
    } catch (error) {
      console.error('Failed to load blueprint:', error);
    }
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
          padding: '0 var(--space-6)',
          background: 'var(--color-bg-surface)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        {/* Left: title + scenario name */}
        <div className="flex items-center" style={{ gap: 'var(--space-4)' }}>
          <h1 className="text-page-title" style={{ margin: 0 }}>
            Funnel Builder
          </h1>

          <div
            style={{
              width: 1,
              height: 24,
              background: 'var(--color-border)',
            }}
          />

          <input
            type="text"
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
            className="control-input"
            style={{ width: 220 }}
          />
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
          <button
            onClick={() => {
              setConnectionMode(!connectionMode);
              setSelectedConnectionId(null);
            }}
            className={`btn ${connectionMode ? 'btn-success' : 'btn-ghost'}`}
          >
            <Link2 size={16} />
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
            >
              <Trash2 size={16} />
              Delete
            </button>
          )}

          <button
            onClick={() => loadBlueprint('restaurant-basic')}
            className="btn btn-ghost"
          >
            <Sparkles size={16} />
            Blueprint
          </button>

          <button
            onClick={saveScenario}
            disabled={isSaving}
            className="btn btn-primary"
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save'}
          </button>

          <button className="btn-icon" title="Help">
            <HelpCircle size={18} />
          </button>
        </div>
      </header>

      {/* ─── Metrics strip ─── */}
      <div style={{ padding: 'var(--space-4) var(--space-6)' }}>
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

function getDefaultPropertiesForType(type: string): Record<string, number | string> {
  switch (type) {
    case 'google-ads':
      return { cpc: 2.0, budget: 4000 };
    case 'facebook-ads':
      return { cpc: 1.5, budget: 3000 };
    case 'landing-page':
      return { conversionRate: 0.15 };
    case 'booking-form':
      return { conversionRate: 0.25 };
    case 'email-campaign':
      return { recipients: 1000, clickThroughRate: 0.05, cost: 100 };
    default:
      return {};
  }
}

export default App;
