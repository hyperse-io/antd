import {
  Component,
  ComponentType,
  ErrorInfo,
  FunctionComponent,
  isValidElement,
  PropsWithChildren,
  PropsWithRef,
  ReactElement,
} from 'react';

const changedArray = (a: Array<unknown> = [], b: Array<unknown> = []) =>
  a.length !== b.length || a.some((item, index) => !Object.is(item, b[index]));

export interface FallbackProps {
  error: Error;
  resetErrorBoundary: (...args: Array<unknown>) => void;
}

export interface ErrorBoundaryPropsWithComponent {
  onResetKeysChange?: (
    prevResetKeys: Array<unknown> | undefined,
    resetKeys: Array<unknown> | undefined
  ) => void;
  onReset?: (...args: Array<unknown>) => void;
  onError?: (error: Error, info: { componentStack: string }) => void;
  resetKeys?: Array<unknown>;
  FallbackComponent: ComponentType<FallbackProps>;
}

export type FallbackRender = (
  props: FallbackProps
) => ReactElement<
  unknown,
  string | FunctionComponent | typeof Component
> | null;

export interface ErrorBoundaryPropsWithRender {
  onResetKeysChange?: (
    prevResetKeys: Array<unknown> | undefined,
    resetKeys: Array<unknown> | undefined
  ) => void;
  onReset?: (...args: Array<unknown>) => void;
  onError?: (error: Error, info: { componentStack: string }) => void;
  resetKeys?: Array<unknown>;
  fallbackRender: FallbackRender;
}

export interface ErrorBoundaryPropsWithFallback {
  onResetKeysChange?: (
    prevResetKeys: Array<unknown> | undefined,
    resetKeys: Array<unknown> | undefined
  ) => void;
  onReset?: (...args: Array<unknown>) => void;
  onError?: (error: Error, info: { componentStack: string }) => void;
  resetKeys?: Array<unknown>;
  fallback: ReactElement<
    unknown,
    string | FunctionComponent | typeof Component
  > | null;
}

export type ErrorBoundaryProps =
  | ErrorBoundaryPropsWithFallback
  | ErrorBoundaryPropsWithComponent
  | ErrorBoundaryPropsWithRender;

type ErrorBoundaryState = { error: Error | null };

const initialState: ErrorBoundaryState = { error: null };

export class ErrorBoundary extends Component<
  PropsWithRef<PropsWithChildren<ErrorBoundaryProps>>,
  ErrorBoundaryState
> {
  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  state = initialState;
  updatedWithError = false;
  resetErrorBoundary = (...args: Array<unknown>) => {
    this.props.onReset?.(...args);
    this.reset();
  };

  reset() {
    this.updatedWithError = false;
    this.setState(initialState);
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info as any);
  }

  componentDidMount() {
    const { error } = this.state;

    if (error !== null) {
      this.updatedWithError = true;
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { error } = this.state;
    const { resetKeys } = this.props;

    // There's an edge case where if the thing that triggered the error
    // happens to *also* be in the resetKeys array, we'd end up resetting
    // the error boundary immediately. This would likely trigger a second
    // error to be thrown.
    // So we make sure that we don't check the resetKeys on the first call
    // of cDU after the error is set
    if (error !== null && !this.updatedWithError) {
      this.updatedWithError = true;
      return;
    }

    if (error !== null && changedArray(prevProps.resetKeys, resetKeys)) {
      this.props.onResetKeysChange?.(prevProps.resetKeys, resetKeys);
      this.reset();
    }
  }

  render() {
    const { error } = this.state;
    // @ts-expect-error ts(2339) (at least one of these will be defined though, and we check for their existence)
    const { fallbackRender, FallbackComponent, fallback } = this.props;

    if (error !== null) {
      const props = {
        error,
        resetErrorBoundary: this.resetErrorBoundary,
      };
      if (isValidElement(fallback)) {
        return fallback;
      } else if (typeof fallbackRender === 'function') {
        return (fallbackRender as FallbackRender)(props);
      } else if (FallbackComponent) {
        return <FallbackComponent {...props} />;
      } else {
        throw new Error(
          'react-error-boundary requires either a fallback, fallbackRender, or FallbackComponent prop'
        );
      }
    }

    return this.props.children;
  }
}

// export function withErrorBoundary<P>(
//   Component: ComponentType<P>,
//   errorBoundaryProps: ErrorBoundaryProps,
// ): ComponentType<P> {
//   const Wrapped: ComponentType<P> = (props) => {
//     return (
//       <ErrorBoundary {...errorBoundaryProps}>
//         <Component {...props} />
//       </ErrorBoundary>
//     );
//   };

//   // Format for display in DevTools
//   const name = Component.displayName || Component.name || 'Unknown';
//   Wrapped.displayName = `withErrorBoundary(${name})`;

//   return Wrapped;
// }

// export function useErrorHandler<P = Error>(
//   givenError?: P | null | undefined,
// ): Dispatch<SetStateAction<P | null>> {
//   const [error, setError] = useState<P | null>(null);
//   if (givenError) throw givenError;
//   if (error) throw error;
//   return setError;
// }
