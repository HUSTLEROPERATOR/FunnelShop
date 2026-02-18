import { useState, useEffect, useCallback } from 'react';
import { Save, Sparkles } from 'lucide-react';
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
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Bar - Figma Style */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-gray-900">Funnel Builder</h1>
            <div className="w-px h-6 bg-gray-300"></div>
            <input
              type="text"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              placeholder="Untitled Scenario"
              className="px-3 py-1.5 text-sm bg-transparent border border-transparent hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadBlueprint('restaurant-basic')}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-all shadow-sm hover:shadow-md"
            >
              <Sparkles size={16} />
              Load Blueprint
            </button>
            <button
              onClick={saveScenario}
              disabled={isSaving}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50"
            >
              <Save size={16} />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar onAddComponent={addComponent} />
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Metrics Panel - Above Canvas */}
          <div className="px-6 py-4 bg-gray-50">
            <MetricsPanel metrics={metrics} />
          </div>
          
          {/* Canvas Container */}
          <div className="flex-1 relative overflow-hidden">
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
              onDeleteComponent={deleteComponent}
              onDeleteConnection={deleteConnection}
            />
          </div>
        </div>
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
