import { useMemo } from 'react';
import { Form, Tag } from 'antd';
import { classNames } from '@dimjs/utils';
import { hooks } from '@wove/react';
import { SwitchWrapper } from '../../switch-wrapper';
import { EditableFormItemProps, EditableSwitchWrapperConfig } from '../type';

type FormItemContentProps = Omit<EditableFormItemProps, 'formItemProps'> & {
  value?: string | number | boolean;
  onChange?: (value?: string | number | boolean) => void;
};

const FormItemContent = (props: FormItemContentProps) => {
  const { editableConfig, editable, render } = props.fieldConfig;
  const editableComptProps = (editableConfig as EditableSwitchWrapperConfig)
    .editableComptProps;
  const onChange = hooks.useCallbackRef((data) => {
    props.onChange?.(data);
    editableComptProps?.onChange?.(data);
  });

  const viewData = useMemo(() => {
    const defaultCheckedText = editableComptProps.checkedChildren || '是';
    const defaultUnCheckedText = editableComptProps.unCheckedChildren || '否';

    return {
      checkedText: defaultCheckedText,
      unCheckedText: defaultUnCheckedText,
    };
  }, [
    editableComptProps.checkedChildren,
    editableComptProps.unCheckedChildren,
  ]);

  if (editable) {
    return (
      <SwitchWrapper
        {...editableComptProps}
        value={props.value}
        onChange={onChange}
      />
    );
  }
  if (render) {
    return (
      <span className="editable-switch-wrapper-view">
        {render(props.value)}
      </span>
    );
  }
  return (
    <span className="editable-switch-wrapper-view">
      {editableComptProps.checkedValue == props.value ? (
        <Tag color="geekblue" style={{ marginRight: 0 }}>
          {viewData.checkedText}
        </Tag>
      ) : (
        <Tag style={{ marginRight: 0 }}>{viewData.unCheckedText}</Tag>
      )}
    </span>
  );
};

export const SwitchWrapperFormItem = (props: EditableFormItemProps) => {
  const { formItemProps } = props.fieldConfig;
  return (
    <Form.Item
      {...formItemProps}
      name={props.name}
      className={classNames(
        'editable-switch-wrapper-form-item',
        formItemProps?.className
      )}
    >
      <FormItemContent {...props} />
    </Form.Item>
  );
};
