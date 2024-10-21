import { ReactElement, useMemo, useState } from 'react';
import { useSize } from 'ahooks';
import { Form, FormInstance, Modal, ModalProps } from 'antd';
import { isNull, isPromise } from '@dimjs/lang';
import { classNames } from '@dimjs/utils';
import { TNoopDefine, TPlainObject } from '@hyperse/utils';
import { hooks } from '@wove/react';
import { getFbaLocaleMessage } from '../../_utils/i18n/index.js';
import {
  ButtonWrapper,
  ButtonWrapperProps,
} from '../../button-wrapper/index.js';
import { fbaHooks } from '../../fba-hooks/index.js';
import { FlexLayout } from '../../flex-layout/index.js';
import { CtxProvider } from './context.js';
import './style.less';

export type FbaAppModalProps = Omit<
  ModalProps,
  | 'onOk'
  | 'onCancel'
  | 'getContainer'
  | 'okButtonProps'
  | 'cancelButtonProps'
  | 'footer'
> & {
  /**
   * 内置尺寸，根据比例固定高度、宽度
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
  onClose?: () => void;
  content:
    | string
    | ReactElement
    | ((form: FormInstance, operate: { onClose: TNoopDefine }) => ReactElement);
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

export const FbaAppModal = (props: FbaAppModalProps) => {
  const {
    titleExtra,
    title,
    onOk,
    onCancel,
    okButtonProps,
    cancelButtonProps,
    content,
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
  const [form] = Form.useForm();
  const htmlSize = useSize(document.querySelector('html'));
  const localMessage = getFbaLocaleMessage();
  const screenType = fbaHooks.useResponsivePoint() || '';

  const [footerExtraData, setFooterExtraData] = useState<TPlainObject>({});

  const onClose = hooks.useCallbackRef(() => {
    props.onClose?.();
  });

  const onCancelHandle = hooks.useCallbackRef((e) => {
    if (onCancel) {
      const response = onCancel(form, e);
      if (response && isPromise(response)) {
        return response.then(onClose);
      }
    }
    onClose();
    return Promise.resolve();
  });

  const onOkHandle = hooks.useCallbackRef((e) => {
    if (onOk) {
      const response = onOk(form, e);
      if (response && isPromise(response)) {
        return response.then(onClose);
      }
    }
    onClose();
    return Promise.resolve();
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
              {cancelText || localMessage.FbaDialogModal?.cancelText}
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
  }, [footerExtraData, props.open]);

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
    'fba-dialog-modal',
    { 'fba-dialog-modal-title-extra': !!titleExtra },
    { 'fba-dialog-modal-footer-empty': !footerNew },
    className
  );

  const rerenderFooter = (data) => {
    setFooterExtraData(data);
  };

  const bodyHeightNew = otherProps.styles?.body?.height || bodyHeight;

  return (
    <CtxProvider value={{ rerenderFooter }}>
      <Modal
        maskClosable={true}
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
        open={props.open}
      >
        {typeof content === 'function' ? content(form, { onClose }) : content}
      </Modal>
    </CtxProvider>
  );
};
