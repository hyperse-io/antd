import { classNames } from '@dimjs/utils';
import { FbaAppModal, type FbaAppModalProps } from '../dialog-modal/index.jsx';
import './style.less';

export type FbaAppConfirmProps = FbaAppModalProps;

export const FbaAppConfirm = (props: FbaAppConfirmProps) => {
  const className = classNames('fba-dialog-confirm', props.className);
  return (
    <FbaAppModal
      okText="确定"
      size={null}
      width={350}
      cancelText="取消"
      maskClosable={true}
      {...props}
      className={className}
    />
  );
};
