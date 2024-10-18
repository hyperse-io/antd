import { toArray } from '@hyperse/utils';
import { CheckListItemValue, CheckListValue } from './types.js';

export const getValueList = (value?: CheckListValue, multiple?: boolean) => {
  if (value !== undefined) {
    const valueList = toArray<CheckListItemValue>(value);
    return multiple ? valueList : valueList.splice(0, 1);
  }
  return null;
};
