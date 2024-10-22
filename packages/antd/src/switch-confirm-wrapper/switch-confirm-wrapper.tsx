import { useMemo, useState } from 'react';
import {
  message,
  Popconfirm,
  type PopconfirmProps,
  Switch,
  type SwitchProps,
} from 'antd';
import { type TAny } from '@hyperse/utils';
import { hooks } from '@wove/react';
import { fbaHooks } from '../fba-hooks/index.js';

export type SwitchConfirmWrapperValue = string | number | boolean;
export type SwitchConfirmWrapperProps = Omit<
  SwitchProps,
  'defaultChecked' | 'onChange'
> & {
  value?: SwitchConfirmWrapperValue;
  checkedValue: SwitchConfirmWrapperValue;
  unCheckedValue: SwitchConfirmWrapperValue;
  needConfirm?: 'close' | 'open' | 'all' | 'none';
  noMessage?: boolean;
  onChange?: (value: SwitchConfirmWrapperValue) => void;
  popConfirmProps?:
    | Pick<PopconfirmProps, 'disabled' | 'title' | 'description'>
    | ((
        checked?: boolean
      ) => Pick<PopconfirmProps, 'disabled' | 'title' | 'description'>);
  serviceConfig?: {
    onRequest: (value: SwitchConfirmWrapperValue) => TAny;
    message?: {
      success?: string;
      defaultError?: string;
    };
  };
};

/**
 *
 * @description switch 切换时做二次pop提醒， 非可控组件【内部控制】
 * @param props
 * @param value
 * @param checkedValue：选中状态值
 * @param unCheckedValue：非选中状态值
 * @param needConfirm：二次pop拦截时机 可不传
 *        close：switch 由开启转换成关闭时pop弹出
 *        open：switch 由开启转换成开启时pop弹出
 *        all：switch 一直pop
 *        none：switch 不弹出
 * @param noMessage：不采用内置message提示
 * @param onChange：switch 有效切换回掉
 * @param popConfirmProps：popConfirm中参数 disabled title description
 * @param serviceConfig onRequest
 * @field onRequest 请求函数
 * @field message message配置 success defaultError
 * ```
 * 1. 单独使用
 *    <SwitchConfirmWrapper
 *        value={value}
 *        checkedValue={'1'}
 *        unCheckedValue={'2'}
 *        serviceConfig={{
 *          onRequest: async () => {
 *            await sleep(2000);
 *          },
 *        }}
 *        needConfirm={'all'}
 *        popConfirmProps={{
 *          title: '确定要开启吗？',
 *        }}
 *        onChange={(value) => {
 *          setValue(value as string);
 *        }}
 *      />
 *
 * 2. 与Form.Item结合使用
 *    <Form.Item name="open">
 *        <SwitchConfirmWrapper
 *          checkedValue={'1'}
 *          unCheckedValue={'2'}
 *          serviceConfig={{
 *            onRequest: async () => {
 *              await sleep(2000);
 *            },
 *          }}
 *          needConfirm={'all'}
 *          popConfirmProps={{
 *            title: '确定要开启吗？',
 *          }}
 *        />
 *      </Form.Item>
 * ```
 */
export const SwitchConfirmWrapper = (props: SwitchConfirmWrapperProps) => {
  const {
    popConfirmProps,
    needConfirm,
    checkedValue,
    unCheckedValue,
    onChange,
    value,
    serviceConfig,
    noMessage,
    ...otherProps
  } = props;
  const popConfirmPropsFt = useMemo(() => {
    if (typeof popConfirmProps === 'function') {
      return popConfirmProps(value === checkedValue);
    }
    return popConfirmProps;
  }, [checkedValue, popConfirmProps, value]);
  const [isCheked, setIsCheked] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  fbaHooks.useEffectCustom(() => {
    setIsCheked(value === checkedValue);
  }, [props.value]);

  const showConfirm = useMemo(() => {
    return (
      (needConfirm === 'close' && isCheked) ||
      (needConfirm === 'open' && !isCheked) ||
      !needConfirm ||
      needConfirm === 'all'
    );
  }, [isCheked, needConfirm]);

  const onHandleChange = hooks.useCallbackRef(async () => {
    const changeValue = !isCheked ? checkedValue : unCheckedValue;
    if (serviceConfig?.onRequest) {
      try {
        setLoading(true);
        await serviceConfig.onRequest(changeValue);
        setIsCheked(!isCheked);
        onChange?.(changeValue);
        if (!noMessage) {
          void message.success(
            serviceConfig?.message?.success || '状态修改成功！'
          );
        }
      } catch (error: any) {
        if (!noMessage) {
          void message.error(
            error?.message ||
              serviceConfig?.message?.defaultError ||
              '状态修改失败！'
          );
        }
      } finally {
        setLoading(false);
      }
    } else {
      setIsCheked(!isCheked);
      onChange?.(changeValue);
    }
  });
  if (showConfirm) {
    return (
      <Popconfirm
        disabled={popConfirmPropsFt?.disabled}
        okButtonProps={{ loading: loading }}
        title={popConfirmPropsFt?.title}
        description={popConfirmPropsFt?.description}
        onConfirm={onHandleChange}
      >
        <Switch checked={isCheked} {...otherProps} />
      </Popconfirm>
    );
  }
  return (
    <Switch
      checked={isCheked}
      loading={loading}
      {...otherProps}
      onChange={onHandleChange}
    />
  );
};
