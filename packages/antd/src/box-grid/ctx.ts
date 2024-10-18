import { createContext } from 'react';
import { PresetDefaultGrid } from './constant.js';
import { type TBoxBreakpoint } from './type.js';

export type BoxGridProviderContextType = {
  horizontalGap: number;
  verticalGap: number;
  boxBreakpoint: TBoxBreakpoint;
  defaultGrid: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
};

export const defaultCtx: BoxGridProviderContextType = {
  boxBreakpoint: 'lg',
  defaultGrid: PresetDefaultGrid,
  horizontalGap: 10,
  verticalGap: 10,
};

export const BoxGridProviderCtx =
  createContext<BoxGridProviderContextType>(defaultCtx);
