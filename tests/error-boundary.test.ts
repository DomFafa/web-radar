import { describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { ErrorBoundary } from '../src/client/ErrorBoundary';

describe('ErrorBoundary', () => {
  it('updates state via getDerivedStateFromError', () => {
    const error = new Error('Test crash');
    const state = ErrorBoundary.getDerivedStateFromError(error);
    expect(state).toEqual({
      hasError: true,
      error,
    });
  });

  it('renders children when no error occurs', () => {
    const html = renderToString(
      createElement(
        ErrorBoundary,
        { scope: 'section' },
        createElement('div', { id: 'child' }, 'Normal Content'),
      ),
    );
    expect(html).toContain('Normal Content');
    expect(html).not.toContain('error-boundary-card');
  });

  it('handles componentDidCatch and forwards to onError callback', () => {
    const onError = vi.fn();
    const boundary = new ErrorBoundary({ children: 'Child', onError });
    boundary.setState = vi.fn((patch: any) => {
      boundary.state = { ...boundary.state, ...patch };
    }) as any;
    const error = new Error('Component crashed');
    const errorInfo = { componentStack: '\n    in ProblemChild' };

    boundary.componentDidCatch(error, errorInfo);

    expect(boundary.setState).toHaveBeenCalledWith({ errorInfo });
    expect(boundary.state.errorInfo).toEqual(errorInfo);
    expect(onError).toHaveBeenCalledWith(error, errorInfo);
  });

  it('resets error state and triggers onReset callback on reset()', () => {
    const onReset = vi.fn();
    const boundary = new ErrorBoundary({ children: 'Child', onReset });
    boundary.setState = vi.fn((patch: any) => {
      boundary.state = { ...boundary.state, ...patch };
    }) as any;
    boundary.state = {
      hasError: true,
      error: new Error('Something broke'),
      errorInfo: { componentStack: 'stack trace' },
    };

    boundary.reset();

    expect(boundary.setState).toHaveBeenCalledWith({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    expect(boundary.state).toEqual({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('renders fallback when state has error', () => {
    const boundary = new ErrorBoundary({
      children: 'Child',
      title: '自定义崩溃标题',
      description: '自定义描述信息',
    });
    boundary.state = {
      hasError: true,
      error: new Error('Render failed'),
      errorInfo: { componentStack: 'trace' },
    };

    const rendered = boundary.render();
    const html = renderToString(rendered as any);

    expect(html).toContain('自定义崩溃标题');
    expect(html).toContain('自定义描述信息');
    expect(html).toContain('Render failed');
    expect(html).toContain('error-boundary-card');
  });

  it('supports custom fallback function and passes error & reset handler', () => {
    const onReset = vi.fn();
    const boundary = new ErrorBoundary({
      children: 'Child',
      fallback: (err, reset) =>
        createElement('div', { className: 'custom-fallback' }, err.message),
    });
    boundary.state = {
      hasError: true,
      error: new Error('Custom error trigger'),
      errorInfo: null,
    };

    const rendered = boundary.render();
    const html = renderToString(rendered as any);

    expect(html).toContain('custom-fallback');
    expect(html).toContain('Custom error trigger');
  });
});
