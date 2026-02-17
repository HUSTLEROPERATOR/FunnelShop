import { useState } from 'react';
import { Save, Sparkles } from 'lucide-react';
import type { FunnelComponent, GlobalParameters, Blueprint } from './types';
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { ConfigPanel } from './components/ConfigPanel';
import { MetricsPanel } from './components/MetricsPanel';
import { calculateMetrics } from './utils/calculateMetrics';

const API_BASE = '/api';

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

  const metrics = calculateMetrics(components, globalParameters);

  const selectedComponent = components.find((c) => c.id === selectedComponentId) || null;

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

  const saveScenario = async () => {
    setIsSaving(true);
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
        setGlobalParameters(blueprint.globalParameters);
        setScenarioName(blueprint.name);
      }
    } catch (error) {
      console.error('Failed to load blueprint:', error);
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
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => loadBlueprint('restaurant-basic')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              <Sparkles size={18} />
              Load Blueprint
            </button>
            <button
              onClick={saveScenario}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <Save size={18} />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
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
