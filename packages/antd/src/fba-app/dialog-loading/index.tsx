import { CSSProperties } from 'react';
import { Modal, theme } from 'antd';
import { classNames } from '@dimjs/utils';
import { BlockLayout } from '../../block-layout/index.js';
import './style.less';

export type FbaAppLoadingProps = {
  className?: string;
  message?: string;
  mask?: boolean;
};

export const FbaAppLoading = (
  props: FbaAppLoadingProps & { open?: boolean }
) => {
  const { className, message, mask } = props;
  const { token } = theme.useToken();
  const colorPrimary = token.colorPrimary;

  return (
    <Modal
      maskClosable={false}
      centered={true}
      destroyOnClose
      className={classNames('fba-dialog-loading', className)}
      open={props.open}
      footer={null}
      closable={false}
      style={{ '--fba-loading-color': colorPrimary } as CSSProperties}
      mask={mask}
    >
      <BlockLayout className={classNames('fba-dialog-loading-content')}>
        <div className="loader-wrapper">
          <div className="loader-inner" />
          <div className="loader-text">{message || '处理中'}</div>
        </div>
      </BlockLayout>
    </Modal>
  );
};
