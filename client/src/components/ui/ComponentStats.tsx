import React from 'react';
import { Layers, DollarSign } from 'lucide-react';
import type { FunnelComponent, GlobalParameters } from '../../types';

interface ComponentStatsProps {
  components: FunnelComponent[];
  globalParameters: GlobalParameters;
}

export const ComponentStats: React.FC<ComponentStatsProps> = ({ 
  components, 
  globalParameters 
}) => {
  const componentCount = components.length;
  const totalBudget = components.reduce((sum, comp) => {
    const budget = typeof comp.properties.budget === 'number' ? comp.properties.budget : 0;
    return sum + budget;
  }, 0);
  
  const budgetUsagePercent = globalParameters.monthlyBudget > 0 
    ? (totalBudget / globalParameters.monthlyBudget) * 100 
    : 0;
  
  const componentTypes = new Set(components.map(c => c.type)).size;

  return (
    <div className="flex items-center gap-6 text-sm">
      <div className="flex items-center gap-2">
        <Layers size={16} className="text-blue-400" />
        <span className="text-gray-400">Components:</span>
        <span className="font-semibold text-white">{componentCount}</span>
        <span className="text-gray-500">({componentTypes} types)</span>
      </div>
      
      <div className="h-4 w-px bg-gray-700" />
      
      <div className="flex items-center gap-2">
        <DollarSign size={16} className="text-green-400" />
        <span className="text-gray-400">Budget Used:</span>
        <span className="font-semibold text-white">
          ${totalBudget.toLocaleString()}
        </span>
        <span className="text-gray-500">
          / ${globalParameters.monthlyBudget.toLocaleString()}
        </span>
      </div>
      
      <div className="flex-1 max-w-xs">
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${
              budgetUsagePercent > 100 
                ? 'bg-red-500' 
                : budgetUsagePercent > 80 
                ? 'bg-yellow-500' 
                : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(budgetUsagePercent, 100)}%` }}
          />
        </div>
      </div>
      
      {budgetUsagePercent > 100 && (
        <span className="text-xs text-red-400 font-medium">
          Over budget!
        </span>
      )}
    </div>
  );
};
