import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import {
  AI_FUNNEL_EXAMPLE_PROMPTS,
  AI_FUNNEL_HELPER_TEXT,
  AI_FUNNEL_INPUT_PLACEHOLDER,
} from './funnelPromptTemplates';
import {
  generateFunnelFromPrompt,
  type GeneratedFunnelSuccess,
} from './generateFunnelFromPrompt';

interface AIFunnelGeneratorProps {
  onGenerateFunnel: (generatedFunnel: GeneratedFunnelSuccess) => void;
}

export const AIFunnelGenerator: React.FC<AIFunnelGeneratorProps> = ({ onGenerateFunnel }) => {
  const [prompt, setPrompt] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [exampleIndex, setExampleIndex] = useState(0);

  const handleGenerate = () => {
    const result = generateFunnelFromPrompt(prompt);

    setMessage(result.message);
    setIsError(!result.recognized);

    if (result.recognized) {
      onGenerateFunnel(result);
    }
  };

  const handleUseExample = () => {
    const nextPrompt = AI_FUNNEL_EXAMPLE_PROMPTS[exampleIndex];

    setPrompt(nextPrompt);
    setMessage('');
    setIsError(false);
    setExampleIndex((currentIndex) => (currentIndex + 1) % AI_FUNNEL_EXAMPLE_PROMPTS.length);
  };

  return (
    <section
      className="surface"
      style={{
        padding: 'var(--space-3) var(--space-4)',
        display: 'grid',
        gap: 'var(--space-2)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-3)',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-primary-subtle)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Sparkles size={14} />
          </div>
          <div>
            <div className="text-section-title">AI Funnel Generator</div>
            <p className="text-helper" style={{ margin: 0 }}>
              {AI_FUNNEL_HELPER_TEXT}
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            flexWrap: 'wrap',
            flex: '1 1 420px',
            justifyContent: 'flex-end',
          }}
        >
          <input
            id="ai-funnel-prompt"
            aria-label="AI funnel prompt"
            type="text"
            value={prompt}
            onChange={(event) => {
              setPrompt(event.target.value);
              if (message) {
                setMessage('');
                setIsError(false);
              }
            }}
            placeholder={AI_FUNNEL_INPUT_PLACEHOLDER}
            className="control-input"
            style={{ flex: '1 1 280px', minWidth: 240 }}
          />
          <button type="button" onClick={handleGenerate} className="btn btn-primary">
            Generate Funnel
          </button>
          <button type="button" onClick={handleUseExample} className="btn btn-ghost">
            Use Example
          </button>
        </div>
      </div>

      <div
        role="status"
        aria-live="polite"
        className="text-helper"
        style={{
          minHeight: 18,
          color: isError ? 'var(--color-danger)' : 'var(--color-text-secondary)',
        }}
      >
        {message}
      </div>
    </section>
  );
};
