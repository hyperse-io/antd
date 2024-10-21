import { classNames } from '@dimjs/utils';
import {
  dialogModal,
  DialogModalProps,
} from '../dialog-modal/dialog-modal.jsx';
import './style.less';

/**
 * 确认弹框
 * ```
 * 1. 可嵌套使用
 * 2. 为什么不推荐使用
 *    dialogConfirm.open 打开的内容无法适配兼容自定义主题、无法适配兼容旧版浏览器、无法兼容国际化
 *    适配兼容旧版浏览器（https://ant-design.antgroup.com/docs/react/compatible-style-cn）
 * 3. 需要修改默认主题风格的场景，请使用
 *    const { appDialogConfirm } = FbaApp.useDialogConfirm();
 *    appDialogConfirm.open({})
 * ```
 */
export const dialogConfirm = {
  open: (props: DialogModalProps) => {
    const className = classNames('v-dialog-confirm', props.className);
    return dialogModal.open({
      width: 350,
      okText: '确定',
      cancelText: '取消',
      maskClosable: true,
      size: null,
      ...props,
      className,
    });
  },
};
