import {
  Children,
  cloneElement,
  CSSProperties,
  Fragment,
  ReactElement,
} from 'react';
import { FloatButton } from 'antd';
import { isUndefined } from '@dimjs/lang';
import { classNames } from '@dimjs/utils';
import { isWindowsEnv } from '@hyperse/utils';
import { hooks } from '@wove/react';
import { Loader } from '../loader/loader.js';
import './style.less';

export interface PageProps {
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
  fullIndex?: number;
  bread?: JSX.Element;
  children?: ReactElement | ReactElement[];
  elementId?: string;
}

/**
 *  页面包装组件
 * ```
 * 1. 如果初始化面包屑被隐藏，在特殊页面级可以独立设置显示面包屑
 *    <Page bread={<Bread />}/>
 * 2. 如果需要在 面包屑上添加按钮，初始化设置 bootstrap.hideDefaultBread = true，在需要按钮的页面上配置
 *    <Page bread={<Bread><Button>我是按钮</Button></Bread>}/>
 * ```
 * @param props
 * @returns
 */
export const Page = (props: PageProps) => {
  const loading = props.loading;
  const isWindows = isWindowsEnv();
  const className = classNames(
    'page',
    {
      'page-loading': loading,
      'page-flex': !isUndefined(props.fullIndex),
      'page-windows': isWindows,
    },
    props.className
  );
  const backTopTarget = hooks.useCallbackRef(() => {
    if (!isUndefined(props.fullIndex)) {
      return document.querySelector('.page-full') as HTMLElement;
    }
    return document.querySelector('.page') as HTMLElement;
  });

  return (
    <Fragment>
      {props.bread}
      <div style={props.style} className={className} id={props.elementId}>
        {Children.map(props.children, (item, index) => {
          if (index === props.fullIndex) {
            return (
              <Fragment key={index}>
                {cloneElement(item as JSX.Element, {
                  className: classNames(
                    'page-full',
                    item?.['props']?.className as string
                  ),
                })}
              </Fragment>
            );
          }
          return <Fragment key={index}>{item}</Fragment>;
        })}
        <FloatButton.BackTop target={backTopTarget} />
        {loading && <Loader spinning />}
      </div>
    </Fragment>
  );
};
