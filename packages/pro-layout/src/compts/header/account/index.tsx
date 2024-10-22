import { Button, Dropdown, type MenuProps, Space } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { hooks } from '@wove/react';
import { useLayoutCtx } from '../../../context/layout-ctx.js';
import { type TAdminUser, type TGlobalData } from '../../../types/index.js';
import { clearStorage } from '../../../utils/index.js';
import './style.less';

export interface HeaderAccountProps {
  onSignOut?: (user: TAdminUser, hostUrl: string) => void;
}

export const HeaderAccount = () => {
  const global = hooks.useGlobal<TGlobalData>();
  const layoutCtx = useLayoutCtx();

  const onSignOutHandle = hooks.useCallbackRef(() => {
    // 清除缓存
    clearStorage();
    layoutCtx.onSignOut?.(global.user, global.hostUrl);
  });

  const defaultMenuItems: MenuProps['items'] = [
    {
      label: '退出登录',
      key: '0',
      onClick: onSignOutHandle,
      icon: <LogoutOutlined />,
    },
  ];

  const getUserAvatar = () => {
    const customUserAvatar = layoutCtx.onCustomUserAvatar?.(global);
    if (customUserAvatar) {
      return typeof customUserAvatar === 'string' ? (
        <img className="user-avatar" src={customUserAvatar} alt="" />
      ) : (
        customUserAvatar
      );
    }

    const avatar = global.user?.avatar;
    return avatar ? (
      <img className="user-avatar" src={avatar} alt="" />
    ) : (
      <Button key="user" size="small" shape="circle" icon={<UserOutlined />} />
    );
  };

  return (
    <div className="header-account">
      <Dropdown
        menu={{
          items: layoutCtx.accountOperateMenuItems
            ? layoutCtx.accountOperateMenuItems
            : defaultMenuItems,
        }}
        arrow={true}
        trigger={['hover']}
        overlayClassName="account-dropdown-overlay"
        getPopupContainer={() =>
          document.querySelector('.header-account') as HTMLElement
        }
      >
        <div className="header-account-wraper">
          <Space size={[8, 0]}>
            {getUserAvatar()}
            <div style={{ maxWidth: 68 }}>
              {layoutCtx.onCustomUserName?.(global) ||
                global.user?.userName ||
                '...'}
            </div>
          </Space>
        </div>
      </Dropdown>
    </div>
  );
};
