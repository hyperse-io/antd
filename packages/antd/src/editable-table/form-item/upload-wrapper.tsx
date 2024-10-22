import { Form } from 'antd';
import { classNames } from '@dimjs/utils';
import { type TAny } from '@hyperse/utils';
import { UploadWrapper } from '../../upload-wrapper/index.js';
import {
  type EditableFileUploadConfig,
  type EditableFormItemProps,
} from '../type.js';

const UploadWrapperFormItemContent = (
  props: EditableFormItemProps & {
    value?: TAny;
    onChange?: (value?: TAny) => void;
  }
) => {
  const { editableConfig, render, editable } = props.fieldConfig;
  const { children, ...otherProps } = (
    editableConfig as EditableFileUploadConfig
  ).editableComptProps;
  if (editable) {
    return (
      <UploadWrapper
        listType="text"
        {...otherProps}
        value={props.value}
        onChange={props.onChange}
      >
        {children}
      </UploadWrapper>
    );
  }
  return (
    <div className="upload-wrapper-selector-view">
      {render ? (
        render(props.value)
      ) : (
        <UploadWrapper
          listType="text"
          {...otherProps}
          value={props.value}
          disabled={true}
        />
      )}
    </div>
  );
};

export const UploadWrapperFormItem = (props: EditableFormItemProps) => {
  const { formItemProps } = props.fieldConfig;
  return (
    <Form.Item
      {...formItemProps}
      name={props.name}
      className={classNames(
        'editable-upload-wrapper-form-item',
        formItemProps?.className
      )}
    >
      <UploadWrapperFormItemContent {...props} />
    </Form.Item>
  );
};
