import { dialogConfirm } from '../dialog-confirm/dialog-confirm.jsx';
import { type DialogModalProps } from '../dialog-modal/dialog-modal.jsx';

export type DialogAlertProps = Omit<
  DialogModalProps,
  'onOk' | 'cancelHidden' | 'cancelButtonProps' | 'onCancel' | 'onClick'
> & {
  onClick?: (e: React.MouseEvent<HTMLElement>) => void | Promise<void>;
};

/**
 * 确认弹框
 * ```
 * 1. 可嵌套使用
 * 2. 为什么不推荐使用
 *    dialogAlert.open 打开的内容无法适配兼容自定义主题、无法适配兼容旧版浏览器、无法兼容国际化
 *    适配兼容旧版浏览器（https://ant-design.antgroup.com/docs/react/compatible-style-cn）
 * 3. 需要修改默认主题风格的场景，请使用
 *    const { appDialogAlert } = FbaApp.useDialogAlert();
 *    appDialogAlert.open({})
 * ```
 */
export const dialogAlert = {
  open: (props: DialogAlertProps) => {
    return dialogConfirm.open({
      okText: '确定',
      cancelHidden: true,
      maskClosable: false,
      ...props,
      onOk: props.onClick,
    } as DialogModalProps);
  },
};
