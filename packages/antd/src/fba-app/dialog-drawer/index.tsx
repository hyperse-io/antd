import { type ReactElement, type ReactNode, useMemo, useState } from 'react';
import { Drawer, type DrawerProps, Form, type FormInstance, Space } from 'antd';
import { isPromise } from '@dimjs/lang';
import { classNames } from '@dimjs/utils';
import { type TPlainObject } from '@hyperse/utils';
import { hooks } from '@wove/react';
import {
  ButtonWrapper,
  type ButtonWrapperProps,
} from '../../button-wrapper/index.js';
import { fbaHooks } from '../../fba-hooks/index.js';
import { CtxProvider } from './context.js';
import './style.less';

export type FbaAppDrawerProps = Omit<
  DrawerProps,
  'onOk' | 'onCancel' | 'getContainer' | 'footer' | 'extra'
> & {
  okText?: string | ReactElement;
  cancelText?: string | ReactElement;
  onOk?: (
    form: FormInstance,
    e: React.MouseEvent<HTMLElement>
  ) => void | Promise<void>;
  onCancel?: (
    form: FormInstance,
    e: React.MouseEvent<HTMLElement>
  ) => void | Promise<void>;
  content:
    | string
    | ReactElement
    | ((
        form: FormInstance,
        operate: { onClose: DrawerProps['onClose'] }
      ) => ReactElement);
  okButtonExtraProps?: Omit<
    ButtonWrapperProps,
    'onClick' | 'children' | 'loading'
  >;
  cancelButtonExtraProps?: Omit<ButtonWrapperProps, 'onClick' | 'children'>;
  okHidden?: boolean;
  cancelHidden?: boolean;

  /** 设置操作区域位置 */
  operatePosition?: 'header' | 'footer';
  /** 右上角自定义内容，如果operatePosition=header，此设置无效 */
  extra?: ReactNode | ((form: FormInstance) => ReactElement);
  /**
   * ```
   * 1. 自定义弹框操作区域，通过 operatePosition 配置可以自定义位置
   * 2. extraData 为外部通过 useDialogModal.rerenderFooter 重新渲染footer携带的数据
   * ```
   */
  operateRender?: (
    form: FormInstance,
    extraData?: TPlainObject
  ) => ReactElement;
};

export const FbaAppDrawer = (props: FbaAppDrawerProps) => {
  const {
    onOk,
    onCancel,
    content,
    okText,
    cancelText,
    okButtonExtraProps,
    cancelButtonExtraProps,
    operatePosition = 'footer',
    operateRender,
    width,
    okHidden,
    cancelHidden,
    extra,
    ...otherProps
  } = props;
  const [form] = Form.useForm();
  const screenType = fbaHooks.useResponsivePoint() || '';
  const [footerExtraData, setFooterExtraData] = useState<TPlainObject>({});

  const onClose = hooks.useCallbackRef((e) => {
    props.onClose?.(e);
  });

  const onCancelHandle = hooks.useCallbackRef((e) => {
    if (onCancel) {
      const response = onCancel(form, e);
      if (response && isPromise(response)) {
        return response.then(onClose);
      }
    }
    onClose(e);
    return Promise.resolve();
  });

  const onOkHandle = hooks.useCallbackRef((e) => {
    if (onOk) {
      const response = onOk(form, e);
      if (response && isPromise(response)) {
        return response.then(onClose);
      }
    }
    onClose(e);
    return Promise.resolve();
  });

  // const operateGroup = (
  //   <Space>
  //     {cancelHidden || cancelButtonExtraProps?.hidden ? null : (
  //       <ButtonWrapper {...cancelButtonExtraProps} onClick={onCancelHandle}>
  //         {cancelText || '取消'}
  //       </ButtonWrapper>
  //     )}
  //     {okHidden || okButtonExtraProps?.hidden ? null : (
  //       <ButtonWrapper type="primary" {...okButtonExtraProps} onClick={onOkHandle}>
  //         {okText || '提交'}
  //       </ButtonWrapper>
  //     )}
  //   </Space>
  // );

  // const operateRenderHandle = () => {
  //   if (operateRender) {
  //     return operateRender(form);
  //   }
  //   if (!okHidden || !cancelHidden) {
  //     return operateGroup;
  //   }
  //   return null;
  // };

  const newOperateRender = fbaHooks.useMemoCustom(() => {
    if (operateRender) {
      return operateRender(form, footerExtraData);
    }

    const okHiddenNew = okHidden || okButtonExtraProps?.hidden;
    const cancelHiddenNew = okHidden || okButtonExtraProps?.hidden;

    const operateGroup = (
      <Space>
        {cancelHiddenNew ? null : (
          <ButtonWrapper {...cancelButtonExtraProps} onClick={onCancelHandle}>
            {cancelText || '取消'}
          </ButtonWrapper>
        )}
        {okHiddenNew ? null : (
          <ButtonWrapper
            type="primary"
            {...okButtonExtraProps}
            onClick={onOkHandle}
          >
            {okText || '提交'}
          </ButtonWrapper>
        )}
      </Space>
    );
    if (!okHidden || !cancelHidden) {
      return operateGroup;
    }
    return null;
  }, [footerExtraData, props.open]);

  const customSize = useMemo(() => {
    if (!screenType) return undefined;
    if (['xs', 'sm'].includes(screenType)) {
      return {
        width: '90%',
        maxWidth: '90%',
      };
    }
    if (width) {
      return { width: width, maxWidth: 'calc(100% - 200px)' };
    }
    return { width: '40%', maxWidth: 'calc(100% - 200px)' };
  }, [screenType, width]);

  const extraRender = typeof extra === 'function' ? extra(form) : extra;

  const rerenderFooter = (data) => {
    setFooterExtraData(data);
  };

  return (
    <CtxProvider value={{ rerenderFooter }}>
      <Drawer
        maskClosable={true}
        destroyOnClose
        footer={operatePosition === 'footer' ? newOperateRender : null}
        {...otherProps}
        width={customSize?.width}
        styles={{
          ...otherProps.styles,
          wrapper: {
            maxWidth: customSize?.maxWidth,
            ...otherProps.styles?.wrapper,
          },
        }}
        className={classNames('app-dialog-drawer', otherProps.className)}
        extra={operatePosition === 'header' ? newOperateRender : extraRender}
        open={props.open}
        onClose={onClose}
      >
        {typeof content === 'function' ? content(form, { onClose }) : content}
      </Drawer>
    </CtxProvider>
  );
};
