import { useState } from 'react';
import { message, Switch, SwitchProps, Tooltip, TooltipProps } from 'antd';
import { isUndefinedOrNull, TAny } from '@hyperse/utils';
import { hooks } from '@wove/react';

export type SwitchWrapperValue = string | number | boolean;
export type SwitchWrapperProps = Omit<
  SwitchProps,
  'checked' | 'defaultChecked' | 'onChange' | 'value'
> & {
  value?: SwitchWrapperValue;
  checkedValue: SwitchWrapperValue;
  unCheckedValue: SwitchWrapperValue;
  onChange?: (value: SwitchWrapperValue) => void;
  tooltipProps?: Omit<TooltipProps, 'title'>;
  tooltipTitle?: string | ((value?: SwitchWrapperValue) => string | undefined);
  serviceConfig?: {
    onRequest: (value: SwitchWrapperValue) => TAny;
    message?: {
      success?: string;
      defaultError?: string;
    };
  };
};
/**
 * 解决Switch只能接收boolean的限制，与Form.Item结合使用最佳
 * ```
 * 1. value 为状态值，不局限于boolean，可以为 [string | number | boolean]
 * 2. checkedValue 选中值
 * 3. unCheckedValue 未选中值
 * 4. 与 Form.Item 结合使用，不再需要配置 valuePropName
 *     <Form.Item name="fieldName">
 *       <SwitchWrapper checkedValue={2} unCheckedValue={1} />
 *     </Form.Item>
 * 5. 可设置tooltip效果数据显示
 * 6. 可设置 serviceConfig 配置服务调用交互
 * ```
 */
export const SwitchWrapper = (props: SwitchWrapperProps) => {
  const {
    checkedValue,
    unCheckedValue,
    onChange,
    value,
    tooltipProps,
    tooltipTitle,
    serviceConfig,
    ...otherProps
  } = props;
  const [loading, setLoading] = useState<boolean>();
  const onChangeHandle = hooks.useCallbackRef(async (checked) => {
    const changeValue = checked ? checkedValue : unCheckedValue;
    if (serviceConfig?.onRequest) {
      try {
        setLoading(true);
        await serviceConfig.onRequest(changeValue);
        onChange?.(changeValue);
        void message.success(
          serviceConfig?.message?.success || '状态修改成功！'
        );
      } catch (error: any) {
        void message.error(
          error?.message ||
            serviceConfig?.message?.defaultError ||
            '状态修改失败！'
        );
      } finally {
        setLoading(false);
      }
    } else {
      onChange?.(changeValue);
    }
  });

  let tipTitle: string | undefined;

  if (typeof tooltipTitle === 'function') {
    tipTitle = tooltipTitle(value);
  } else {
    tipTitle = tooltipTitle;
  }

  if (tipTitle) {
    return (
      <Tooltip placement="top" {...tooltipProps} title={tipTitle}>
        <Switch
          {...otherProps}
          checked={!isUndefinedOrNull(value) && checkedValue === value}
          onChange={onChangeHandle}
        />
      </Tooltip>
    );
  }

  return (
    <Switch
      loading={loading}
      {...otherProps}
      checked={!isUndefinedOrNull(value) && checkedValue === value}
      onChange={onChangeHandle}
    />
  );
};
