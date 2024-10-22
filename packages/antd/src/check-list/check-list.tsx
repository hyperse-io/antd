import { type ReactNode, useMemo } from 'react';
import { classNames, extend } from '@dimjs/utils';
import { hooks } from '@wove/react';
import { type CommonPropsWithChildren } from '../_utils/native-props.js';
import { fbaHooks } from '../fba-hooks/index.js';
import { CheckListCtxProvider } from './context.js';
import { type CheckListItemValue } from './types.js';
import { getValueList } from './utils.js';
import './style.less';

export type CheckListSelectedValue<T extends 'multi' | 'radio'> =
  T extends 'multi' ? CheckListItemValue[] : CheckListItemValue;

export type CheckListProps<T extends 'multi' | 'radio'> = {
  multiple?: boolean;
  onChange?: (
    value: CheckListSelectedValue<T>,
    operateValue: CheckListItemValue
  ) => void;
  onPreChange?: (value: CheckListItemValue) => Promise<void>;
  value?: CheckListSelectedValue<T>;
  defaultValue?: CheckListSelectedValue<T>;
  beforeExtra?: ReactNode;
  afterExtra?: ReactNode;
  stopPropagation?: boolean;
  required?: boolean;
} & CommonPropsWithChildren;

export const CheckListInner = <T extends 'multi' | 'radio'>(
  props: CheckListProps<T>
) => {
  const [checkedValues, arrayOperate] =
    fbaHooks.useArrayChange<CheckListItemValue>([]);

  const valueList = useMemo(() => {
    return getValueList(props.value, props.multiple);
  }, [props.value, props.multiple]);

  fbaHooks.useEffectCustom(() => {
    const current =
      valueList || getValueList(props.defaultValue, props.multiple);
    arrayOperate.resetList(current || []);
  }, []);

  hooks.useUpdateEffect(() => {
    arrayOperate.resetList(valueList || []);
  }, [valueList]);

  const onChange = hooks.useCallbackRef(
    async (value: CheckListItemValue, defaultChange) => {
      if (props.onPreChange) {
        await props.onPreChange(value);
      }
      const targetIndex = checkedValues.findIndex((temp) => temp === value);
      if (props.multiple === true) {
        if (checkedValues.length === 1 && targetIndex >= 0 && props.required) {
          return;
        }
        if (targetIndex >= 0) {
          arrayOperate.delete(targetIndex);
        } else {
          arrayOperate.add(value);
        }
      } else {
        if (targetIndex >= 0 && props.required) {
          return;
        } else {
          arrayOperate.resetList(targetIndex >= 0 ? [] : [value]);
        }
      }
      if (!defaultChange) {
        const newValues = arrayOperate.getList();
        let selectedValue;
        if (props.multiple) {
          selectedValue =
            newValues.length > 0 ? extend([], newValues) : undefined;
        } else {
          selectedValue = newValues.length > 0 ? newValues[0] : undefined;
        }
        props.onChange?.(selectedValue as CheckListSelectedValue<T>, value);
      }
    }
  );

  return (
    <div
      className={classNames('check-list', props.className)}
      style={props.style}
    >
      <CheckListCtxProvider
        value={{
          onChange,
          checkedValues,
          stopPropagation: props.stopPropagation,
        }}
      >
        {props.beforeExtra}
        {props.children}
        {props.afterExtra}
      </CheckListCtxProvider>
    </div>
  );
};
