import { Fragment, ReactElement, useMemo } from 'react';
import { ButtonProps, Dropdown, DropdownProps } from 'antd';
import { ItemType } from 'antd/es/menu/interface.js';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { classNames } from '@dimjs/utils';
import { hooks } from '@wove/react';
import { ButtonWrapper } from '../button-wrapper/button-wrapper.js';
import { dialogConfirm } from '../dialog-confirm/dialog-confirm.js';
import { DialogModalProps } from '../dialog-modal/dialog-modal.js';
import { fbaUtils } from '../fba-utils/fba-utils.js';
import { FlexLayout } from '../flex-layout/flex-layout.js';
import { parentsHasSticky } from './utils.js';
import './style.less';

export interface DropdownMenuItem extends Omit<ButtonProps, 'color'> {
  text?: string | ReactElement;
  color?: string;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void | Promise<void>;
  permission?: string;
  needConfirm?: boolean;
  confirmMessage?: string;
  hidden?: boolean;
  confirmModalProps?: DialogModalProps;
  stopPropagation?: boolean;
}

export interface DropdownMenuWrapperProps extends Omit<DropdownProps, 'menu'> {
  menuList: Array<DropdownMenuItem | null>;
  /** dropdown 设置弹框根节点在body下 */
  isFixed?: boolean;
}

/**
 * DropdownMenuWrapper
 * 升级 antd 5.5.1 后，Dropdown 中 Popconfirm弹框使用存在问题，所以在 @flatbiz/antd@4.2.49版本修改为使用dialogConfirm组件实现二次弹框确认功能
 * @param props
 * @returns
 * ```
 * 1. Dropdown默认弹框根节点在组件内部，通过isFixed=true可设置弹框根节点在body下
 * ```
 */
export const DropdownMenuWrapper = (props: DropdownMenuWrapperProps) => {
  const { menuList, ...dropdownOtherProps } = props;
  const clsName = hooks.useId(undefined, 'DropdownMenuWrapper');

  const onClick = hooks.useCallbackRef((item: DropdownMenuItem, event) => {
    if (item.needConfirm) {
      dialogConfirm.open({
        title: (
          <FlexLayout direction="horizontal" fullIndex={1} gap={8}>
            <ExclamationCircleFilled style={{ color: '#faad14' }} />
            <span>{item.title}</span>
          </FlexLayout>
        ),
        content: <Fragment>{item.confirmMessage}</Fragment>,
        onOk: item.onClick?.bind(null, event),
        okButtonProps: {
          loadingPosition: 'center',
        },
        ...item.confirmModalProps,
      });
      return Promise.resolve();
    }
    event.stopPropagation();
    return item.onClick?.(event);
  });

  const target = document.querySelector(`.${clsName}`);
  const container = useMemo(() => {
    if (props.isFixed || (target && parentsHasSticky(target))) {
      return undefined;
    }
    return target;
  }, [props.isFixed, target]);

  const menuItems = useMemo(() => {
    const menuItemsNew: ItemType[] = [];
    menuList.filter(Boolean).forEach((item, index) => {
      if (!item) return;
      const {
        text,
        permission,
        needConfirm,
        confirmMessage,
        hidden,
        type,
        confirmModalProps,
        ...otherProps
      } = item;
      if (hidden) return;
      if (permission && !fbaUtils.hasPermission(permission)) return;
      const buttonType = type || 'link';
      const danger = otherProps.color ? false : needConfirm;
      menuItemsNew.push({
        key: index,
        label: (
          <ButtonWrapper
            loadingPosition="center"
            size="small"
            danger={danger}
            {...otherProps}
            style={{ ...otherProps.style }}
            className={classNames('dmw-item-button', otherProps.className)}
            type={buttonType}
            key={index}
            onClick={onClick.bind(null, {
              ...item,
              needConfirm,
              confirmMessage,
              confirmModalProps,
            })}
          >
            {text}
          </ButtonWrapper>
        ),
      });
    });
    return menuItemsNew;
  }, [menuList, onClick]);

  return (
    <div
      className={classNames('dropdown-menu-wrapper', clsName)}
      style={{ position: 'relative' }}
    >
      <Dropdown
        trigger={dropdownOtherProps?.trigger || ['hover']}
        getPopupContainer={container ? () => target as HTMLElement : undefined}
        arrow={{ pointAtCenter: true }}
        {...dropdownOtherProps}
        overlayStyle={{ zIndex: 9, ...dropdownOtherProps.overlayStyle }}
        menu={{ items: menuItems }}
        rootClassName="dropdown-menu-wrapper-popup"
      >
        {props.children}
      </Dropdown>
    </div>
  );
};
