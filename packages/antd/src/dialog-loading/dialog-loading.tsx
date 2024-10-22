import { type CSSProperties, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Modal, theme } from 'antd';
import { isString } from '@dimjs/lang';
import { classNames } from '@dimjs/utils';
import { hooks } from '@wove/react';
import {
  bodyAppendDivElement,
  type BodyAppendDivElementProps,
  removeBodyChild,
} from '../_utils/dom.js';
import { fbaHooks } from '../fba-hooks/index.js';
import './style.less';

export type DialogLoadingProps = {
  className?: string;
  message?: string;
  mask?: boolean;
};

const ModalRender = (props: BodyAppendDivElementProps & DialogLoadingProps) => {
  const { elementId, className, divElement, message, mask } = props;
  const { token } = theme.useToken();
  const colorPrimary = token.colorPrimary;

  const [open, setOpen] = useState(true);

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

  const onAfterClose = hooks.useCallbackRef(() => {
    removeBodyChild(`#${elementId}`);
  });

  return (
    <Modal
      maskClosable={false}
      centered={true}
      destroyOnClose
      className={classNames('v-dialog-loading', className)}
      open={open}
      afterClose={onAfterClose}
      getContainer={divElement}
      footer={null}
      closable={false}
      style={{ '--v-loading-color': colorPrimary } as CSSProperties}
      mask={mask}
    >
      <div className={classNames('v-dialog-loading-content')}>
        <div className="loader-wrapper">
          <div className="loader-inner" />
          <div className="loader-text">{message || '处理中'}</div>
        </div>
      </div>
    </Modal>
  );
};

/**
 * Loading弹框
 * ```
 * 1. 可嵌套使用
 * 2. 为什么不推荐使用
 *    dialogLoading.open 打开的内容无法适配兼容自定义主题、无法适配兼容旧版浏览器、无法兼容国际化
 *    适配兼容旧版浏览器（https://ant-design.antgroup.com/docs/react/compatible-style-cn）
 * 3. 需要修改默认主题风格的场景，请使用
 *    const { appDialogLoading } = FbaApp.useDialogLoading();
 *    appDialogLoading.open({})
 * ```
 */
export const dialogLoading = {
  open: (props?: DialogLoadingProps) => {
    const { divElement, elementId } = bodyAppendDivElement();
    window['__dialog_loading_elementId'] = elementId;
    const root = createRoot(divElement);
    root.render(
      <ModalRender
        {...props}
        divElement={divElement}
        elementId={elementId}
        mask={props?.mask}
      />
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
      const elementId = window['__dialog_loading_elementId'] as string;
      if (isString(elementId)) window[elementId]?.();
    } catch (_error) {
      //
    }
  },
};
