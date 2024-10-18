import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { classNames } from '@dimjs/utils';
import { hooks } from '@wove/react';
import { useLayoutCtx } from '../../context/layout-ctx';
import './style.less';

export const Shrink = (props: { className?: string }) => {
  const layoutCtx = useLayoutCtx();

  const onCollapseClick = hooks.useCallbackRef(() => {
    // 设置手动控制侧边栏菜单收缩
    if (layoutCtx.collapsed) {
      window['__manual_control_shrink'] = true;
      layoutCtx.onChangeCollapsed(false);
      layoutCtx.onShrinkChange?.('open');
    } else {
      window['__manual_control_shrink'] = false;
      setTimeout(() => {
        layoutCtx.onChangeCollapsed(true);
        layoutCtx.onShrinkChange?.('close');
      }, 100);
    }
  });

  if (layoutCtx.siderBarMenus.length > 0 && !layoutCtx.hideSidebarMenu) {
    return (
      <div
        className={classNames('layout-shrink', props.className)}
        onClick={onCollapseClick}
      >
        {layoutCtx.collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </div>
    );
  }
  return <div className={classNames('layout-shrink', props.className)} />;
};
