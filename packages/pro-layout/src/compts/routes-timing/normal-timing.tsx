import { Fragment } from 'react';
import { useLocation } from 'react-router-dom';
import { hooks } from '@wove/react';
import { useLayoutCtx } from '../../context/layout-ctx.js';

/**
 * 普通路由变化逻辑
 * @returns
 */
export const NormalRoutesTiming = () => {
  const layoutCtx = useLayoutCtx();

  const { pathname, search } = useLocation();

  hooks.useUpdateEffect(() => {
    if (!window['__sider_bar_menu_click']) {
      layoutCtx.normalModePositionMenu(location.href);
    }
    window['__sider_bar_menu_click'] = false;
  }, [pathname, search]);

  return <Fragment />;
};
