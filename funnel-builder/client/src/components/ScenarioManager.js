import React, { useState, useEffect } from 'react';
import { Save, Upload, Trash2, Download } from 'lucide-react';

const ScenarioManager = ({ 
  components, 
  globalParams, 
  onLoadScenario, 
  onClearCanvas 
}) => {
  const [scenarios, setScenarios] = useState([]);
  const [scenarioName, setScenarioName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    try {
      const response = await fetch('/api/scenarios');
      if (response.ok) {
        const data = await response.json();
        setScenarios(data);
      }
    } catch (error) {
      console.error('Failed to load scenarios:', error);
    }
  };

  const saveScenario = async () => {
    if (!scenarioName.trim()) {
      alert('Please enter a scenario name');
      return;
    }

    setLoading(true);
    try {
      const scenario = {
        name: scenarioName,
        components: components,
        globalParams: globalParams,
        description: `Funnel with ${components.length} components`
      };

      const response = await fetch('/api/scenarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scenario),
      });

      if (response.ok) {
        setScenarioName('');
        loadScenarios();
        alert('Scenario saved successfully!');
      } else {
        alert('Failed to save scenario');
      }
    } catch (error) {
      console.error('Failed to save scenario:', error);
      alert('Failed to save scenario');
    } finally {
      setLoading(false);
    }
  };

  const loadScenario = async (scenarioId) => {
    try {
      const response = await fetch(`/api/scenarios/${scenarioId}`);
      if (response.ok) {
        const scenario = await response.json();
        onLoadScenario(scenario);
        alert('Scenario loaded successfully!');
      } else {
        alert('Failed to load scenario');
      }
    } catch (error) {
      console.error('Failed to load scenario:', error);
      alert('Failed to load scenario');
    }
  };

  const deleteScenario = async (scenarioId) => {
    if (!window.confirm('Are you sure you want to delete this scenario?')) {
      return;
    }

    try {
      const response = await fetch(`/api/scenarios/${scenarioId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadScenarios();
        alert('Scenario deleted successfully!');
      } else {
        alert('Failed to delete scenario');
      }
    } catch (error) {
      console.error('Failed to delete scenario:', error);
      alert('Failed to delete scenario');
    }
  };

  const exportScenario = (scenario) => {
    const dataStr = JSON.stringify(scenario, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `funnel-scenario-${scenario.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="scenario-manager">
      <div className="scenario-header">
        <h2>💾 Scenario Manager</h2>
        <p>Save and load different funnel configurations</p>
      </div>

      <div className="save-section">
        <h3>Save Current Scenario</h3>
        <div className="save-form">
          <input
            type="text"
            placeholder="Enter scenario name..."
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && saveScenario()}
          />
          <button 
            onClick={saveScenario} 
            disabled={loading || !scenarioName.trim()}
            className="save-button"
          >
            <Save size={16} />
            {loading ? 'Saving...' : 'Save Scenario'}
          </button>
        </div>
        <div className="current-scenario-info">
          <p>Current funnel: {components.length} components</p>
        </div>
      </div>

      <div className="scenarios-section">
        <h3>Saved Scenarios</h3>
        {scenarios.length === 0 ? (
          <div className="empty-scenarios">
            <p>No scenarios saved yet. Create your first funnel and save it!</p>
          </div>
        ) : (
          <div className="scenarios-list">
            {scenarios.map((scenario) => (
              <div key={scenario.id} className="scenario-card">
                <div className="scenario-info">
                  <h4>{scenario.name}</h4>
                  <p>{scenario.description}</p>
                  <div className="scenario-meta">
                    <span>Components: {scenario.components?.length || 0}</span>
                    <span>Created: {new Date(scenario.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="scenario-actions">
                  <button
                    onClick={() => loadScenario(scenario.id)}
                    className="load-button"
                    title="Load scenario"
                  >
                    <Upload size={16} />
                  </button>
                  <button
                    onClick={() => exportScenario(scenario)}
                    className="export-button"
                    title="Export scenario"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={() => deleteScenario(scenario.id)}
                    className="delete-button"
                    title="Delete scenario"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="actions-section">
        <button 
          onClick={onClearCanvas}
          className="clear-button"
        >
          <Trash2 size={16} />
          Clear Canvas
        </button>
      </div>
    </div>
  );
};

export default ScenarioManager;