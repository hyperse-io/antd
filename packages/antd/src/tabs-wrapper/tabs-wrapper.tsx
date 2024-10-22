import { useMemo } from 'react';
import { Tabs, type TabsProps } from 'antd';
import { classNames } from '@dimjs/utils';
import { sessionStorageCache } from '@hyperse/utils';
import { hooks } from '@wove/react';
import './style.less';

export type TabsWrapperProps = TabsProps & {
  /**
   *  Tabs Header 提供 Fixed 效果，默认值：true
   */
  isFixed?: boolean;
  /** 是否取消 active 缓存 */
  cancelActiveCache?: boolean;
  activeCacheKey?: string;
  /** 隐藏头部 */
  hiddenTabHeader?: boolean;
};

/**
 * Tabs 包装组件
 * ```
 * 1. Tabs Header 提供 Sticky 效果，默认值：true
 * 2. 使用时，父级必须要有高度，可置于Flex布局中
 * 3. 默认缓存激活的tab item（activeKey受控操作下缓存无效）
 *    当未设置activeKey，非受控操作时，组件内部会会话缓存activeKey，在刷新时，会显示上次的激活的tab item
 *    缓存Key：如果未设置 activeCacheKey，则使用默认的 cache key（tabs-wrapper-activeKey）
 *    缓存模式：会话缓存，在浏览器关闭后，会清除
 * ```
 */
export const TabsWrapper = (props: TabsWrapperProps) => {
  const {
    isFixed = true,
    activeCacheKey,
    cancelActiveCache,
    hiddenTabHeader,
    ...otherProps
  } = props;
  // 是否受控操作
  const isControl = Object.prototype.hasOwnProperty.call(props, 'activeKey');
  const cacheKey = activeCacheKey || 'tabs-wrapper-activeKey';
  const isFixedNew = isFixed;

  const onChange = hooks.useCallbackRef((activeKey: string) => {
    if (cancelActiveCache !== true && !isControl) {
      sessionStorageCache.set(cacheKey, { activeKey });
    }
    otherProps.onChange?.(activeKey);
  });

  const defaultActiveKey = useMemo(() => {
    if (cancelActiveCache === true || isControl) {
      return props.defaultActiveKey;
    }
    const chcheActiveKey = sessionStorageCache.get(cacheKey)?.activeKey as
      | string
      | undefined;
    return chcheActiveKey || otherProps.defaultActiveKey;
  }, [
    cacheKey,
    cancelActiveCache,
    isControl,
    otherProps.defaultActiveKey,
    props.defaultActiveKey,
  ]);

  const className = classNames(
    'fba-tabs-wrapper',
    {
      'fba-tabs-wrapper-fixed': isFixedNew,
      'fba-tabs-wrapper-hidden-header': hiddenTabHeader,
    },
    otherProps.className
  );

  return (
    <Tabs
      {...otherProps}
      className={className}
      defaultActiveKey={defaultActiveKey}
      onChange={onChange}
    />
  );
};
