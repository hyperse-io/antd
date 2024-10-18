import { useMemo } from 'react';
import { Form, Radio } from 'antd';
import { classNames } from '@dimjs/utils';
import { LabelValueItem } from '@hyperse/utils';
import { hooks } from '@wove/react';
import { tableCellRender } from '../../table-cell-render';
import { EditableFormItemProps, EditableRadioGroupConfig } from '../type';

type RadioGroupFormItemContent = Omit<
  EditableFormItemProps,
  'formItemProps'
> & {
  value?: string | number;
  onChange?: (value: string | number) => void;
};

const RadioGroupFormItemContent = (props: RadioGroupFormItemContent) => {
  const { editableConfig, editable, render } = props.fieldConfig;
  const editableComptProps = (editableConfig as EditableRadioGroupConfig)
    .editableComptProps;
  const options = useMemo(
    () =>
      (editableComptProps.options || []) as LabelValueItem<string | number>[],
    [editableComptProps.options]
  );

  const onChange = hooks.useCallbackRef((e) => {
    props.onChange?.(e.target.value as string | number);
    editableComptProps.onChange?.(e);
  });

  if (editable) {
    return (
      <Radio.Group
        {...editableComptProps}
        value={props.value}
        onChange={onChange}
      />
    );
  }
  return (
    <span className="editable-radio-group-view">
      {render
        ? render(props.value, options)
        : tableCellRender.selectorCell(options)(props.value)}
    </span>
  );
};

export const RadioGroupFormItem = (props: EditableFormItemProps) => {
  const { formItemProps } = props.fieldConfig;

  return (
    <Form.Item
      {...formItemProps}
      name={props.name}
      className={classNames(
        'editable-radio-group-form-item',
        formItemProps?.className
      )}
    >
      <RadioGroupFormItemContent {...props} />
    </Form.Item>
  );
};
