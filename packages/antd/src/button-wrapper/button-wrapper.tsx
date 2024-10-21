import { ReactElement, useState } from 'react';
import { Button, ButtonProps } from 'antd';
import { OverrideToken } from 'antd/es/theme/interface';
import { LoadingOutlined } from '@ant-design/icons';
import { isPromise } from '@dimjs/lang';
import { classNames } from '@dimjs/utils';
import { isUndefinedOrNull, TAny } from '@hyperse/utils';
import { hooks } from '@wove/react';
import { ConfigProviderWrapper } from '../config-provider-wrapper/config-provider-wrapper.jsx';
import { fbaHooks } from '../fba-hooks/index.js';
import { fbaUtils } from '../fba-utils/fba-utils.js';
import './style.less';

export type ButtonWrapperProps = Omit<ButtonProps, 'onClick' | 'color'> & {
  /** 当返回 Promise 时，按钮自动loading */
  onClick?: (e: React.MouseEvent<HTMLElement>) => Promise<TAny> | void;
  /** 重复点击间隙，单位毫秒 默认值：500 */
  debounceDuration?: number;
  /** 基于GLOBAL中elemAclLimits按钮权限列表，控制按钮显示、隐藏 */
  permission?: string;
  /** 是否隐藏按钮 */
  hidden?: boolean;
  /** loading 显示位置，默认值：left */
  loadingPosition?: 'left' | 'center';
  /** 移除按钮内边距，一般用于 type=link 类型下 */
  removeGap?: boolean;
  color?: string;
};

const DefaultButton = (props: {
  children: ReactElement;
  color?: string;
  type?: ButtonProps['type'];
  disabled?: boolean;
}) => {
  if (props.color && !props.disabled) {
    let buttonTheme: OverrideToken['Button'] = {};
    if (props.type === 'link') {
      buttonTheme = {
        colorLink: props.color,
        colorLinkActive: props.color,
        colorLinkHover: props.color,
      };
    } else if (props.type === 'primary') {
      buttonTheme = {
        colorPrimary: props.color,
        colorPrimaryHover: props.color,
        colorPrimaryActive: props.color,
      };
    } else {
      buttonTheme = {
        colorPrimaryHover: props.color,
        colorPrimaryActive: props.color,
        colorText: props.color,
        colorBorder: props.color,
      };
    }

    return (
      <ConfigProviderWrapper
        theme={{
          components: {
            Button: buttonTheme,
          },
        }}
      >
        {props.children}
      </ConfigProviderWrapper>
    );
  }
  return props.children;
};

/**
 * antd Button包装组件
 * 1. 添加按钮 onClick 返回 Promise自动loading效果
 * 2. 内置 防抖 效果（在第一触发函数后，在指定时间内再次触发无效，即两次触发的时间间隙大于指定时间）
 * @param props
 * @returns
 */
export const ButtonWrapper = (props: ButtonWrapperProps) => {
  const {
    loadingPosition,
    color,
    debounceDuration,
    permission,
    hidden,
    loading,
    removeGap,
    ...otherProps
  } = props;
  const loadingNew = loading as boolean | undefined;
  const [innerLoading, setLoading] = useState(false);
  const loadingPositionNew =
    loadingPosition === undefined ? 'left' : loadingPosition;
  const isLoadingLeft = loadingPositionNew === 'left';
  const debounceDurationMew = isUndefinedOrNull(debounceDuration)
    ? 500
    : debounceDuration;
  const className = classNames(otherProps.className, {
    'button-remove-gap': removeGap,
  });

  fbaHooks.useEffectCustom(() => {
    if (!isUndefinedOrNull(loading)) {
      setLoading(loadingNew || false);
    }
  }, [loading]);

  const onClick = hooks.useDebounceClick((e) => {
    const onClick = props.onClick;
    if (!onClick) {
      return;
    }
    const result = onClick(e);
    if (result && isPromise(result)) {
      setLoading(true);
      result
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, debounceDurationMew);

  if (!fbaUtils.hasPermission(permission)) {
    return null;
  }

  if (hidden) {
    return null;
  }

  if (isLoadingLeft) {
    return (
      <DefaultButton color={color} disabled={props.disabled} type={props.type}>
        <Button
          {...otherProps}
          onClick={onClick}
          loading={innerLoading}
          className={className}
        >
          {props.children}
        </Button>
      </DefaultButton>
    );
  }

  return (
    <DefaultButton color={color} disabled={props.disabled} type={props.type}>
      <Button {...otherProps} onClick={onClick} className={className}>
        {innerLoading && (
          <div className="bw-center-loading">
            <LoadingOutlined />
          </div>
        )}
        {innerLoading ? (
          <div style={{ opacity: 0.5 }}>{props.children}</div>
        ) : (
          props.children
        )}
      </Button>
    </DefaultButton>
  );
};
