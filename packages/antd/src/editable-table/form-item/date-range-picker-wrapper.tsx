import { useMemo } from 'react';
import { Form } from 'antd';
import { isArray } from '@dimjs/lang';
import { classNames } from '@dimjs/utils';
import { TAny } from '@hyperse/utils';
import { hooks } from '@wove/react';
import { DateRangePickerWrapper } from '../../date-range-picker-wrapper/index.js';
import {
  EditableDateRangePickerWrapperConfig,
  EditableFormItemProps,
} from '../type.js';

type FormItemContentProps = Omit<EditableFormItemProps, 'formItemProps'> & {
  value?: [string, string];
  onChange?: (value?: [string, string]) => void;
};

const FormItemContent = (props: FormItemContentProps) => {
  const { editableConfig, editable, render } = props.fieldConfig;
  const editableComptProps = (
    editableConfig as EditableDateRangePickerWrapperConfig
  ).editableComptProps;

  const onChange = hooks.useCallbackRef((data) => {
    props.onChange?.(data);
    editableComptProps?.onChange?.(data);
  });

  const viewLabel = useMemo(() => {
    const value = (
      isArray(props.value) ? props.value : ([] as any[])
    ) as TAny[];
    if (editable) return undefined;
    return value.join('~');
  }, [editable, props.value]);

  if (editable) {
    return (
      <DateRangePickerWrapper
        allowClear
        {...editableComptProps}
        value={props.value}
        onChange={onChange}
      />
    );
  }
  return (
    <span className="editable-date-range-picker-view">
      {render ? render(props.value) : viewLabel}
    </span>
  );
};

export const DateRangePickerWrapperFormItem = (
  props: EditableFormItemProps
) => {
  const { formItemProps } = props.fieldConfig;
  return (
    <Form.Item
      {...formItemProps}
      name={props.name}
      className={classNames(
        'editable-date-range-picker-wraper-form-item',
        formItemProps?.className
      )}
    >
      <FormItemContent {...props} />
    </Form.Item>
  );
};
