import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

const getCanvasComponent = (componentId: string) =>
  document.querySelector(`[data-component-id="${componentId}"]`);

describe('App usability features', () => {
  it('opens the help panel with funnel-building guidance', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /help/i }));

    expect(screen.getByText('How to build funnels')).toBeInTheDocument();
    expect(
      screen.getByText('Start with traffic, then convert interest, then nurture leads.')
    ).toBeInTheDocument();
  });

  it('lists local templates and loads a selected blueprint onto the canvas', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /load template/i }));

    const templateDialog = screen.getByRole('dialog', { name: /load a template/i });

    expect(within(templateDialog).getAllByRole('button')).toHaveLength(3);

    fireEvent.click(within(templateDialog).getByRole('button', { name: /restaurant ads funnel/i }));

    expect(screen.getByLabelText('Scenario name')).toHaveValue('Restaurant Ads Funnel');
    expect(getCanvasComponent('restaurant-google-ads')).toBeInTheDocument();
    expect(getCanvasComponent('restaurant-landing-page')).toBeInTheDocument();
  });

  it('shows tooltip descriptions when hovering loaded funnel cards', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /load template/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Restaurant Ads Funnel' }));

    const googleAdsCard = getCanvasComponent('restaurant-google-ads');
    expect(googleAdsCard).not.toBeNull();

    fireEvent.mouseEnter(googleAdsCard!);

    expect(screen.getByRole('tooltip')).toHaveTextContent(/paid search traffic from google/i);
  });

  it('cycles example prompts in the AI funnel generator', () => {
    render(<App />);

    const promptInput = screen.getByLabelText('AI funnel prompt');

    fireEvent.click(screen.getByRole('button', { name: /use example/i }));
    expect(promptInput).toHaveValue('Meta ads funnel for restaurant reservations');

    fireEvent.click(screen.getByRole('button', { name: /use example/i }));
    expect(promptInput).toHaveValue('Promote a special dinner event');

    fireEvent.click(screen.getByRole('button', { name: /use example/i }));
    expect(promptInput).toHaveValue('Email campaign funnel for returning customers');
  });

  it('replaces the canvas with a generated funnel from a recognized prompt', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /load template/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Restaurant Ads Funnel' }));

    expect(getCanvasComponent('restaurant-google-ads')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('AI funnel prompt'), {
      target: { value: 'Email campaign funnel for returning customers' },
    });
    fireEvent.click(screen.getByRole('button', { name: /generate funnel/i }));

    expect(screen.getByLabelText('Scenario name')).toHaveValue('AI: Email Nurture Funnel');
    expect(getCanvasComponent('ai-email-nurture-funnel-email-campaign-3')).toBeInTheDocument();
    expect(getCanvasComponent('restaurant-google-ads')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/generated email nurture funnel/i);
  });
});
