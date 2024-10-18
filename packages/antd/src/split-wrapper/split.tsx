import { Children, type CSSProperties, useState } from 'react';
import Split, { type SplitProps } from 'react-split';
import { classNames } from '@dimjs/utils';
import { hooks } from '@wove/react';
import './style.less';
type SplitWrapperProps = SplitProps & {
  panelStyle?: CSSProperties;
};
/**
 * 分屏可拖动组件
 * ```
 *  <SplitWrapper
      sizes={[25, 75]}
      minSize={[300, 300]}
      direction={'vertical'}
    >{...}</SplitWrapper>
    1. 通过 sizes 来初始化设置面板分屏尺寸
    2. 通过 minSize 来设置面板最小尺寸
    3. 通过 direction 设置方向
 * ```
 */
export const SplitWrapper = (props: SplitWrapperProps) => {
  const childrenList = Children.toArray(props.children);
  const [key, setKey] = useState(Date.now());

  hooks.useUpdateEffect(() => {
    setKey(Date.now());
  }, [props.direction]);

  return (
    <Split
      key={key}
      gutterSize={10}
      {...props}
      className={classNames(
        'split-warpper',
        `split-warpper-${props.direction}`,
        props.className
      )}
    >
      {childrenList.map((item, index) => {
        return (
          <div
            className="split-warpper-panel"
            key={index}
            style={props.panelStyle}
          >
            {item}
          </div>
        );
      })}
    </Split>
  );
};
