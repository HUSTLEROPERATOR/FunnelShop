import React, { useState, useCallback, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import FunnelCanvas from './components/FunnelCanvas';
import ComponentSidebar from './components/ComponentSidebar';
import ConfigurationPanel from './components/ConfigurationPanel';
import MetricsPanel from './components/MetricsPanel';
import ScenarioManager from './components/ScenarioManager';
import BlueprintsPanel from './components/BlueprintsPanel';
import { calculateMetrics } from './utils/simulationLogic';
import './App.css';

function App() {
  const [components, setComponents] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [globalParams, setGlobalParams] = useState({
    marketSize: 10000,
    seasonality: 1.0,
    competitionLevel: 0.7
  });
  const [metrics, setMetrics] = useState({
    visitors: 0,
    bookings: 0,
    revenue: 0,
    profit: 0,
    roi: 0,
    loyalCustomers: 0
  });
  const [activeTab, setActiveTab] = useState('builder');
  const [snapToGrid, setSnapToGrid] = useState(true);
  const gridSize = 20;

  // Calculate metrics whenever components or global params change
  useEffect(() => {
    const newMetrics = calculateMetrics(components, globalParams);
    setMetrics(newMetrics);
  }, [components, globalParams]);

  const handleDrop = useCallback((item, monitor) => {
    const delta = monitor.getDifferenceFromInitialOffset();
    let left = Math.round(item.position.x + delta.x);
    let top = Math.round(item.position.y + delta.y);
    
    // Snap to grid if enabled
    if (snapToGrid) {
      left = Math.round(left / gridSize) * gridSize;
      top = Math.round(top / gridSize) * gridSize;
    }
    
    // Keep components within bounds
    left = Math.max(0, left);
    top = Math.max(0, top);
    
    // Check if duplicating flag is set
    const isDuplicating = monitor.getItem()?.isDuplicating;
    
    if (isDuplicating) {
      // Create a duplicate component
      const newComponent = {
        ...item,
        id: `${item.type}-${Date.now()}`,
        position: { x: left, y: top }
      };
      setComponents(prev => [...prev, newComponent]);
    } else {
      // Move existing component
      setComponents(prev => prev.map(component => 
        component.id === item.id 
          ? { ...component, position: { x: left, y: top } }
          : component
      ));
    }
  }, [snapToGrid, gridSize]);

  const addComponent = useCallback((type, position) => {
    let x = position.x;
    let y = position.y;
    
    // Snap to grid if enabled
    if (snapToGrid) {
      x = Math.round(x / gridSize) * gridSize;
      y = Math.round(y / gridSize) * gridSize;
    }
    
    const newComponent = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x, y },
      props: getDefaultProps(type)
    };
    setComponents(prev => [...prev, newComponent]);
  }, [snapToGrid, gridSize]);

  const updateComponentProps = useCallback((componentId, newProps) => {
    setComponents(prev => prev.map(component =>
      component.id === componentId
        ? { ...component, props: { ...component.props, ...newProps } }
        : component
    ));
  }, []);

  const removeComponent = useCallback((componentId) => {
    setComponents(prev => prev.filter(component => component.id !== componentId));
    if (selectedComponent && selectedComponent.id === componentId) {
      setSelectedComponent(null);
    }
  }, [selectedComponent]);

  const loadBlueprint = useCallback((blueprint) => {
    setComponents(blueprint.components);
    setSelectedComponent(null);
  }, []);

  const clearCanvas = useCallback(() => {
    setComponents([]);
    setSelectedComponent(null);
  }, []);

  const duplicateComponent = useCallback((componentId) => {
    const component = components.find(c => c.id === componentId);
    if (component) {
      const newComponent = {
        ...component,
        id: `${component.type}-${Date.now()}`,
        position: {
          x: component.position.x + 20,
          y: component.position.y + 20
        }
      };
      setComponents(prev => [...prev, newComponent]);
      setSelectedComponent(newComponent);
    }
  }, [components]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Delete selected component with Delete or Backspace
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedComponent) {
        e.preventDefault();
        removeComponent(selectedComponent.id);
      }
      
      // Duplicate selected component with Ctrl/Cmd + D
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedComponent) {
        e.preventDefault();
        duplicateComponent(selectedComponent.id);
      }
      
      // Deselect with Escape
      if (e.key === 'Escape') {
        setSelectedComponent(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedComponent, removeComponent, duplicateComponent]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app">
        <header className="app-header">
          <h1>🚀 Funnel Builder & Restaurant Growth Simulator</h1>
          <nav className="tab-navigation">
            <button 
              className={activeTab === 'builder' ? 'active' : ''}
              onClick={() => setActiveTab('builder')}
            >
              Builder
            </button>
            <button 
              className={activeTab === 'scenarios' ? 'active' : ''}
              onClick={() => setActiveTab('scenarios')}
            >
              Scenarios
            </button>
            <button 
              className={activeTab === 'blueprints' ? 'active' : ''}
              onClick={() => setActiveTab('blueprints')}
            >
              Blueprints
            </button>
          </nav>
        </header>

        <main className="app-main">
          {activeTab === 'builder' && (
            <>
              <ComponentSidebar />
              <div className="canvas-container">
                <div className="canvas-toolbar">
                  <label className="toolbar-item">
                    <input
                      type="checkbox"
                      checked={snapToGrid}
                      onChange={(e) => setSnapToGrid(e.target.checked)}
                    />
                    <span>Snap to Grid</span>
                  </label>
                  <div className="toolbar-divider"></div>
                  <button 
                    className="toolbar-button"
                    onClick={clearCanvas}
                    disabled={components.length === 0}
                    title="Clear Canvas"
                  >
                    Clear All
                  </button>
                  <div className="toolbar-divider"></div>
                  <button 
                    className="toolbar-button"
                    onClick={() => selectedComponent && duplicateComponent(selectedComponent.id)}
                    disabled={!selectedComponent}
                    title="Duplicate Selected (Ctrl+D)"
                  >
                    Duplicate
                  </button>
                  <span className="toolbar-item" style={{ fontSize: '0.75rem', color: '#718096' }}>
                    💡 Shortcuts: Del, Ctrl+D, Esc
                  </span>
                </div>
                <FunnelCanvas
                  components={components}
                  selectedComponent={selectedComponent}
                  onSelectComponent={setSelectedComponent}
                  onDrop={handleDrop}
                  onAddComponent={addComponent}
                  onRemoveComponent={removeComponent}
                />
              </div>
              <div className="right-panel">
                <ConfigurationPanel
                  selectedComponent={selectedComponent}
                  globalParams={globalParams}
                  onUpdateComponent={updateComponentProps}
                  onUpdateGlobalParams={setGlobalParams}
                />
                <MetricsPanel metrics={metrics} />
              </div>
            </>
          )}
          
          {activeTab === 'scenarios' && (
            <ScenarioManager
              components={components}
              globalParams={globalParams}
              onLoadScenario={(scenario) => {
                setComponents(scenario.components || []);
                setGlobalParams(scenario.globalParams || globalParams);
              }}
              onClearCanvas={clearCanvas}
            />
          )}

          {activeTab === 'blueprints' && (
            <BlueprintsPanel
              onLoadBlueprint={loadBlueprint}
              onSwitchToBuilder={() => setActiveTab('builder')}
            />
          )}
        </main>
      </div>
    </DndProvider>
  );
}

function getDefaultProps(type) {
  const defaults = {
    SocialMediaAds: {
      platform: 'Facebook',
      budget: 500,
      cpc: 0.5,
      targetAudience: 'Local audience',
      adCreative: 'Image',
      campaignObjective: 'Traffic'
    },
    GoogleAds: {
      budget: 800,
      cpc: 0.75,
      keywords: 'restaurant near me',
      matchType: 'Broad',
      qualityScore: 7
    },
    LandingPage: {
      conversionRate: 15,
      offerType: 'Free appetizer',
      headline: 'Special Offer',
      design: 'Modern'
    },
    EmailSequence: {
      openRate: 25,
      clickRate: 8,
      conversionRate: 12,
      sequenceLength: 3,
      frequency: 'Weekly'
    },
    BookingSystem: {
      conversionRate: 80,
      averageBookingValue: 45,
      bookingType: 'Table reservation',
      timeSlots: 12
    },
    RetargetingAds: {
      budget: 200,
      cpc: 0.3,
      audienceSize: 1000,
      frequency: 3
    }
  };
  
  return defaults[type] || {};
}

export default App;
