import * as React from 'react';
import { Alert, Button } from 'antd';
import { isUndefinedOrNull, type TNoopDefine } from '@hyperse/utils';
import { FlexLayout } from '../flex-layout/index.js';

interface ErrorBoundaryProps {
  message?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  onRenderReset?: TNoopDefine;
  /** 栈消息最大高度，默认值200 */
  stackMaxHeight?: number | 'auto';
}

interface ErrorBoundaryStates {
  error?: Error | null;
  info?: {
    componentStack?: string;
  };
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryStates
> {
  state = {
    error: undefined,
    info: {
      componentStack: '',
    },
  };

  componentDidCatch(error: Error | null, info: object) {
    this.setState({ error, info });
  }

  render() {
    const { message, description, children, onRenderReset } = this.props;
    const { error, info } = this.state;
    const componentStack =
      info && info.componentStack ? info.componentStack : null;
    const errorMessage =
      typeof message === 'undefined' ? (error || '').toString() : message;
    const errorDescription =
      typeof description === 'undefined' ? componentStack : description;
    const stackMaxHeight = isUndefinedOrNull(this.props.stackMaxHeight)
      ? 200
      : this.props.stackMaxHeight;
    if (error) {
      return (
        <Alert
          type="error"
          message={
            <FlexLayout fullIndex={0} direction="horizontal">
              <span>{errorMessage}</span>
              <Button type="primary" ghost size="small" onClick={onRenderReset}>
                重置
              </Button>
            </FlexLayout>
          }
          description={
            <React.Fragment>
              <div style={{ maxHeight: stackMaxHeight, overflow: 'auto' }}>
                <pre style={{ fontSize: '0.9em' }}>{errorDescription}</pre>
              </div>
            </React.Fragment>
          }
        />
      );
    }
    return children;
  }
}

/**
 * react 异常拦截
 */
export const ErrorBoundaryWrapper = ErrorBoundary;
