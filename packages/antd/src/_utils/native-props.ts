import { type CSSProperties, type ReactNode } from 'react';
import { type TPlainObject } from '@hyperse/utils';

export interface CommonProps<S extends TPlainObject = TPlainObject> {
  className?: string;
  style?: CSSProperties & Partial<S>;
}
export interface CommonPropsWithChildren<
  S extends TPlainObject = TPlainObject,
> {
  className?: string;
  style?: CSSProperties & Partial<S>;
  children?: ReactNode | undefined;
}
