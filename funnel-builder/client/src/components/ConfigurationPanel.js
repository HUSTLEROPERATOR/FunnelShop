import React from 'react';

const ConfigurationPanel = ({
  selectedComponent,
  globalParams,
  onUpdateComponent,
  onUpdateGlobalParams
}) => {
  if (!selectedComponent) {
    return (
      <div className="configuration-panel">
        <h3>⚙️ Configuration</h3>
        <div className="panel-content">
          <div className="section">
            <h4>Global Parameters</h4>
            <div className="form-group">
              <label>Market Size:</label>
              <input
                type="number"
                value={globalParams.marketSize}
                onChange={(e) => onUpdateGlobalParams({
                  ...globalParams,
                  marketSize: parseInt(e.target.value) || 0
                })}
              />
            </div>
            <div className="form-group">
              <label>Seasonality:</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={globalParams.seasonality}
                onChange={(e) => onUpdateGlobalParams({
                  ...globalParams,
                  seasonality: parseFloat(e.target.value)
                })}
              />
              <span>{globalParams.seasonality}x</span>
            </div>
            <div className="form-group">
              <label>Competition Level:</label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={globalParams.competitionLevel}
                onChange={(e) => onUpdateGlobalParams({
                  ...globalParams,
                  competitionLevel: parseFloat(e.target.value)
                })}
              />
              <span>{Math.round(globalParams.competitionLevel * 100)}%</span>
            </div>
          </div>
          <div className="empty-selection">
            <p>Select a component to configure its properties</p>
          </div>
        </div>
      </div>
    );
  }

  const updateProp = (key, value) => {
    onUpdateComponent(selectedComponent.id, { [key]: value });
  };

  const renderComponentConfig = () => {
    const { type, props } = selectedComponent;

    switch (type) {
      case 'SocialMediaAds':
        return (
          <div className="component-config">
            <h4>Social Media Ads</h4>
            <div className="form-group">
              <label>Platform:</label>
              <select value={props.platform} onChange={(e) => updateProp('platform', e.target.value)}>
                <option value="Facebook">Facebook</option>
                <option value="Instagram">Instagram</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Twitter">Twitter</option>
              </select>
            </div>
            <div className="form-group">
              <label>Budget ($):</label>
              <input
                type="number"
                value={props.budget}
                onChange={(e) => updateProp('budget', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="form-group">
              <label>Cost Per Click ($):</label>
              <input
                type="number"
                step="0.01"
                value={props.cpc}
                onChange={(e) => updateProp('cpc', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="form-group">
              <label>Target Audience:</label>
              <input
                type="text"
                value={props.targetAudience}
                onChange={(e) => updateProp('targetAudience', e.target.value)}
              />
            </div>
          </div>
        );

      case 'GoogleAds':
        return (
          <div className="component-config">
            <h4>Google Ads</h4>
            <div className="form-group">
              <label>Budget ($):</label>
              <input
                type="number"
                value={props.budget}
                onChange={(e) => updateProp('budget', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="form-group">
              <label>Cost Per Click ($):</label>
              <input
                type="number"
                step="0.01"
                value={props.cpc}
                onChange={(e) => updateProp('cpc', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="form-group">
              <label>Keywords:</label>
              <input
                type="text"
                value={props.keywords}
                onChange={(e) => updateProp('keywords', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Quality Score:</label>
              <input
                type="range"
                min="1"
                max="10"
                value={props.qualityScore}
                onChange={(e) => updateProp('qualityScore', parseInt(e.target.value))}
              />
              <span>{props.qualityScore}/10</span>
            </div>
          </div>
        );

      case 'LandingPage':
        return (
          <div className="component-config">
            <h4>Landing Page</h4>
            <div className="form-group">
              <label>Conversion Rate (%):</label>
              <input
                type="number"
                value={props.conversionRate}
                onChange={(e) => updateProp('conversionRate', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="form-group">
              <label>Offer Type:</label>
              <input
                type="text"
                value={props.offerType}
                onChange={(e) => updateProp('offerType', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Headline:</label>
              <input
                type="text"
                value={props.headline}
                onChange={(e) => updateProp('headline', e.target.value)}
              />
            </div>
          </div>
        );

      case 'EmailSequence':
        return (
          <div className="component-config">
            <h4>Email Sequence</h4>
            <div className="form-group">
              <label>Open Rate (%):</label>
              <input
                type="number"
                value={props.openRate}
                onChange={(e) => updateProp('openRate', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="form-group">
              <label>Click Rate (%):</label>
              <input
                type="number"
                value={props.clickRate}
                onChange={(e) => updateProp('clickRate', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="form-group">
              <label>Conversion Rate (%):</label>
              <input
                type="number"
                value={props.conversionRate}
                onChange={(e) => updateProp('conversionRate', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="form-group">
              <label>Sequence Length:</label>
              <input
                type="number"
                value={props.sequenceLength}
                onChange={(e) => updateProp('sequenceLength', parseInt(e.target.value) || 1)}
              />
            </div>
          </div>
        );

      case 'BookingSystem':
        return (
          <div className="component-config">
            <h4>Booking System</h4>
            <div className="form-group">
              <label>Conversion Rate (%):</label>
              <input
                type="number"
                value={props.conversionRate}
                onChange={(e) => updateProp('conversionRate', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="form-group">
              <label>Average Booking Value ($):</label>
              <input
                type="number"
                value={props.averageBookingValue}
                onChange={(e) => updateProp('averageBookingValue', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="form-group">
              <label>Booking Type:</label>
              <select value={props.bookingType} onChange={(e) => updateProp('bookingType', e.target.value)}>
                <option value="Table reservation">Table reservation</option>
                <option value="Event booking">Event booking</option>
                <option value="Catering order">Catering order</option>
              </select>
            </div>
          </div>
        );

      case 'RetargetingAds':
        return (
          <div className="component-config">
            <h4>Retargeting Ads</h4>
            <div className="form-group">
              <label>Budget ($):</label>
              <input
                type="number"
                value={props.budget}
                onChange={(e) => updateProp('budget', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="form-group">
              <label>Cost Per Click ($):</label>
              <input
                type="number"
                step="0.01"
                value={props.cpc}
                onChange={(e) => updateProp('cpc', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="form-group">
              <label>Audience Size:</label>
              <input
                type="number"
                value={props.audienceSize}
                onChange={(e) => updateProp('audienceSize', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="form-group">
              <label>Ad Frequency:</label>
              <input
                type="number"
                value={props.frequency}
                onChange={(e) => updateProp('frequency', parseInt(e.target.value) || 1)}
              />
            </div>
          </div>
        );

      default:
        return <div>Unknown component type</div>;
    }
  };

  return (
    <div className="configuration-panel">
      <h3>⚙️ Configuration</h3>
      <div className="panel-content">
        <div className="section">
          <h4>Global Parameters</h4>
          <div className="form-group">
            <label>Market Size:</label>
            <input
              type="number"
              value={globalParams.marketSize}
              onChange={(e) => onUpdateGlobalParams({
                ...globalParams,
                marketSize: parseInt(e.target.value) || 0
              })}
            />
          </div>
          <div className="form-group">
            <label>Seasonality:</label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={globalParams.seasonality}
              onChange={(e) => onUpdateGlobalParams({
                ...globalParams,
                seasonality: parseFloat(e.target.value)
              })}
            />
            <span>{globalParams.seasonality}x</span>
          </div>
          <div className="form-group">
            <label>Competition Level:</label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={globalParams.competitionLevel}
              onChange={(e) => onUpdateGlobalParams({
                ...globalParams,
                competitionLevel: parseFloat(e.target.value)
              })}
            />
            <span>{Math.round(globalParams.competitionLevel * 100)}%</span>
          </div>
        </div>
        <div className="section">
          {renderComponentConfig()}
        </div>
      </div>
    </div>
  );
};

export default ConfigurationPanel;