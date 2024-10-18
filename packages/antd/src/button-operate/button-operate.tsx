import {
  CSSProperties,
  FC,
  Fragment,
  isValidElement,
  ReactElement,
  ReactNode,
  useMemo,
  useState,
} from 'react';
import {
  Button,
  Divider,
  Popconfirm,
  PopconfirmProps,
  Popover,
  Space,
  SpaceProps,
  Tooltip,
} from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { isPlainObject, isPromise, isString, isUndefined } from '@dimjs/lang';
import { classNames } from '@dimjs/utils';
import { hooks } from '@wove/react';
import {
  ButtonWrapper,
  ButtonWrapperProps,
} from '../button-wrapper/button-wrapper.js';
import { DialogModalProps } from '../dialog-modal/dialog-modal.js';
import {
  DropdownMenuWrapper,
  DropdownMenuWrapperProps,
} from '../dropdown-menu-wrapper/dropdown-menu-wrapper.js';
import { fbaUtils } from '../fba-utils/fba-utils.js';
import './style.less';

export interface ButtonOperateItem extends ButtonWrapperProps {
  /** hover 提示文字，isFold=true无效 */
  hoverTips?: string | React.ReactElement;
  /** hover 提示类型 默认：'tooltip' */
  tipsType?: 'popover' | 'tooltip';
  /** 按钮文案 */
  text?: string | ReactElement;
  /** 自定义按钮颜色 */
  color?: string;
  /** 是否需要二次弹框确认 */
  needConfirm?: boolean;
  /** 二次弹框确认文案  */
  confirmMessage?: string;
  /* isFold=false & needConfirm=true 有效  */
  popconfirmProps?: Pick<
    PopconfirmProps,
    'placement' | 'okText' | 'cancelText' | 'trigger'
  >;
  /** 是否折叠合拢 */
  isFold?: boolean;
  /* isFold=true & needConfirm=true 有效  */
  confirmModalProps?: DialogModalProps;
}

export interface ButtonOperateProps {
  className?: string;
  style?: CSSProperties;
  /**
   * 如果数组中元素为ReactElement类型
   * 1. 一般为antd Button组件，如果组件存在属性hidden=true，则会隐藏
   * 2. 可配置 v-permission 权限值，例如 v-permission="add"
   * 3. 任何confirm、disabled等状态在外部控制
   * 3. 不支持fold效果
   */
  operateList: Array<ButtonOperateItem | null | ReactElement>;
  /** 是否换行，默认true */
  wrap?: boolean;
  /** 隐藏图标Icon */
  foldIcon?: ReactElement;
  /** 按钮之间是否添加分隔符 */
  split?: boolean;
  /** 多个按钮的包装组件Space属性 */
  spaceProps?: SpaceProps;
  /** 间距，默认：10；split=true配置下无效（可通过spaceProps设置间距） */
  gap?: number;
  /** 折叠合拢属性 */
  dropdownMenuProps?: Omit<DropdownMenuWrapperProps, 'menuList'>;
}

export const ButtonOperateItemContent = (
  props: Pick<ButtonOperateItem, 'hoverTips' | 'tipsType'> & {
    content: ReactNode;
  }
) => {
  if (props.hoverTips) {
    if (props.tipsType === 'popover') {
      return (
        <Popover content={props.hoverTips} zIndex={1000}>
          <span>{props.content}</span>
        </Popover>
      );
    }
    return (
      <Tooltip title={props.hoverTips} zIndex={1000}>
        <span>{props.content}</span>
      </Tooltip>
    );
  }
  if (isValidElement(props.content)) {
    return <Fragment>{props.content}</Fragment>;
  }
  // ButtonOperate item 内部 span 包文案会有动态效果
  return <span>{props.content}</span>;
};

/**
 * 按钮组合处理组件
 */
export const ButtonOperate: FC<ButtonOperateProps> = (props) => {
  const [loading, setLoading] = useState(false);

  const onConfirm = hooks.useCallbackRef((item: ButtonOperateItem, event) => {
    const result = item.onClick?.(event);
    if (result && isPromise(result)) {
      setLoading(true);
      return result.finally(() => {
        setLoading(false);
      });
    }
    return;
  });

  const operateList = props.operateList.filter((item) => {
    if (!item) return false;
    if (isValidElement(item)) {
      if (item.props?.['hidden'] === true) return false;
      const permission = item.props?.['v-permission'];
      if (isString(permission)) {
        return fbaUtils.hasPermission(permission);
      }
      return true;
    }
    if (isPlainObject(item)) {
      if (!fbaUtils.hasPermission(item['permission'])) {
        return false;
      }
      return !item['hidden'];
    }
    return false;
  }) as Array<ButtonOperateItem | ReactElement>;

  const viewList = useMemo(() => {
    return operateList.filter((item) => {
      if (isValidElement(item)) {
        return true;
      }
      return !item['isFold'];
    }) as ButtonOperateItem[];
  }, [operateList]);

  const foldList = useMemo(() => {
    const filterList = operateList.filter((item) => {
      if (isValidElement(item)) {
        return false;
      }
      return item['isFold'];
    }) as ButtonOperateItem[];
    const result = [] as ButtonOperateItem[];
    filterList.forEach((item) => {
      const target = { ...item };
      // 多余字段渲染到react dom上，出现警告
      delete target.isFold;
      result.push(target);
    });
    return result;
  }, [operateList]);

  const gap = props.gap === undefined ? 10 : props.gap;
  const size = !props.split ? gap : 0;

  return (
    <div
      className={classNames('table-operate', props.className)}
      style={props.style}
    >
      <Space
        split={props.split ? <Divider type="vertical" /> : null}
        size={size}
        wrap={isUndefined(props.wrap) ? true : props.wrap}
        {...props.spaceProps}
      >
        {viewList.map((item, index) => {
          if (item && isValidElement(item)) {
            return (
              <ButtonOperateItemContent
                content={item}
                hoverTips={item.hoverTips}
                tipsType={item.tipsType}
                key={index}
              />
            );
          }
          const {
            text,
            onClick,
            needConfirm,
            confirmMessage,
            popconfirmProps,
            hoverTips,
            ...otherProps
          } = item;
          const type = item.type || 'link';
          if (needConfirm && !otherProps.disabled) {
            const danger = item.color ? false : true;
            return (
              <Popconfirm
                okText="确定"
                cancelText="取消"
                trigger={['click']}
                placement="topRight"
                arrow={true}
                destroyTooltipOnHide={true}
                {...popconfirmProps}
                title={confirmMessage}
                onConfirm={onConfirm.bind(null, item)}
                key={index}
                okButtonProps={{
                  loading,
                }}
                onOpenChange={(_open) => {
                  if (!_open) {
                    setLoading(false);
                  }
                }}
                onCancel={(event) => {
                  event?.stopPropagation();
                }}
              >
                <ButtonWrapper
                  danger={danger}
                  {...otherProps}
                  onClick={(event) => {
                    event.stopPropagation();
                  }}
                  type={type}
                >
                  <ButtonOperateItemContent
                    content={text}
                    hoverTips={hoverTips}
                    tipsType={item.tipsType}
                    key={index}
                  />
                </ButtonWrapper>
              </Popconfirm>
            );
          }
          return (
            <ButtonWrapper
              loadingPosition="center"
              {...otherProps}
              type={type}
              onClick={(event) => {
                event.stopPropagation();
                return onClick?.(event);
              }}
              key={index}
            >
              <ButtonOperateItemContent
                content={text}
                hoverTips={hoverTips}
                tipsType={item.tipsType}
              />
            </ButtonWrapper>
          );
        })}
        {foldList.length > 0 ? (
          <DropdownMenuWrapper
            menuList={foldList}
            placement="bottomCenter"
            {...props.dropdownMenuProps}
          >
            <Button
              type="link"
              className="fold-more-button"
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              {props.foldIcon ? props.foldIcon : <MoreOutlined />}
            </Button>
          </DropdownMenuWrapper>
        ) : null}
      </Space>
    </div>
  );
};

ButtonOperate.defaultProps = {
  split: true,
};
