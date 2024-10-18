import { CSSProperties, ReactElement } from 'react';
import { classNames } from '@dimjs/utils';
import { hooks } from '@wove/react';
import { useCheckListCtx } from './context.js';
import { CheckListItemValue } from './types.js';

export type CheckListItemContentProps = {
  checked?: boolean;
  disabled?: boolean;
  onClick?: (event) => void;
  className?: string;
  readonly?: boolean;
  style?: CSSProperties;
};

export type CheckListItemProps = {
  value: CheckListItemValue;
  disabled?: boolean;
  readonly?: boolean;
  children: (data: CheckListItemContentProps) => ReactElement;
  className?: string;
  style?: CSSProperties;
};

export const CheckListItem = (props: CheckListItemProps) => {
  const context = useCheckListCtx();

  if (context === null) {
    console.error('CheckList.Item can only be used inside CheckList.');
    return null;
  }

  const onClick = hooks.useCallbackRef((event) => {
    if (context.stopPropagation) {
      event.stopPropagation();
    }
    if (!props.disabled) {
      context?.onChange(props.value);
    }
  });

  const checked =
    context?.checkedValues.findIndex((temp) => temp === props.value) >= 0;
  const checkedClassPrefix = 'check-list';

  const className = classNames(
    `${checkedClassPrefix}-item`,
    {
      [`${checkedClassPrefix}-disabled`]: props.disabled,
      [`${checkedClassPrefix}-readonly`]: props.readonly,
      [`${checkedClassPrefix}-checked`]: checked,
    },
    props.className
  );

  return props.children({
    onClick,
    checked,
    disabled: props.disabled,
    readonly: props.readonly,
    className,
    style: props.style,
  });
};
