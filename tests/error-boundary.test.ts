import { afterEach, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { ErrorBoundary, isChunkLoadError } from '../src/client/ErrorBoundary';

afterEach(() => { vi.unstubAllGlobals(); });

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

  it.each([
    'Failed to fetch dynamically imported module: https://web-radar.net/assets/Dashboard-old.js',
    'error loading dynamically imported module: https://web-radar.net/assets/Dashboard-old.js',
    'Importing a module script failed.',
    'Loading chunk 12 failed.',
    'Loading CSS chunk 12 failed.',
    'Unable to preload CSS for /assets/Dashboard-old.css',
  ])('offers a current-version refresh for module loading failure: %s', message => {
    const boundary = new ErrorBoundary({ title: '控制台加载异常', description: '请重试或返回上一步。' });
    boundary.state = { hasError: true, error: new TypeError(message), errorInfo: null };
    const html = renderToString(boundary.render());
    expect(html).toContain('页面资源未能加载');
    expect(html).toContain('刷新加载当前版本');
    expect(html).toContain('已保存的草稿会保留');
    expect(html).not.toContain('请重试或返回上一步。');
  });

  it('reloads only on an explicit recovery action and preserves persisted drafts and the current URL', () => {
    const reload = vi.fn(), onReset = vi.fn();
    const session = new Map([['edm-draft:v1:workspace:actor', '{"draft":"saved"}']]);
    const local = new Map([['site-draft', '{"draft":"saved"}']]);
    vi.stubGlobal('window', { location: { href: 'https://web-radar.net/?view=dashboard', reload } });
    vi.stubGlobal('sessionStorage', { clear: vi.fn(() => session.clear()), removeItem: vi.fn((key: string) => session.delete(key)) });
    vi.stubGlobal('localStorage', { clear: vi.fn(() => local.clear()), removeItem: vi.fn((key: string) => local.delete(key)) });
    const boundary = new ErrorBoundary({ scope: 'app', onReset });
    boundary.setState = vi.fn() as any;
    const error = new TypeError('Failed to fetch dynamically imported module: /assets/Dashboard-old.js');
    boundary.state = { hasError: true, error, errorInfo: null };

    // Deriving/rendering the fallback must never trigger an automatic reload loop.
    ErrorBoundary.getDerivedStateFromError(error);
    const html = renderToString(boundary.render());
    expect(reload).not.toHaveBeenCalled();
    expect(html).not.toContain('重新加载页面');
    boundary.reset();

    expect(reload).toHaveBeenCalledTimes(1);
    expect(boundary.setState).not.toHaveBeenCalled();
    expect(onReset).not.toHaveBeenCalled();
    expect(window.location.href).toBe('https://web-radar.net/?view=dashboard');
    expect(session.get('edm-draft:v1:workspace:actor')).toBe('{"draft":"saved"}');
    expect(local.get('site-draft')).toBe('{"draft":"saved"}');
  });

  it('recognizes named chunk failures without treating ordinary API/network/render errors as version errors', () => {
    const chunk = new Error('Resource unavailable');
    chunk.name = 'ChunkLoadError';
    expect(isChunkLoadError(chunk)).toBe(true);
    for (const error of [null, new TypeError('Failed to fetch'), new Error('Cannot read properties of undefined'), new Error('请求失败（500）')]) {
      expect(isChunkLoadError(error)).toBe(false);
    }
  });
});
