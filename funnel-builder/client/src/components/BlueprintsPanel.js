import React, { useState, useEffect } from 'react';
import { Play, Download, Info } from 'lucide-react';

const BlueprintsPanel = ({ onLoadBlueprint, onSwitchToBuilder }) => {
  const [blueprints, setBlueprints] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBlueprints();
  }, []);

  const loadBlueprints = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/blueprints');
      if (response.ok) {
        const data = await response.json();
        setBlueprints(data);
      }
    } catch (error) {
      console.error('Failed to load blueprints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadBlueprint = (blueprint) => {
    onLoadBlueprint(blueprint);
    onSwitchToBuilder();
  };

  const exportBlueprint = (blueprint) => {
    const dataStr = JSON.stringify(blueprint, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `blueprint-${blueprint.id}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (loading) {
    return (
      <div className="blueprints-panel">
        <div className="loading">Loading blueprints...</div>
      </div>
    );
  }

  return (
    <div className="blueprints-panel">
      <div className="blueprints-header">
        <h2>🎯 Funnel Blueprints</h2>
        <p>Pre-configured funnel templates to get you started quickly</p>
      </div>

      <div className="blueprints-grid">
        {blueprints.map((blueprint) => (
          <div key={blueprint.id} className="blueprint-card">
            <div className="blueprint-header">
              <h3>{blueprint.name}</h3>
              <div className="blueprint-meta">
                <span className="component-count">
                  {blueprint.components.length} components
                </span>
              </div>
            </div>
            
            <div className="blueprint-description">
              <p>{blueprint.description}</p>
            </div>

            <div className="blueprint-components">
              <h4>Components included:</h4>
              <ul>
                {blueprint.components.map((component, index) => (
                  <li key={index}>
                    <span className="component-type">
                      {getComponentDisplayName(component.type)}
                    </span>
                    {component.props.budget && (
                      <span className="component-budget">
                        (${component.props.budget} budget)
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="blueprint-preview">
              <div className="preview-canvas">
                {blueprint.components.map((component, index) => (
                  <div
                    key={index}
                    className="preview-component"
                    style={{
                      left: `${component.position.x / 10}px`,
                      top: `${component.position.y / 10}px`,
                      backgroundColor: getComponentColor(component.type)
                    }}
                    title={getComponentDisplayName(component.type)}
                  />
                ))}
              </div>
            </div>

            <div className="blueprint-actions">
              <button
                onClick={() => handleLoadBlueprint(blueprint)}
                className="load-blueprint-button"
              >
                <Play size={16} />
                Load Blueprint
              </button>
              
              <button
                onClick={() => exportBlueprint(blueprint)}
                className="export-blueprint-button"
                title="Export blueprint"
              >
                <Download size={16} />
              </button>
              
              <button
                className="info-button"
                title="Blueprint information"
              >
                <Info size={16} />
              </button>
            </div>

            <div className="blueprint-stats">
              <div className="stat">
                <span>Estimated ROI:</span>
                <span className="stat-value">
                  {blueprint.id === 'restaurant-basic' ? '150%' : '180%'}
                </span>
              </div>
              <div className="stat">
                <span>Complexity:</span>
                <span className="stat-value">
                  {blueprint.components.length <= 3 ? 'Beginner' : 'Intermediate'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="blueprints-info">
        <div className="info-card">
          <h3>💡 How to use blueprints</h3>
          <ol>
            <li>Choose a blueprint that matches your restaurant's goals</li>
            <li>Click "Load Blueprint" to add it to your canvas</li>
            <li>Customize the components with your specific details</li>
            <li>Monitor the metrics and adjust as needed</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

const getComponentDisplayName = (type) => {
  const nameMap = {
    SocialMediaAds: 'Social Media Ads',
    GoogleAds: 'Google Ads',
    LandingPage: 'Landing Page',
    EmailSequence: 'Email Sequence',
    BookingSystem: 'Booking System',
    RetargetingAds: 'Retargeting Ads'
  };
  return nameMap[type] || type;
};

const getComponentColor = (type) => {
  const colorMap = {
    SocialMediaAds: '#1877f2',
    GoogleAds: '#4285f4',
    LandingPage: '#ff6b35',
    EmailSequence: '#34d399',
    BookingSystem: '#8b5cf6',
    RetargetingAds: '#f59e0b'
  };
  return colorMap[type] || '#6b7280';
};

export default BlueprintsPanel;