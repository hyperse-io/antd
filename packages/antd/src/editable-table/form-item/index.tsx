import { extend } from '@dimjs/utils';
import { FieldSingleConfig } from '../type.js';
import { getEditable } from '../utils.js';
import { CheckboxGroupFormItem } from './checkbox-group.jsx';
import { DatePickerWrapperFormItem } from './date-picker-wrapper.jsx';
import { DateRangePickerWrapperFormItem } from './date-range-picker-wrapper.jsx';
import { InputFormItem } from './input.jsx';
import { InputNumberFormItem } from './input-number.jsx';
import { RadioGroupFormItem } from './radio-group.jsx';
import { SelectorWrapperFormItem } from './selector-wrapper.jsx';
import { SwitchWrapperFormItem } from './switch-wrapper.jsx';
import { TextFormItem } from './text.jsx';
import { TextAreaFormItem } from './textarea.jsx';
import { UploadWrapperFormItem } from './upload-wrapper.jsx';

export type FormItemAdapterProps = {
  name: Array<number | string>;
  completeName: Array<number | string>;
  fieldConfig: FieldSingleConfig;
  tableRowIndex: number;
};

export const FormItemAdapter = (props: FormItemAdapterProps) => {
  const { editableConfig, editable } = props.fieldConfig;
  const newEditable = getEditable(editable, props.tableRowIndex);
  const fieldConfig = extend({}, props.fieldConfig, { editable: newEditable });

  const commomProps = {
    name: props.name,
    fieldConfig,
  };

  if (editableConfig?.type === 'input' && newEditable) {
    return <InputFormItem {...commomProps} />;
  } else if (editableConfig?.type === 'inputNumber' && newEditable) {
    return <InputNumberFormItem {...commomProps} />;
  } else if (editableConfig?.type === 'textArea' && newEditable) {
    return <TextAreaFormItem {...commomProps} />;
  } else if (editableConfig?.type === 'datePickerWrapper' && newEditable) {
    return <DatePickerWrapperFormItem {...commomProps} />;
  } else if (editableConfig?.type === 'dateRangePickerWrapper') {
    return <DateRangePickerWrapperFormItem {...commomProps} />;
  } else if (editableConfig?.type === 'selectorWrapper') {
    return <SelectorWrapperFormItem {...commomProps} />;
  } else if (editableConfig?.type === 'checkboxGroup') {
    return <CheckboxGroupFormItem {...commomProps} />;
  } else if (editableConfig?.type === 'radioGroup') {
    return <RadioGroupFormItem {...commomProps} />;
  } else if (editableConfig?.type === 'uploadWrapper') {
    return <UploadWrapperFormItem {...commomProps} />;
  } else if (editableConfig?.type === 'switchWrapper') {
    return <SwitchWrapperFormItem {...commomProps} />;
  } else if (editableConfig?.type === 'custom') {
    return editableConfig.editableComptProps({
      name: props.name,
      editable: newEditable,
      completeName: props.completeName,
      tableRowIndex: props.tableRowIndex,
    });
  }

  return <TextFormItem {...commomProps} />;
};
