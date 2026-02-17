import React from 'react';
import { DollarSign } from 'lucide-react';
import type { GlobalParameters } from '../types';

interface GlobalParametersPanelProps {
  parameters: GlobalParameters;
  onUpdate: (parameters: GlobalParameters) => void;
}

export const GlobalParametersPanel: React.FC<GlobalParametersPanelProps> = ({
  parameters,
  onUpdate,
}) => {
  const handleChange = (key: keyof GlobalParameters, value: number) => {
    onUpdate({
      ...parameters,
      [key]: value,
    });
  };

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
      <div className="flex items-center gap-2 mb-6">
        <DollarSign size={20} className="text-green-500" />
        <h2 className="text-xl font-semibold">Global Parameters</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Monthly Budget ($)
          </label>
          <input
            type="number"
            value={parameters.monthlyBudget}
            onChange={(e) => handleChange('monthlyBudget', parseFloat(e.target.value) || 0)}
            min="0"
            step="100"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <p className="text-xs text-gray-400 mt-1">
            Total monthly budget for all campaigns
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Average Check Size ($)
          </label>
          <input
            type="number"
            value={parameters.averageCheckSize}
            onChange={(e) => handleChange('averageCheckSize', parseFloat(e.target.value) || 0)}
            min="0"
            step="1"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <p className="text-xs text-gray-400 mt-1">
            Average amount spent per customer visit
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Customer Lifetime Visits
          </label>
          <input
            type="number"
            value={parameters.customerLifetimeVisits}
            onChange={(e) => handleChange('customerLifetimeVisits', parseFloat(e.target.value) || 0)}
            min="0"
            step="1"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <p className="text-xs text-gray-400 mt-1">
            Average number of visits per customer
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Profit Margin (%)
          </label>
          <input
            type="number"
            value={parameters.profitMargin * 100}
            onChange={(e) => handleChange('profitMargin', (parseFloat(e.target.value) || 0) / 100)}
            min="0"
            max="100"
            step="1"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <p className="text-xs text-gray-400 mt-1">
            Percentage of revenue that is profit
          </p>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-700">
        <h3 className="text-sm font-medium mb-3 text-gray-400">Quick Presets</h3>
        <div className="space-y-2">
          <button
            onClick={() =>
              onUpdate({
                monthlyBudget: 5000,
                averageCheckSize: 30,
                customerLifetimeVisits: 3,
                profitMargin: 0.25,
              })
            }
            className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
          >
            Small Business
          </button>
          <button
            onClick={() =>
              onUpdate({
                monthlyBudget: 15000,
                averageCheckSize: 60,
                customerLifetimeVisits: 6,
                profitMargin: 0.35,
              })
            }
            className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
          >
            Medium Business
          </button>
          <button
            onClick={() =>
              onUpdate({
                monthlyBudget: 50000,
                averageCheckSize: 100,
                customerLifetimeVisits: 10,
                profitMargin: 0.4,
              })
            }
            className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
          >
            Large Business
          </button>
        </div>
      </div>
    </div>
  );
};
