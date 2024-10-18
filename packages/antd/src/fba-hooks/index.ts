import { useArrayChange } from './use-array-change.js';
import { useCopyRemoveSpace } from './use-copy-remove-space.js';
import { useEffectCustom } from './use-effect-custom.js';
import { useEffectCustomAsync } from './use-effect-custom-async.js';
import { useMemoCustom } from './use-memo-custom.js';
import { usePrevious } from './use-previous.js';
import { useResponsivePoint } from './use-responsive-point.js';
import { useSafeState } from './use-safe-state.js';
import { useThemeToken } from './use-theme.js';

export const fbaHooks = {
  useEffectCustom: useEffectCustom,
  useEffectCustomAsync: useEffectCustomAsync,
  useThemeToken: useThemeToken,
  useArrayChange: useArrayChange,
  usePrevious: usePrevious,
  useResponsivePoint: useResponsivePoint,
  useSafeState: useSafeState,
  useMemoCustom: useMemoCustom,
  useCopyRemoveSpace: useCopyRemoveSpace,
};
