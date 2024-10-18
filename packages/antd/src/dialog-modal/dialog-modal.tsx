import { ReactElement, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useSize } from 'ahooks';
import { Form, FormInstance, Modal, ModalProps } from 'antd';
import { isNull, isPromise, isString } from '@dimjs/lang';
import { classNames } from '@dimjs/utils';
import {
  BodyAppendDivElementProps,
  dom,
  TNoopDefine,
  TPlainObject,
} from '@hyperse/utils';
import { hooks } from '@wove/react';
import {
  ButtonWrapper,
  ButtonWrapperProps,
} from '../button-wrapper/button-wrapper.js';
import {
  ConfigProviderWrapper,
  ConfigProviderWrapperProps,
} from '../config-provider-wrapper/config-provider-wrapper.js';
import { fbaHooks } from '../fba-hooks/index.js';
import { FlexLayout } from '../flex-layout/flex-layout.js';
import { DialogModalCtxProvider, useDialogModalCtx } from './context.js';
import './style.less';

export type DialogModalProps = Omit<
  ModalProps,
  | 'onOk'
  | 'onCancel'
  | 'getContainer'
  | 'open'
  | 'open'
  | 'okButtonProps'
  | 'cancelButtonProps'
  | 'footer'
> & {
  /**
   * 内置尺寸，根据比例固定高度、宽度，默认：无
   * ```
   * 1. 如果自定义了width、bodyHeight属性，size中的height、width将对应失效
   * 2. 不传、传null值可取消内置尺寸
   * ```
   */
  size?: 'small' | 'middle' | 'large' | null;
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
  okHidden?: boolean;
  cancelHidden?: boolean;
  okButtonProps?: Omit<ButtonWrapperProps, 'hidden' | 'children' | 'onClick'>;
  cancelButtonProps?: Omit<
    ButtonWrapperProps,
    'hidden' | 'children' | 'onClick'
  >;
  titleExtra?: ReactElement;
  /**
   * null则隐藏footer
   * ```
   * extraData 为外部通过 useDialogModal.rerenderFooter 重新渲染footer携带的数据
   * ```
   */
  footer?:
    | null
    | ReactElement
    | ReactElement[]
    | ((form: FormInstance, extraData?: TPlainObject) => ReactElement);
  /** 内容高度，为styles.body.height快捷配置，优先级低于styles.body.height */
  bodyHeight?: number;
};

const ModalRender = (props: BodyAppendDivElementProps & DialogModalProps) => {
  const {
    title,
    titleExtra,
    divElement,
    elementId,
    onOk,
    onCancel,
    okButtonProps,
    cancelButtonProps,
    content,
    configProviderProps,
    className,
    okHidden,
    cancelHidden,
    footer,
    cancelText,
    okText,
    size,
    bodyHeight,
    ...otherProps
  } = props;

  const [open, setOpen] = useState(true);
  const [form] = Form.useForm();
  const htmlSize = useSize(document.querySelector('html'));
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

  const onAfterClose = hooks.useCallbackRef(() => {
    dom.removeBodyChild(`#${elementId}`);
    props.afterClose?.();
  });

  const footerNew = fbaHooks.useMemoCustom(() => {
    const operateGroup =
      !cancelHidden || !okHidden
        ? [
            <ButtonWrapper
              key="0"
              {...cancelButtonProps}
              onClick={onCancelHandle}
              hidden={cancelHidden}
            >
              {cancelText || '取消'}
            </ButtonWrapper>,
            <ButtonWrapper
              key="1"
              type="primary"
              {...okButtonProps}
              onClick={onOkHandle}
              hidden={okHidden}
            >
              {okText || '提交'}
            </ButtonWrapper>,
          ]
        : undefined;
    const footerNew = isNull(footer)
      ? null
      : (typeof footer === 'function'
          ? footer(form, footerExtraData)
          : footer) ||
        operateGroup ||
        [];
    return footerNew;
  }, [footerExtraData]);

  const customSize = useMemo(() => {
    if (!htmlSize?.height || !screenType) return undefined;
    const isXsSm = ['xs', 'sm'].includes(screenType);
    if (size == 'large') {
      return {
        height: htmlSize?.height * 0.7,
        width: isXsSm ? '90%' : htmlSize.width * 0.6,
      };
    }
    if (size == 'small') {
      const width = htmlSize.width * 0.3;
      return {
        height: htmlSize?.height * 0.4,
        width: isXsSm ? '90%' : width < 470 ? 470 : width,
      };
    }

    if (size == 'middle') {
      return {
        height: htmlSize?.height * 0.4,
        width: isXsSm ? '90%' : htmlSize.width * 0.5,
      };
    }

    return undefined;
  }, [htmlSize?.height, htmlSize?.width, screenType, size]);

  const classNameNew = classNames(
    'v-dialog-modal',
    { 'v-dialog-modal-title-extra': !!titleExtra },
    { 'v-dialog-modal-footer-empty': !footerNew },
    className
  );

  const rerenderFooter = (data) => {
    setFooterExtraData(data);
  };

  const bodyHeightNew = otherProps.styles?.body?.height || bodyHeight;

  return (
    <DialogModalCtxProvider value={{ rerenderFooter }}>
      <ConfigProviderWrapper {...configProviderProps}>
        <Modal
          title={
            titleExtra ? (
              <FlexLayout direction="horizontal" fullIndex={0}>
                <span>{title}</span>
                {titleExtra}
              </FlexLayout>
            ) : (
              title
            )
          }
          maskClosable={true}
          centered={true}
          onCancel={onClose}
          destroyOnClose
          width={customSize?.width}
          {...otherProps}
          footer={footerNew}
          styles={{
            ...otherProps.styles,
            body: {
              height: bodyHeightNew || customSize?.height,
              maxHeight: 'calc(100vh - 200px)',
              ...otherProps.styles?.body,
            },
          }}
          className={classNameNew}
          open={open}
          afterClose={onAfterClose}
          getContainer={divElement}
        >
          {typeof content === 'function' ? content(form, { onClose }) : content}
        </Modal>
      </ConfigProviderWrapper>
    </DialogModalCtxProvider>
  );
};

/**
 * 居中弹框
 * ```
 * 1. 可嵌套使用
 * 2. 为什么不推荐使用
 *    dialogModal.open 打开的内容无法适配兼容自定义主题、无法适配兼容旧版浏览器、无法兼容国际化
 *    适配兼容旧版浏览器（https://ant-design.antgroup.com/docs/react/compatible-style-cn）
 * 3. 需要修改默认主题风格的场景，请使用
 *    const { appDialogModal } = FbaApp.useDialogModal();
 *    appDialogModal.open({})
 * 4. size属性可使用预设的弹窗尺寸（默认值middle），如果不使用内置尺寸可设置 size = null
 * ```
 */
export const dialogModal = {
  open: (props: DialogModalProps) => {
    const { divElement, elementId } = dom.bodyAppendDivElement();
    window['__dialog_modal_elementId'] = elementId;
    const root = createRoot(divElement);
    root.render(
      <ModalRender {...props} divElement={divElement} elementId={elementId} />
    );
    return {
      close: () => {
        window[elementId]?.();
      },
    };
  },
  /**
   * ```
   * 1. 关闭最新弹框，如果有多个弹框只能关闭最后一个
   * 2. 多个弹框主动关闭，只能使用 dialogModal.open()返回值中的close
   * ```
   */
  close: () => {
    try {
      const elementId = window['__dialog_modal_elementId'] as string;
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
  useDialogModal: () => {
    const ctx = useDialogModalCtx();
    return {
      /** 重新渲染 footer， data为携带的数据，是footer的第二个参数  */
      rerenderFooter: (data?: TPlainObject) => {
        ctx.rerenderFooter(data);
      },
    };
  },
};
