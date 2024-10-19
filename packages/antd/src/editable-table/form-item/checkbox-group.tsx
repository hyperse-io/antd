import { useMemo } from 'react';
import { Checkbox, Form } from 'antd';
import { classNames } from '@dimjs/utils';
import { LabelValueItem, TAny } from '@hyperse/utils';
import { hooks } from '@wove/react';
import { tableCellRender } from '../../table-cell-render/index.js';
import { EditableCheckboxGroupConfig, EditableFormItemProps } from '../type.js';

type CheckboxGroupFormItemContent = Omit<
  EditableFormItemProps,
  'formItemProps'
> & {
  value?: Array<string | number>;
  onChange?: (value: TAny) => void;
};

const CheckboxGroupFormItemContent = (props: CheckboxGroupFormItemContent) => {
  const { editableConfig, editable, render } = props.fieldConfig;
  const editableComptProps = (editableConfig as EditableCheckboxGroupConfig)
    .editableComptProps;
  const options = useMemo(
    () => (editableComptProps.options || []) as LabelValueItem[],
    [editableComptProps.options]
  );
  const onChange = hooks.useCallbackRef((value) => {
    props.onChange?.(value);
    editableComptProps.onChange?.(value);
  });

  if (editable) {
    return (
      <Checkbox.Group
        {...editableComptProps}
        value={props.value}
        onChange={onChange}
      />
    );
  }

  return (
    <span className="editable-checkbox-group-view">
      {render
        ? render(props.value, options)
        : tableCellRender.selectorCell(options)(props.value)}
    </span>
  );
};

export const CheckboxGroupFormItem = (props: EditableFormItemProps) => {
  const { formItemProps } = props.fieldConfig;

  return (
    <Form.Item
      {...formItemProps}
      name={props.name}
      className={classNames(
        'editable-checkbox-group-form-item',
        formItemProps?.className
      )}
    >
      <CheckboxGroupFormItemContent {...props} />
    </Form.Item>
  );
};
