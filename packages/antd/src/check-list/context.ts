import { createCtx } from '@wove/react';
import { CheckListItemValue } from './types.js';

export const [useCheckListCtx, CheckListCtxProvider] = createCtx<{
  checkedValues: CheckListItemValue[];
  onChange: (value: CheckListItemValue, defaultChange?: boolean) => void;
  stopPropagation?: boolean;
}>();
