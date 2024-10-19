import { Form } from 'antd';
import { classNames } from '@dimjs/utils';
import { DatePickerWrapper } from '../../date-picker-wrapper/index.js';
import {
  EditableDatePickerWrapperConfig,
  EditableFormItemProps,
} from '../type.js';

export const DatePickerWrapperFormItem = (props: EditableFormItemProps) => {
  const { formItemProps, editableConfig } = props.fieldConfig;
  return (
    <Form.Item
      {...formItemProps}
      name={props.name}
      className={classNames(
        'editable-date-picker-wraper-form-item',
        formItemProps?.className
      )}
    >
      <DatePickerWrapper
        allowClear
        {...(editableConfig as EditableDatePickerWrapperConfig)
          .editableComptProps}
      />
    </Form.Item>
  );
};
