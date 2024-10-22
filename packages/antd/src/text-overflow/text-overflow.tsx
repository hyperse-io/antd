import { memo } from 'react';
import { isString } from '@dimjs/lang';
import { OverflowAuto } from './overflow-auto.jsx';
import { OverflowLength } from './overflow-length.jsx';
import { OverflowWidth } from './overflow-width.jsx';
import { type TextOverflowProps } from './types.jsx';
import './style.less';

const InnerTextOverflow = (props: TextOverflowProps) => {
  if (props.maxLength && isString(props.text)) {
    return <OverflowLength {...props} />;
  }
  if (props.maxWidth) {
    return <OverflowWidth {...props} />;
  }
  return <OverflowAuto {...props} />;
};

/**
 * 内容溢出截取，并在尾部添加...，被截取的添加Tooltip显示完整数据
 * ```
 * 控制文本显示三种方式
 * 1. 通过 maxLength 控制超长
 * 2. 通过 maxWidth 控制超长
 * 3. 与父节点宽度比较，控制超长
 * 4. 优先级  maxLength > maxWidth
 *
 * 注意：
 * 1. 当前节点父节点需要添加 overflow-x: hidden;
 * 2. 如果父节点设置flex-shrink会有影响，可复写flex-shrink: initial;
 * 3. 与 Table columns render结合使用，需要配置ellipsis=true
 *    例如：<Table columns={[{
             ...
             render: (value) => {
               return <TextOverflow text={value} />;
             },
             ellipsis: true,
           }]} />
    4. 与 Table columns render结合使用，如果Table配置了 scroll={{ x: 'max-content' }}后，不能与TextOverflow maxWidth结合使用
 * ```
 */
export const TextOverflow = memo(InnerTextOverflow, (pre, next) => {
  if (
    pre.text !== next.text ||
    pre.maxLength !== next.maxLength ||
    pre.maxWidth !== pre.maxWidth
  ) {
    return false;
  }
  return true;
});
