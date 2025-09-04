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

  // Calculate metrics whenever components or global params change
  useEffect(() => {
    const newMetrics = calculateMetrics(components, globalParams);
    setMetrics(newMetrics);
  }, [components, globalParams]);

  const handleDrop = useCallback((item, monitor) => {
    const delta = monitor.getDifferenceFromInitialOffset();
    const left = Math.round(item.position.x + delta.x);
    const top = Math.round(item.position.y + delta.y);
    
    setComponents(prev => prev.map(component => 
      component.id === item.id 
        ? { ...component, position: { x: left, y: top } }
        : component
    ));
  }, []);

  const addComponent = useCallback((type, position) => {
    const newComponent = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      props: getDefaultProps(type)
    };
    setComponents(prev => [...prev, newComponent]);
  }, []);

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
              <FunnelCanvas
                components={components}
                selectedComponent={selectedComponent}
                onSelectComponent={setSelectedComponent}
                onDrop={handleDrop}
                onAddComponent={addComponent}
                onRemoveComponent={removeComponent}
              />
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
