import { useState } from 'react';
import { Tag, TagProps } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { isPromise } from '@dimjs/lang';
import { isUndefinedOrNull, TAny } from '@hyperse/utils';
import { hooks } from '@wove/react';
import { fbaHooks } from '../fba-hooks/index.js';
import './style.less';

export type TagWrapperProps = Omit<TagProps, 'onClick'> & {
  onClick?: (e: React.MouseEvent<HTMLElement>) => Promise<TAny> | void;
  loading?: boolean;
  // 重复点击间隙，单位毫秒 默认值：500
  debounceDuration?: number;
};

/**
 * 为 Tag 添加 loading 效果
 */
export const TagWrapper = (props: TagWrapperProps) => {
  const { loading, children, debounceDuration, style, ...otherProps } = props;

  const [innerLoading, setLoading] = useState(false);
  const debounceDurationMew = isUndefinedOrNull(debounceDuration)
    ? 500
    : debounceDuration;

  fbaHooks.useEffectCustom(() => {
    if (!isUndefinedOrNull(loading)) {
      setLoading(loading || false);
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

  return (
    <Tag
      {...otherProps}
      onClick={onClick}
      style={{ cursor: props.onClick ? 'pointer' : 'default', ...style }}
    >
      {innerLoading && (
        <div className="tw-center-loading">
          <LoadingOutlined />
        </div>
      )}
      {innerLoading ? <div style={{ opacity: 0.5 }}>{children}</div> : children}
    </Tag>
  );
};
