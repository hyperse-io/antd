import { CSSProperties, ReactElement, ReactNode } from 'react';
import { Space } from 'antd';
import { isPromise } from '@dimjs/lang';
import { hooks } from '@wove/react';
import {
  ButtonWrapper,
  ButtonWrapperProps,
} from '../button-wrapper/button-wrapper.js';
import { useDialogDrawerCtx } from '../dialog-drawer/context.js';
import { fbaHooks } from '../fba-hooks/index.js';
import './style.less';

export type DialogDrawerContentProps = {
  footer?: (data: { onClose: () => void }) => ReactElement;
  footerStyle?: CSSProperties;
  children?: ReactNode;
  okHidden?: boolean;
  cancelHidden?: boolean;
  okButtonExtraProps?: Omit<
    ButtonWrapperProps,
    'onClick' | 'children' | 'loading'
  >;
  cancelButtonExtraProps?: Omit<
    ButtonWrapperProps,
    'onClick' | 'children' | 'loading'
  >;
  okText?: string | ReactElement;
  cancelText?: string | ReactElement;
  onOk?: (e: React.MouseEvent<HTMLElement>) => void | Promise<void>;
  onCancel?: (e: React.MouseEvent<HTMLElement>) => void | Promise<void>;
};
/**
 * 当dialogDrawer底部操作按钮在业务content内部时，使用
 * ```
 * 1. 只能与 dialogDrawer 配合使用；与 FbaApp.useDialogDrawer 配合使用无效
 * 2. 设置 footer 后，okHidden、cancelHidden、okButtonExtraProps、cancelButtonExtraProps、okText、cancelText、onOk、onCancel全部失效
 * ```
 */
export const DialogDrawerContent = (props: DialogDrawerContentProps) => {
  const ctx = useDialogDrawerCtx();
  const onClose = ctx.onClose;

  fbaHooks.useEffectCustom(() => {
    ctx.updateBodyStyle({ padding: 0 });
  }, []);

  const {
    okHidden,
    onCancel,
    onOk,
    cancelHidden,
    cancelText,
    okText,
    okButtonExtraProps,
    cancelButtonExtraProps,
    footer,
  } = props;
  const onCancelHandle = hooks.useCallbackRef((e) => {
    if (onCancel) {
      const response = onCancel(e);
      if (response && isPromise(response)) {
        return response.then(onClose);
      }
    }
    return onClose();
  });

  const onOkHandle = hooks.useCallbackRef((e) => {
    if (onOk) {
      const response = onOk(e);
      if (response && isPromise(response)) {
        return response.then(onClose);
      }
    }
    return onClose();
  });
  const operateGroup = (
    <Space>
      {cancelHidden || cancelButtonExtraProps?.hidden ? null : (
        <ButtonWrapper {...cancelButtonExtraProps} onClick={onCancelHandle}>
          {cancelText || '取消'}
        </ButtonWrapper>
      )}
      {okHidden || okButtonExtraProps?.hidden ? null : (
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
  return (
    <div className="dialog-drawer-content-wrapper">
      <div className="dialog-drawer-content">{props.children}</div>
      <div className="dialog-drawer-footer" style={props.footerStyle}>
        {footer?.({ onClose }) || operateGroup}
      </div>
    </div>
  );
};
