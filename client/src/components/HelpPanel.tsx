import React from 'react';
import { HelpCircle, Link2, MousePointerClick, X } from 'lucide-react';

interface HelpPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const helpSteps = [
  'Choose traffic sources like Google Ads or Facebook Ads to bring people in.',
  'Add conversion steps like a landing page and booking form to capture intent.',
  'Use nurture stages such as email campaigns to keep leads warm after conversion.',
];

const helperTips = [
  {
    title: 'Start simple',
    description: 'Build one clear path first, then branch only when a second channel adds value.',
    icon: MousePointerClick,
  },
  {
    title: 'Connect the story',
    description: 'Use Connect mode to map the flow your customer experiences from first click to final action.',
    icon: Link2,
  },
  {
    title: 'Load a template',
    description: 'Use the header template button when you want a quick starting point you can tweak.',
    icon: HelpCircle,
  },
];

export const HelpPanel = React.forwardRef<HTMLDivElement, HelpPanelProps>(
  ({ isOpen, onClose }, ref) => {
    if (!isOpen) {
      return null;
    }

    return (
      <aside
        ref={ref}
        role="dialog"
        aria-label="How to build funnels"
        style={{
          position: 'fixed',
          top: 72,
          right: 20,
          width: 360,
          maxWidth: 'calc(100vw - 32px)',
          background: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-float)',
          padding: 'var(--space-5)',
          zIndex: 'calc(var(--z-header) + 2)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-primary-subtle)',
                color: 'var(--color-primary)',
                fontSize: 'var(--text-helper)',
                fontWeight: 'var(--weight-semibold)',
                marginBottom: 'var(--space-3)',
              }}
            >
              <HelpCircle size={14} />
              Builder Guide
            </div>
            <h2
              style={{
                margin: '0 0 var(--space-2)',
                fontSize: '1rem',
                fontWeight: 'var(--weight-semibold)',
              }}
            >
              How to build funnels
            </h2>
            <p className="text-helper" style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
              Start with traffic, then convert interest, then nurture leads.
            </p>
          </div>

          <button
            onClick={onClose}
            className="btn-icon"
            style={{ width: 32, height: 32, flexShrink: 0 }}
            aria-label="Close help panel"
          >
            <X size={16} />
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-4)',
          }}
        >
          {helpSteps.map((step, index) => (
            <div
              key={step}
              style={{
                display: 'flex',
                gap: 'var(--space-3)',
                alignItems: 'flex-start',
                padding: 'var(--space-3)',
                background: 'var(--color-bg-control)',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: 'var(--color-primary)',
                  color: 'var(--color-text-on-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--text-helper)',
                  fontWeight: 'var(--weight-bold)',
                  flexShrink: 0,
                }}
              >
                {index + 1}
              </div>
              <p style={{ margin: 0, fontSize: 'var(--text-label)', lineHeight: 'var(--leading-normal)' }}>
                {step}
              </p>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
          {helperTips.map((tip) => {
            const Icon = tip.icon;

            return (
              <div
                key={tip.title}
                style={{
                  display: 'flex',
                  gap: 'var(--space-3)',
                  alignItems: 'flex-start',
                  paddingTop: 'var(--space-3)',
                  borderTop: '1px solid var(--color-border-muted)',
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-bg-control)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={15} style={{ color: 'var(--color-text-secondary)' }} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 'var(--text-label)',
                      fontWeight: 'var(--weight-semibold)',
                      marginBottom: 2,
                    }}
                  >
                    {tip.title}
                  </div>
                  <p className="text-helper" style={{ margin: 0 }}>
                    {tip.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </aside>
    );
  }
);

HelpPanel.displayName = 'HelpPanel';
