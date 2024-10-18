import { CSSProperties, Fragment, ReactElement, ReactNode } from 'react';
import { Empty } from 'antd';
import { classNames } from '@dimjs/utils';
import './style.less';

export type DataRenderProps = {
  isEmpty: boolean | (() => boolean);
  empty?: ReactElement;
  emptyText?: string | ReactElement;
  emptyStyle?: CSSProperties;
  emptyClassName?: string;
  children: ReactNode;
};

/**
 * 数据渲染，内置处理数据为空渲染
 * ```
 * 1. 配置 empty 后，emptyText、emptyStyle、emptyClassName将失效
 * 2. 使用方式，例如
 *    <DataRender isEmpty={list.length === 0}>
 *      <Fragment>
 *        {list.map((item) => {
 *          return (
 *            <div key={item}>....</div>
 *          );
 *        })}
 *      </Fragment>
 *    </DataRender>
 * ```
 */
export const DataRender = (props: DataRenderProps) => {
  const isEmpty =
    typeof props.isEmpty === 'function' ? props.isEmpty() : props.isEmpty;
  if (isEmpty) {
    return props.empty ? (
      props.empty
    ) : (
      <div
        className={classNames('v-data-render-empty', props.emptyClassName)}
        style={props.emptyStyle}
      >
        <Empty description={props.emptyText} />
      </div>
    );
  }
  return <Fragment>{props.children}</Fragment>;
};
