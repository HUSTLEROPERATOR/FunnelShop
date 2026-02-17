import React from 'react';

/**
 * Component count indicator showing stats about components on canvas
 */
const ComponentStats = ({ components }) => {
  const totalBudget = components.reduce((sum, comp) => {
    return sum + (comp.props.budget || 0);
  }, 0);

  return (
    <div className="component-stats-bar">
      <div className="stats-item">
        <span className="stats-label">Components:</span>
        <span className="stats-value">{components.length}</span>
      </div>
      {totalBudget > 0 && (
        <div className="stats-item">
          <span className="stats-label">Total Budget:</span>
          <span className="stats-value">${totalBudget.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
};

export default ComponentStats;
