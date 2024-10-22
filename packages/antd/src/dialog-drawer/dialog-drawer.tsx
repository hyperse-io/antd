import {
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  useMemo,
  useState,
} from 'react';
import { createRoot } from 'react-dom/client';
import { Drawer, type DrawerProps, Form, type FormInstance, Space } from 'antd';
import { isPromise, isString } from '@dimjs/lang';
import { dom, type TNoopDefine, type TPlainObject } from '@hyperse/utils';
import { hooks } from '@wove/react';
import { type BodyAppendDivElementProps } from '../_utils/dom.js';
import {
  ButtonWrapper,
  type ButtonWrapperProps,
} from '../button-wrapper/index.js';
import {
  ConfigProviderWrapper,
  type ConfigProviderWrapperProps,
} from '../config-provider-wrapper/config-provider-wrapper.jsx';
import { fbaHooks } from '../fba-hooks/index.js';
import { CtxProvider, useDialogDrawerCtx } from './context.js';

export type DialogDrawerProps = Omit<
  DrawerProps,
  'onOk' | 'onCancel' | 'getContainer' | 'open' | 'open' | 'footer' | 'extra'
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
    | ((form: FormInstance, operate: { onClose: TNoopDefine }) => ReactElement);
  configProviderProps?: ConfigProviderWrapperProps;

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

const ModalRender = (props: BodyAppendDivElementProps & DialogDrawerProps) => {
  const {
    divElement,
    elementId,
    onOk,
    onCancel,
    content,
    configProviderProps,
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
  const [open, setOpen] = useState(true);
  const [innerBodyStyle, setInnerBodyStyle] = useState<CSSProperties>();
  const [form] = Form.useForm();
  const screenType = fbaHooks.useResponsivePoint() || '';
  const [footerExtraData, setFooterExtraData] = useState<TPlainObject>({});

  const onClose = hooks.useCallbackRef(() => {
    try {
      delete window[elementId];
    } catch (_error) {
      //
    }
    setOpen(false);
  });

  fbaHooks.useEffectCustom(() => {
    window[elementId] = onClose;
  }, [onClose]);

  const onCancelHandle = hooks.useCallbackRef((e) => {
    if (onCancel) {
      const response = onCancel(form, e);
      if (response && isPromise(response)) {
        return response.then(onClose);
      }
    }
    return onClose();
  });

  const onOkHandle = hooks.useCallbackRef((e) => {
    if (onOk) {
      const response = onOk(form, e);
      if (response && isPromise(response)) {
        return response.then(onClose);
      }
    }
    return onClose();
  });

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
  }, [footerExtraData]);

  const extraRender = typeof extra === 'function' ? extra(form) : extra;

  const updateBodyStyle = (bodyStyle?: CSSProperties) => {
    setInnerBodyStyle(bodyStyle);
  };

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

  const rerenderFooter = (data) => {
    setFooterExtraData(data);
  };

  return (
    <CtxProvider value={{ onClose, updateBodyStyle, rerenderFooter }}>
      <ConfigProviderWrapper {...configProviderProps}>
        <Drawer
          maskClosable={true}
          destroyOnClose
          onClose={onClose}
          footer={operatePosition === 'footer' ? newOperateRender : null}
          {...otherProps}
          width={customSize?.width}
          styles={{
            ...otherProps.styles,
            body: { ...innerBodyStyle, ...otherProps.styles?.body },
            wrapper: {
              maxWidth: customSize?.maxWidth,
              ...otherProps.styles?.wrapper,
            },
          }}
          extra={operatePosition === 'header' ? newOperateRender : extraRender}
          open={open}
          getContainer={divElement}
        >
          {typeof content === 'function' ? content(form, { onClose }) : content}
        </Drawer>
      </ConfigProviderWrapper>
    </CtxProvider>
  );
};

/**
 * 抽屉弹框
 * ```
 * 1. 可嵌套使用
 * 2. 为什么不推荐使用
 *    dialogDrawer.open 打开的内容无法适配兼容自定义主题、无法适配兼容旧版浏览器、无法兼容国际化
 *    适配兼容旧版浏览器（https://ant-design.antgroup.com/docs/react/compatible-style-cn）
 * 3. 需要修改默认主题风格的场景，请使用
 *    const { appDialogDrawer } = FbaApp.useDialogDrawer();
 *    appDialogDrawer.open({})
 * ```
 */
export const dialogDrawer = {
  open: (props: DialogDrawerProps) => {
    const { divElement, elementId } = dom.bodyAppendDivElement();
    window['__dialog_drawer_elementId'] = elementId;
    const root = createRoot(divElement);
    root.render(
      <ModalRender {...props} divElement={divElement} elementId={elementId} />
    );
    return {
      close: () => {
        (window as any)[elementId]?.();
      },
    };
  },
  /**
   * ```
   * 1. 关闭最新弹框，如果有多个弹框只能关闭最后一个
   * 2. 多个弹框主动关闭，只能使用 dialogDrawer.open()返回值中的close
   * ```
   */
  close: () => {
    try {
      const elementId = window['__dialog_drawer_elementId'] as string;
      if (isString(elementId)) window[elementId]?.();
    } catch (_error) {
      //
    }
  },
  /**
   * ```
   * 1. rerenderFooter 携带指定数据重新渲染 footer，可用于切换footer中的按钮状态
   * ```
   */
  useDialogDrawer: () => {
    const ctx = useDialogDrawerCtx();
    return {
      /** 重新渲染 footer， data为携带的数据，是footer的第二个参数  */
      rerenderFooter: (data?: TPlainObject) => {
        ctx.rerenderFooter(data);
      },
    };
  },
};
