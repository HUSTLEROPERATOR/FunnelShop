import { useState, useCallback } from 'react';
import { Save, Sparkles, Link2, Trash2 } from 'lucide-react';
import type { FunnelComponent, GlobalParameters, Blueprint, Connection } from './types';
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { ConfigPanel } from './components/config/ConfigPanel';
import { MetricsPanel } from './components/ui/MetricsPanel';
import { KeyboardShortcuts } from './components/ui/KeyboardShortcuts';
import { ComponentStats } from './components/ui/ComponentStats';
import { calculateMetrics } from './utils/calculateMetrics';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useGridSnap } from './hooks/useGridSnap';

const API_BASE = '/api';

function App() {
  const [components, setComponents] = useState<FunnelComponent[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [connectionMode, setConnectionMode] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [globalParameters, setGlobalParameters] = useState<GlobalParameters>({
    monthlyBudget: 10000,
    averageCheckSize: 50,
    customerLifetimeVisits: 5,
    profitMargin: 0.3,
  });
  const [scenarioName, setScenarioName] = useState('Untitled Scenario');
  const [isSaving, setIsSaving] = useState(false);

  const { snapEnabled, toggleSnap, snapToGrid } = useGridSnap(20);

  const metrics = calculateMetrics(components, globalParameters, connections);

  const selectedComponent = components.find((c) => c.id === selectedComponentId) || null;

  const addComponent = useCallback((type: string) => {
    const newComponent: FunnelComponent = {
      id: `${type}-${Date.now()}`,
      type,
      name: `${type} ${components.filter((c) => c.type === type).length + 1}`,
      position: { x: 50 + components.length * 20, y: 50 + components.length * 20 },
      properties: getDefaultPropertiesForType(type),
    };
    setComponents([...components, newComponent]);
    setSelectedComponentId(newComponent.id);
  }, [components]);

  const moveComponent = useCallback((id: string, x: number, y: number) => {
    setComponents((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, position: { x: Math.max(0, x), y: Math.max(0, y) } } : c
      )
    );
  }, []);

  const updateComponentProperties = useCallback((id: string, properties: Record<string, number | string>) => {
    setComponents((prev) => prev.map((c) => (c.id === id ? { ...c, properties } : c)));
  }, []);

  const deleteComponent = useCallback((id: string) => {
    setComponents((prev) => prev.filter((c) => c.id !== id));
    setConnections((prev) => prev.filter((conn) => conn.sourceId !== id && conn.targetId !== id));
    if (selectedComponentId === id) {
      setSelectedComponentId(null);
    }
  }, [selectedComponentId]);

  const createConnection = useCallback((sourceId: string, targetId: string) => {
    // Check if connection already exists
    setConnections((prev) => {
      const exists = prev.some(
        (conn) => conn.sourceId === sourceId && conn.targetId === targetId
      );
      if (!exists && sourceId !== targetId) {
        const newConnection: Connection = {
          id: `conn-${Date.now()}`,
          sourceId,
          targetId,
        };
        return [...prev, newConnection];
      }
      return prev;
    });
  }, []);

  const deleteConnection = useCallback((id: string) => {
    setConnections((prev) => prev.filter((conn) => conn.id !== id));
    if (selectedConnectionId === id) {
      setSelectedConnectionId(null);
    }
  }, [selectedConnectionId]);

  const clearAll = useCallback(() => {
    setComponents([]);
    setConnections([]);
    setSelectedComponentId(null);
    setSelectedConnectionId(null);
  }, []);

  const saveScenario = useCallback(async () => {
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
  }, [scenarioName, components, connections, globalParameters]);

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

  const handleDelete = useCallback(() => {
    if (selectedComponentId) {
      deleteComponent(selectedComponentId);
    } else if (selectedConnectionId) {
      deleteConnection(selectedConnectionId);
    }
  }, [selectedComponentId, selectedConnectionId, deleteComponent, deleteConnection]);

  const handleEscape = useCallback(() => {
    setSelectedComponentId(null);
    setSelectedConnectionId(null);
    if (connectionMode) {
      setConnectionMode(false);
    }
  }, [connectionMode]);

  const toggleConnectionMode = useCallback(() => {
    setConnectionMode((prev) => !prev);
    setSelectedConnectionId(null);
  }, []);

  useKeyboardShortcuts({
    onDelete: handleDelete,
    onSave: saveScenario,
    onEscape: handleEscape,
    onToggleGrid: toggleSnap,
    onToggleConnect: toggleConnectionMode,
    onShowHelp: () => setShowHelp(true),
  });

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Funnel Builder
            </h1>
            <input
              type="text"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              className="px-3 py-1 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleConnectionMode}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                connectionMode
                  ? 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/30'
                  : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              <Link2 size={18} />
              {connectionMode ? 'Exit Connect Mode' : 'Connect Mode'}
            </button>
            {(selectedComponentId || selectedConnectionId) && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-all shadow-lg shadow-red-500/30"
              >
                <Trash2 size={18} />
                Delete
              </button>
            )}
            <button
              onClick={() => loadBlueprint('restaurant-basic')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all shadow-lg shadow-purple-500/30"
            >
              <Sparkles size={18} />
              Load Blueprint
            </button>
            <button
              onClick={saveScenario}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all disabled:opacity-50 shadow-lg shadow-blue-500/30"
            >
              <Save size={18} />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </header>

      {/* Metrics and Stats */}
      <div className="px-6 py-4 bg-gray-850 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <MetricsPanel metrics={metrics} />
          <ComponentStats components={components} globalParameters={globalParameters} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
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
          snapToGrid={snapToGrid}
          snapEnabled={snapEnabled}
          onToggleSnap={toggleSnap}
          onClearAll={clearAll}
          onShowHelp={() => setShowHelp(true)}
        />
        {selectedComponent && (
          <ConfigPanel
            component={selectedComponent}
            onUpdate={updateComponentProperties}
            onClose={() => setSelectedComponentId(null)}
          />
        )}
      </div>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcuts isOpen={showHelp} onClose={() => setShowHelp(false)} />
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
