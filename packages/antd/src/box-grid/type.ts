import { type CSSProperties, type ReactNode } from 'react';

export type TBoxBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export interface ICommonReact {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export type Gutter =
  | number
  | undefined
  | Partial<Record<TBoxBreakpoint, number>>;

export type GutterParams = Gutter | [Gutter, Gutter];
