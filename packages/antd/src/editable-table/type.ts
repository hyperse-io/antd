import { ReactElement, ReactNode } from 'react';
import {
  FormItemProps,
  FormListFieldData,
  FormListOperation,
  InputNumberProps,
  InputProps,
  RadioGroupProps,
} from 'antd';
import { CheckboxGroupProps } from 'antd/lib/checkbox';
import { TextAreaProps } from 'antd/lib/input';
import { TAny } from '@hyperse/utils';
import { DatePickerWrapperProps } from '../date-picker-wrapper/index.js';
import { DateRangePickerWrapperProps } from '../date-range-picker-wrapper/index.js';
import { SelectorWrapperProps } from '../selector-wrapper/types.js';
import { SwitchWrapperProps } from '../switch-wrapper/index.js';
import { UploadWrapperProps } from '../upload-wrapper/index.js';

export type EditableTableName = string | number | Array<string | number>;
export type EditableTableRecordType = FormListFieldData & {
  operation: FormListOperation;
};

export type EditableInputConfig = {
  type: 'input';
  editableComptProps?: InputProps;
};
export type EditableInputNumberConfig = {
  type: 'inputNumber';
  editableComptProps?: InputNumberProps;
};

export type EditableSelectWrapperConfig = {
  type: 'selectorWrapper';
  editableComptProps: SelectorWrapperProps;
};

export type EditableDatePickerWrapperConfig = {
  type: 'datePickerWrapper';
  editableComptProps?: DatePickerWrapperProps;
};
export type EditableDateRangePickerWrapperConfig = {
  type: 'dateRangePickerWrapper';
  editableComptProps?: DateRangePickerWrapperProps;
};
export type EditableCheckboxGroupConfig = {
  type: 'checkboxGroup';
  editableComptProps: CheckboxGroupProps;
};
export type EditableRadioGroupConfig = {
  type: 'radioGroup';
  editableComptProps: RadioGroupProps;
};

export type EditableTextareaConfig = {
  type: 'textArea';
  editableComptProps: TextAreaProps;
};

export type EditableFileUploadConfig = {
  type: 'uploadWrapper';
  editableComptProps: UploadWrapperProps;
};

export type EditableSwitchWrapperConfig = {
  type: 'switchWrapper';
  editableComptProps: SwitchWrapperProps;
};

/**
 * 自定义编辑组件
 * ```
 * 1.需要处理Form.Item
 * 2. 例如
 *  editableConfig: {
      type: 'custom',
      editableComptProps: (props) => {
        return (
          <Form.Item name={props.name}>
            <Input />
          </Form.Item>
        );
      },
    },
    ```
 */
export type EditableCustomConfig = {
  type: 'custom';
  editableComptProps: (props: {
    name: Array<number | string>;
    editable?: boolean;
    completeName: Array<number | string>;
    tableRowIndex: number;
  }) => ReactElement;
};

export type EditableTypeConfig =
  | EditableCustomConfig
  | EditableInputConfig
  | EditableSelectWrapperConfig
  | EditableDatePickerWrapperConfig
  | EditableDateRangePickerWrapperConfig
  | EditableCheckboxGroupConfig
  | EditableTextareaConfig
  | EditableInputNumberConfig
  | EditableRadioGroupConfig
  | EditableFileUploadConfig
  | EditableSwitchWrapperConfig;

export type FieldSingleConfig = {
  editable?: boolean | ((data: { tableRowIndex: number }) => boolean);
  editableConfig?: EditableTypeConfig;
  /**
   * 当editableConfig type=custom时，此配置无效
   */
  formItemProps?: Omit<FormItemProps, 'name'>;
  /**
   * 自定义非编辑渲染
   * 1. 当editableConfig type=custom时，此配置无效
   * 2. 只在editable=false的情况下有效
   * 3. 同级配置 editableConfigList后，同级render配置失效
   * 4. checkboxGroup、radioGroup、selectorWrapper第二次参数为options数组
   */
  render?: (params?: TAny, other?: TAny) => ReactNode;
};

export type FormListItemMethodOperateProps = {
  tableRowIndex: number;
  add: FormListOperation['add'];
  remove: () => void;
  formListItemIndex: number;
  value: TAny;
};
export type FormListMethodOperateProps = {
  tableRowIndex: number;
  add: FormListOperation['add'];
  value: TAny;
};

export type FormListConfig = {
  editableConfigList: Array<FieldSingleConfig & { fieldName: string }>;
  onFormListBeforeRender?: (
    data: FormListMethodOperateProps
  ) => ReactElement | null;
  onFormListAfterRender?: (
    data: FormListMethodOperateProps
  ) => ReactElement | null;
  onFormListItemBeforeRender?: (
    data: FormListItemMethodOperateProps
  ) => ReactElement | null;
  onFormListItemAfterRender?: (
    data: FormListItemMethodOperateProps
  ) => ReactElement | null;
  deleteOperateRender?: (data: {
    remove: () => void;
    formListItemIndex: number;
  }) => ReactElement;
};

export type EditableFormItemProps = {
  name: Array<number | string>;
  fieldConfig: Omit<FieldSingleConfig, 'editable'> & { editable?: boolean };
};
