import { useMemo } from 'react';
import { Form } from 'antd';
import { isBoolean, isNumber, isString } from '@dimjs/lang';
import { type EditableFormItemProps, type FieldSingleConfig } from '../type.js';

const FormItemTextContent = (props: {
  value?: string | number;
  name: EditableFormItemProps['name'];
  fieldConfig?: FieldSingleConfig;
}) => {
  const value = useMemo(() => {
    if (props.fieldConfig?.render) return undefined;
    const isBaseData =
      isString(props.value) ||
      isNumber(props.value) ||
      isBoolean(props.value) ||
      !props.value;
    if (!isBaseData) {
      console.warn(
        `Form.List name:【${props.name}】数据【${JSON.stringify(props.value)}】不能渲染在页面中`
      );
    }
    return isBaseData ? props.value : undefined;
  }, [props.fieldConfig?.render, props.name, props.value]);
  const viewText = props.fieldConfig?.render?.(props.value) || value;
  return <span>{viewText}</span>;
};

export const TextFormItem = (props: {
  name: Array<number | string>;
  fieldConfig?: FieldSingleConfig;
}) => {
  return (
    <Form.Item noStyle name={props.name}>
      <FormItemTextContent name={props.name} fieldConfig={props.fieldConfig} />
    </Form.Item>
  );
};
