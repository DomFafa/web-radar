import { Component, useState, type ErrorInfo, type ReactNode } from 'react';
import { Button, Icon } from './components';

export interface ErrorBoundaryProps {
  children?: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  scope?: 'app' | 'section';
  title?: string;
  description?: string;
  onReset?: () => void;
  onBack?: () => void;
  backText?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  reset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    this.props.onReset?.();
  };

  override render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const {
      children,
      fallback,
      scope = 'section',
      title,
      description,
      onBack,
      backText = '返回',
    } = this.props;

    if (!hasError) {
      return children;
    }

    if (fallback) {
      if (typeof fallback === 'function') {
        return fallback(error || new Error('未知错误'), this.reset);
      }
      return fallback;
    }

    const defaultTitle = scope === 'app' ? 'Web Radar 遇到未预期的异常' : '该模块加载遇到异常';
    const defaultDesc =
      scope === 'app'
        ? '页面发生未能处理的运行时错误。您可以尝试重新加载页面，或重试恢复。'
        : '当前组件渲染出错，您可以尝试重试，或返回上一步操作。';

    return (
      <ErrorFallbackUI
        scope={scope}
        title={title || defaultTitle}
        description={description || defaultDesc}
        error={error}
        errorInfo={errorInfo}
        onReset={this.reset}
        onBack={onBack}
        backText={backText}
      />
    );
  }
}

export function ErrorFallbackUI({
  scope,
  title,
  description,
  error,
  errorInfo,
  onReset,
  onBack,
  backText,
}: {
  scope: 'app' | 'section';
  title: string;
  description: string;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onReset: () => void;
  onBack?: () => void;
  backText: string;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const errorMessage = error?.message || (error ? String(error) : '未知异常');
  const componentStack = errorInfo?.componentStack || '';

  const handleCopy = async () => {
    const details = [
      `Error: ${errorMessage}`,
      error?.stack ? `\nStack:\n${error.stack}` : '',
      componentStack ? `\nComponent Stack:\n${componentStack}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(details);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // ignore clipboard write failure
    }
  };

  return (
    <div
      className={`error-boundary-container ${scope === 'app' ? 'is-app-scope' : 'is-section-scope'}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="error-boundary-card">
        <div className="error-boundary-badge">
          <Icon name="alert" size={26} />
        </div>
        <h2 className="error-boundary-title">{title}</h2>
        <p className="error-boundary-desc">{description}</p>

        {error && (
          <div className="error-boundary-summary">
            <code className="error-boundary-msg">{errorMessage}</code>
          </div>
        )}

        <div className="error-boundary-actions">
          <Button kind="primary" onClick={onReset}>
            <Icon name="refresh" size={16} /> 重试
          </Button>
          {onBack && (
            <Button kind="secondary" onClick={onBack}>
              <Icon name="back" size={16} /> {backText}
            </Button>
          )}
          {scope === 'app' && (
            <Button kind="secondary" onClick={() => window.location.reload()}>
              重新加载页面
            </Button>
          )}
        </div>

        {(error?.stack || componentStack) && (
          <div className="error-boundary-details-wrapper">
            <button
              type="button"
              className="error-boundary-toggle-btn"
              onClick={() => setShowDetails(!showDetails)}
              aria-expanded={showDetails}
            >
              <Icon name={showDetails ? 'up' : 'down'} size={14} />
              {showDetails ? '收起技术详情' : '展开技术详情'}
            </button>
            {showDetails && (
              <div className="error-boundary-details-body">
                <div className="error-boundary-details-bar">
                  <span>错误信息</span>
                  <button
                    type="button"
                    className="error-boundary-copy-btn"
                    onClick={handleCopy}
                  >
                    <Icon name={copied ? 'check' : 'copy'} size={14} />
                    {copied ? '已复制' : '复制详情'}
                  </button>
                </div>
                <pre className="error-boundary-stack">
                  {error?.stack || errorMessage}
                  {componentStack && `\n\nComponent Stack:${componentStack}`}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ErrorBoundary;
