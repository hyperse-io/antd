import { Checkbox, CheckboxProps } from 'antd';
import { isUndefinedOrNull } from '@hyperse/utils';
import { hooks } from '@wove/react';

export type CheckboxWrapperProps = Omit<
  CheckboxProps,
  'checked' | 'defaultChecked' | 'onChange'
> & {
  value?: string | number | boolean;
  checkedValue: string | number | boolean;
  unCheckedValue: string | number | boolean;
  onChange?: (value: string | number | boolean) => void;
};
/**
 * 解决 Checkbox 只能接收boolean的限制，与Form.Item结合使用最佳
 * ```
 * 1. value 为状态值，不局限于boolean，可以为 [string | number | boolean]
 * 2. checkedValue 选中值
 * 3. unCheckedValue 未选中值
 * 4. 与 Form.Item 结合使用，不再需要配置 valuePropName
 *     <Form.Item name="fieldName">
 *       <CheckboxWrapper checkedValue={2} unCheckedValue={1} />
 *     </Form.Item>
 * ```
 */
export const CheckboxWrapper = (props: CheckboxWrapperProps) => {
  const { checkedValue, unCheckedValue, onChange, value, ...otherProps } =
    props;
  const onChangeHandle = hooks.useCallbackRef((event) => {
    const checked = event.target.checked;
    onChange?.(checked ? checkedValue : unCheckedValue);
  });

  return (
    <Checkbox
      {...otherProps}
      checked={!isUndefinedOrNull(value) && checkedValue === value}
      onChange={onChangeHandle}
    />
  );
};
