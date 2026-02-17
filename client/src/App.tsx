import { useState, useEffect, useCallback } from 'react';
import { Save, Sparkles, Undo, Redo, AlertCircle, Download, Upload, Trash, Settings } from 'lucide-react';
import type { FunnelComponent, GlobalParameters, Blueprint } from './types';
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { ConfigPanel } from './components/ConfigPanel';
import { MetricsPanel } from './components/MetricsPanel';
import { GlobalParametersPanel } from './components/GlobalParametersPanel';
import { calculateMetrics } from './utils/calculateMetrics';

const API_BASE = '/api';

interface HistoryState {
  components: FunnelComponent[];
  globalParameters: GlobalParameters;
}

function App() {
  const [components, setComponents] = useState<FunnelComponent[]>([]);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [globalParameters, setGlobalParameters] = useState<GlobalParameters>({
    monthlyBudget: 10000,
    averageCheckSize: 50,
    customerLifetimeVisits: 5,
    profitMargin: 0.3,
  });
  const [scenarioName, setScenarioName] = useState('Untitled Scenario');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showGlobalParams, setShowGlobalParams] = useState(false);

  const metrics = calculateMetrics(components, globalParameters);

  const selectedComponent = components.find((c) => c.id === selectedComponentId) || null;

  // Save state to history
  const saveToHistory = useCallback(() => {
    const newState: HistoryState = {
      components: JSON.parse(JSON.stringify(components)),
      globalParameters: { ...globalParameters },
    };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    // Keep only last 50 states
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      setHistoryIndex(historyIndex + 1);
    }
    setHistory(newHistory);
  }, [components, globalParameters, history, historyIndex]);

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setComponents(JSON.parse(JSON.stringify(prevState.components)));
      setGlobalParameters({ ...prevState.globalParameters });
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex]);

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setComponents(JSON.parse(JSON.stringify(nextState.components)));
      setGlobalParameters({ ...nextState.globalParameters });
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex]);

  // Delete component
  const deleteComponent = useCallback((id: string) => {
    saveToHistory();
    setComponents((prev) => prev.filter((c) => c.id !== id));
    setSelectedComponentId((prev) => (prev === id ? null : prev));
  }, [saveToHistory]);

  // Save scenario
  const saveScenario = useCallback(async () => {
    if (!scenarioName.trim()) {
      setError('Please provide a scenario name');
      return;
    }
    
    setIsSaving(true);
    setError(null);
    try {
      const scenario = {
        name: scenarioName,
        components,
        globalParameters,
      };
      const response = await fetch(`${API_BASE}/scenarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scenario),
      });
      if (response.ok) {
        alert('Scenario saved successfully!');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save scenario');
      }
    } catch (error) {
      console.error('Failed to save scenario:', error);
      setError('Failed to save scenario. Please check your connection.');
    } finally {
      setIsSaving(false);
    }
  }, [scenarioName, components, globalParameters]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo: Ctrl+Z / Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Redo: Ctrl+Shift+Z / Cmd+Shift+Z or Ctrl+Y / Cmd+Y
      if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') || 
          ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
        e.preventDefault();
        redo();
      }
      // Save: Ctrl+S / Cmd+S
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveScenario();
      }
      // Delete: Delete / Backspace
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedComponentId) {
        e.preventDefault();
        deleteComponent(selectedComponentId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, selectedComponentId, saveScenario, deleteComponent]);

  const addComponent = (type: string) => {
    saveToHistory();
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
    saveToHistory();
    setComponents(components.map((c) => (c.id === id ? { ...c, properties } : c)));
  };

  const updateGlobalParameters = (params: GlobalParameters) => {
    saveToHistory();
    setGlobalParameters(params);
  };

  const loadBlueprint = async (blueprintId: string) => {
    saveToHistory();
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/blueprints`);
      if (!response.ok) {
        throw new Error('Failed to fetch blueprints');
      }
      const blueprints: Blueprint[] = await response.json();
      const blueprint = blueprints.find((b) => b.id === blueprintId);
      if (blueprint) {
        setComponents(blueprint.components);
        setGlobalParameters(blueprint.globalParameters);
        setScenarioName(blueprint.name);
      } else {
        setError('Blueprint not found');
      }
    } catch (error) {
      console.error('Failed to load blueprint:', error);
      setError('Failed to load blueprint. Please try again.');
    }
  };

  const exportFunnel = () => {
    const data = {
      name: scenarioName,
      components,
      globalParameters,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scenarioName.replace(/\s+/g, '_')}_funnel.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importFunnel = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target?.result as string);
            if (data.components && data.globalParameters) {
              saveToHistory();
              setComponents(data.components);
              setGlobalParameters(data.globalParameters);
              setScenarioName(data.name || 'Imported Funnel');
              setError(null);
            } else {
              setError('Invalid funnel file format');
            }
          } catch (error) {
            console.error('Failed to import funnel:', error);
            setError('Failed to import funnel. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const clearCanvas = () => {
    if (components.length === 0) return;
    if (window.confirm('Are you sure you want to clear the canvas? This action cannot be undone.')) {
      saveToHistory();
      setComponents([]);
      setSelectedComponentId(null);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Funnel Builder</h1>
            <input
              type="text"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              className="px-3 py-1 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500"
              placeholder="Scenario name..."
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Undo (Ctrl+Z)"
            >
              <Undo size={18} />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo size={18} />
            </button>
            <div className="h-6 w-px bg-gray-600"></div>
            <button
              onClick={importFunnel}
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Import Funnel"
            >
              <Upload size={18} />
            </button>
            <button
              onClick={exportFunnel}
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              title="Export Funnel"
            >
              <Download size={18} />
            </button>
            <button
              onClick={clearCanvas}
              disabled={components.length === 0}
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Clear Canvas"
            >
              <Trash size={18} />
            </button>
            <button
              onClick={() => setShowGlobalParams(!showGlobalParams)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                showGlobalParams
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
              title="Global Parameters"
            >
              <Settings size={18} />
            </button>
            <div className="h-6 w-px bg-gray-600"></div>
            <button
              onClick={() => loadBlueprint('restaurant-basic')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              <Sparkles size={18} />
              Blueprint
            </button>
            <button
              onClick={saveScenario}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
              title="Save (Ctrl+S)"
            >
              <Save size={18} />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
        {error && (
          <div className="mt-3 flex items-center gap-2 px-4 py-2 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
            <AlertCircle size={18} />
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-200 hover:text-white"
            >
              ×
            </button>
          </div>
        )}
      </header>

      {/* Metrics */}
      <div className="px-6 py-4 bg-gray-850">
        <MetricsPanel metrics={metrics} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar onAddComponent={addComponent} />
        <Canvas
          components={components}
          selectedId={selectedComponentId}
          onSelectComponent={setSelectedComponentId}
          onMoveComponent={moveComponent}
          onDeleteComponent={deleteComponent}
        />
        {showGlobalParams && (
          <GlobalParametersPanel
            parameters={globalParameters}
            onUpdate={updateGlobalParameters}
          />
        )}
        {selectedComponent && !showGlobalParams && (
          <ConfigPanel
            component={selectedComponent}
            onUpdate={updateComponentProperties}
            onClose={() => setSelectedComponentId(null)}
            onDelete={() => deleteComponent(selectedComponent.id)}
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
