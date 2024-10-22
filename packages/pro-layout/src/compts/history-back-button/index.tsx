import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { isPromise } from '@dimjs/lang';
import { ButtonWrapper, type ButtonWrapperProps } from '@hyperse/antd';
import { toLinkPath } from '@hyperse/utils';
import { hooks } from '@wove/react';
import { bootstrapCtx } from '../../context/layout-ctx.js';
import { useBread } from '../../hooks/use-bread.js';
import { getHostUrlAndRouteBaseName } from '../../utils/utils.js';

export type HistoryBackProps = ButtonWrapperProps & {
  level?: number;
};

/**
 * 通过面包屑路径返回
 * @param props
 * @returns
 * ```
 * 1. breads 模块面包屑配置
 * 2. level回退级别，如果传递数据未获取到路由配置，则取上一级
 *  例如：-1，-2，-3
 * 3. 为什么不能使用useNavigate(-1)
 *  因为内部iframe和外部浏览器共用history历史记录，导致里外浏览器栈混乱
 * 4. 什么场景使用
 *  使用iframe tab的项目，在执行路由回退时使用
 * 5. onClick返回 promise reject，则不会进行回退处理（V4.2.4）
 * ```
 */
export const HistoryBackButton = (props: HistoryBackProps) => {
  const ctx = bootstrapCtx();
  const { level, ...otherProps } = props;
  const { routeBaseName } = getHostUrlAndRouteBaseName(location.href);
  const routerList = useBread(ctx.breads, routeBaseName);
  const navigate = useNavigate();

  const path = useMemo(() => {
    const newLevel = level || -1;
    if (routerList.length >= 2) {
      const routerItem =
        routerList[routerList.length - 1 - Math.abs(newLevel)] ||
        routerList[routerList.length - 2];

      if (routerItem) {
        return toLinkPath(routerItem.path, routerItem.query);
      } else {
        console.warn(`未获取到【level：${newLevel}】面包屑数据`);
        return '';
      }
    }
    console.warn(`未获取到【level：${newLevel}】面包屑数据`);
    return '';
  }, []);

  const onBack = () => {
    if (path) {
      navigate(toLinkPath(path));
    } else {
      console.warn(`未获取到面包屑数据，无返回链接`);
    }
  };

  const onClick = hooks.useCallbackRef((event) => {
    const result = props?.onClick?.(event);
    if (result && isPromise(result)) {
      return result.then(() => {
        onBack();
      });
    }
    onBack();
    return;
  });

  return (
    <ButtonWrapper {...otherProps} onClick={onClick}>
      {props.children || '返回'}
    </ButtonWrapper>
  );
};

export const useHistoryBack = (props?: { level?: number }) => {
  const ctx = bootstrapCtx();
  const level = props?.level || -1;
  const { routeBaseName } = getHostUrlAndRouteBaseName(location.href);
  const routerList = useBread(ctx.breads, routeBaseName);

  const path = useMemo(() => {
    const newLevel = level || -1;
    if (routerList.length >= 2) {
      const routerItem =
        routerList[routerList.length - 1 - Math.abs(newLevel)] ||
        routerList[routerList.length - 2];

      if (routerItem) {
        return toLinkPath(routerItem.path, routerItem.query);
      } else {
        console.warn(`未获取到【level：${newLevel}】面包屑数据`);
        return '';
      }
    }
    console.warn(`未获取到【level：${newLevel}】面包屑数据`);
    return '';
  }, []);

  return { path };
};
