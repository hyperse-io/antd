import {
  type CSSProperties,
  type ReactElement,
  ReactNode,
  useMemo,
} from 'react';
import { classNames } from '@dimjs/utils';
import './style.less';

export type TextSymbolWrapperProps = {
  className?: string;
  style?: CSSProperties;
  /** 内置图标类型 */
  symbolType?: 'required';
  /** 自定义标记符号，优先级大于 symbolType */
  symbol?: ReactNode;
  /** 标记位置，默认：brefore */
  position?: 'before' | 'after';
  /** 显示文本 */
  text?: string | ReactElement;
  symbolStyle?: CSSProperties;
  onSymbolClick?: (event) => void;
  /** 只隐藏符号，不隐藏文案 */
  hiddenSymbol?: boolean;
  /** 图标与文字之间的间距 */
  gap?: number;
};

/**
 * 为文字添加符号，例如：必填符号
 * ```
 * 例如： <TextSymbolWrapper text={'用户名'} symbolType="required" />
 * ```
 */
export const TextSymbolWrapper = (props: TextSymbolWrapperProps) => {
  const gap = props.gap === undefined ? 3 : props.gap;
  const symbol = useMemo(() => {
    if (props.symbol) {
      return props.symbol;
    }
    if (props.symbolType === 'required') {
      return '*';
    }
    return undefined;
  }, [props.symbolType, props.symbol]);

  const position = props.position || 'before';

  if (props.hiddenSymbol) {
    return (
      <span
        className={classNames('text-symbol-wrapper', props.className)}
        style={props.style}
      >
        {props.text}
      </span>
    );
  }

  const cn = classNames(
    'text-symbol-wrapper',
    { 'tsw-required': props.symbolType },
    props.className
  );

  const hasTextSymbolSyle =
    position === 'before' ? { left: -gap } : { right: -gap };
  const noTextSymbolSyle = position === 'before' ? { left: 0 } : { right: 0 };
  const symbolSyle = props.text ? hasTextSymbolSyle : noTextSymbolSyle;
  return (
    <span className={cn} style={props.style}>
      {symbol ? (
        <span
          className={classNames('tsw-symbol', `tsw-symbol-${position}`)}
          style={{
            ...hasTextSymbolSyle,
            ...symbolSyle,
          }}
          onClick={props.onSymbolClick}
        >
          {symbol}
        </span>
      ) : null}

      {props.text}
    </span>
  );
};
