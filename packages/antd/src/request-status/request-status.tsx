import { ReactElement, useMemo } from 'react';
import { Empty, Spin } from 'antd';
import { extend } from '@dimjs/utils';
import { valueIsEqual } from '@hyperse/utils';
import './style.less';

export type TRequestStatus =
  | 'request-init'
  | 'request-progress'
  | 'request-success'
  | 'request-error'
  | 'no-dependencies-params';
export type TRequestStatusProps = {
  status?: TRequestStatus;
  errorButton?: ReactElement;
  messageConfig?: Partial<Record<TRequestStatus, string>>;
  loading?: boolean;
};
export const RequestStatus = (props: TRequestStatusProps) => {
  const messageConfig = extend(
    {
      'request-success': '暂无数据',
      'request-progress': '数据查询中',
      'request-error': '数据查询异常',
      'request-init': '暂无数据',
      'no-dependencies-params': '未获取到依赖查询条件',
    },
    props.messageConfig
  );
  const description = useMemo(() => {
    if (
      props.status &&
      valueIsEqual(props.status, [
        'request-success',
        'request-progress',
        'request-error',
        'no-dependencies-params',
      ])
    ) {
      return messageConfig[props.status];
    }
    return messageConfig['request-init'];
  }, [messageConfig, props.status]);
  return (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={description}
      className={'v-request-status'}
    >
      <Spin spinning={props.loading || false}></Spin>
      {props.status === 'request-error' && props.errorButton}
    </Empty>
  );
};
