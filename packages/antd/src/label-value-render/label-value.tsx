import { CSSProperties, ReactElement, useMemo, useState } from 'react';
import { classNames } from '@dimjs/utils';
import { isNumber, isUndefinedOrNull, TAny } from '@hyperse/utils';
import { hooks } from '@wove/react';
import { BoxGrid } from '../box-grid/index.js';
import { TBoxBreakpoint } from '../box-grid/type.js';
import { fbaHooks } from '../fba-hooks/index.js';
import { TextOverflow } from '../text-overflow/text-overflow.js';
import { TextSymbolWrapper } from '../text-symbol-wrapper/symbol.js';
import { TipsWrapper } from '../tips-wrapper/tips-wrapper.js';
import { TLabelValueItem, TLabelValueRenderItem } from './types.js';
import { getRenderGrid } from './utils.js';
import './style.less';

export type LabelValueRenderProps = {
  className?: string;
  style?: CSSProperties;
  /**
   * 定义一行显示几列, 默认值：4
   * ```
   * 1. label+value 一组为一列
   * 2. 当外层宽度尺寸大于 992px（lg） 时，一行显示几列
   * 3. 当外层宽度尺寸小于992px（lg），为xs、sm、md情况下不受column值影响，响应式布局
   * 4. 宽度尺寸定义
   *    xs: 宽度 < 576px
   *    sm: 宽度 ≥ 576px
   *    md: 宽度 ≥ 768px
   *    lg: 宽度 ≥ 992px
   *    xl: 宽度 ≥ 1200px
   *    xxl: 宽度 ≥ 1600px
   * 5. 列数尺寸定义
   *  {
   *    1: { xs: 24, sm: 24, md: 24, lg: 24, xl: 24, xxl: 24 },
   *    2: { xs: 24, sm: 12, md: 12, lg: 12, xl: 12, xxl: 12 },
   *    3: { xs: 24, sm: 12, md: 12, lg: 8, xl: 8, xxl: 8 },
   *    4: { xs: 24, sm: 12, md: 12, lg: 6, xl: 6, xxl: 6 },
   *    6: { xs: 24, sm: 12, md: 8, lg: 6, xl: 4, xxl: 4 },
   *  };
   * ```
   */
  column?: 1 | 2 | 3 | 4 | 6;
  /**
   * 强制定义一行显示几列，不考虑响应式
   * ```
   * 1. 优先级大于column
   * 2. 建议优先使用column配置
   * ```
   */
  forceColumn?: 1 | 2 | 3 | 4 | 6;
  /** 数据源配置 */
  options: TLabelValueItem[];
  /**
   * 超过宽度将自动省略，默认值：true
   * ```
   * 1. 当 direction = vertical时，强制为true
   * ```
   */
  ellipsis?: boolean;
  /** 是否添加边框 */
  bordered?: boolean;
  /** label对齐方式 */
  labelAlign?: 'left' | 'right' | 'center';
  /** label 宽度，默认值：100 */
  labelWidth?: number | 'auto';
  width?: number;
  /** label 样式 */
  labelStyle?: CSSProperties;
  /** value 样式 */
  valueStyle?: CSSProperties;

  size?: 'default' | 'small';
  /**
   * label&value 方向布局
   * ```
   * 1. auto表示当响应式为xs（小屏幕）时为vertical，其他情况为horizontal
   * ```
   */
  direction?: 'vertical' | 'horizontal' | 'auto';
  /**
   * 网格布局间距，默认值：[10, 0]
   * ```
   * 1. border = true 无效
   * ```
   */
  gutter?: [number, number];
};

/**
 * label+value 列表布局
 * ```
 * 1. 可设置超出隐藏、必填标识、设置隐藏、添加说明标签等功能
 * 2. 可自定义设置占用网格列数
 * 3. 内置响应式布局
 * ```
 */
export const LabelValueRender = (props: LabelValueRenderProps) => {
  const screenType = fbaHooks.useResponsivePoint() || '';
  const [breakpoint, setBreakpoint] = useState<TBoxBreakpoint>();

  const {
    column,
    forceColumn,
    labelAlign,
    labelWidth,
    options,
    bordered,
    width,
    size = 'default',
    direction = 'auto',
    gutter,
  } = props;

  const columnNew = column && [1, 2, 3, 4, 6].includes(column) ? column : 4;

  const directionNew = useMemo(() => {
    if (direction === 'horizontal' || direction === 'vertical')
      return direction;
    if (screenType === 'xs' || breakpoint === 'xs') return 'vertical';
    return 'horizontal';
  }, [breakpoint, direction, screenType]);

  const ellipsis = useMemo(() => {
    if (directionNew === 'vertical') return true;
    return isUndefinedOrNull(props.ellipsis) ? true : props.ellipsis;
  }, [directionNew, props.ellipsis]);

  const labelWidthNew = labelWidth
    ? isNumber(labelWidth)
      ? `${labelWidth}px`
      : labelWidth
    : '100px';

  const gridSize = useMemo(() => {
    if (forceColumn) {
      const num = 24 / forceColumn;
      return { xs: num, sm: num, md: num, lg: num, xl: num, xxl: num };
    }
    const columnMap = {
      1: { xs: 24, sm: 24, md: 24, lg: 24, xl: 24, xxl: 24 },
      2: { xs: 24, sm: 12, md: 12, lg: 12, xl: 12, xxl: 12 },
      3: { xs: 24, sm: 12, md: 12, lg: 8, xl: 8, xxl: 8 },
      4: { xs: 24, sm: 12, md: 12, lg: 6, xl: 6, xxl: 6 },
      6: { xs: 24, sm: 12, md: 8, lg: 6, xl: 4, xxl: 4 },
    };
    return columnMap[columnNew];
  }, [columnNew, forceColumn]);

  const renderList = useMemo(() => {
    if (!breakpoint) return undefined;
    const dataListNew: TLabelValueRenderItem[] = [];
    options.forEach((item) => {
      if (!item.hidden) {
        let grid: number | undefined = undefined;
        if (item.span) {
          const itemSpan = item.span > columnNew ? columnNew : item.span;
          grid = itemSpan * (24 / columnNew);
          if (breakpoint === 'xs') {
            grid = 24;
          } else if (breakpoint === 'sm') {
            grid = grid > 12 ? grid : 12;
          }
        }
        dataListNew.push({
          ...item,
          grid: grid ? grid : gridSize[breakpoint],
        });
      }
    });
    return getRenderGrid(dataListNew.filter(Boolean));
  }, [breakpoint, columnNew, gridSize, options]);

  const colon = bordered ? '' : ':';

  const getFormRowChildren = () => {
    return renderList
      ?.map((item, index) => {
        const ellipsisFt =
          directionNew === 'vertical'
            ? true
            : isUndefinedOrNull(item.ellipsis)
              ? ellipsis
              : item.ellipsis;

        let labelContent: ReactElement | string = `${item.label}${colon}`;

        if (item.tips && ellipsisFt) {
          labelContent = (
            <TipsWrapper tipType="tooltip" tooltipProps={{ title: item.tips }}>
              <TextOverflow text={labelContent as unknown as string} />
            </TipsWrapper>
          );
        } else if (item.tips) {
          labelContent = (
            <TipsWrapper tipType="tooltip" tooltipProps={{ title: item.tips }}>
              {labelContent}
            </TipsWrapper>
          );
        } else if (ellipsisFt) {
          labelContent = (
            <TextOverflow text={labelContent as unknown as string} />
          );
        }

        return (
          <BoxGrid.Col
            key={index}
            {...gridSize}
            span={item.grid}
            className={classNames('label-value-tr', {
              'label-value-last-tr': item.isLast,
            })}
          >
            <span className="label-value-label" style={props.labelStyle}>
              {item.required ? (
                <TextSymbolWrapper text={labelContent} symbolType="required" />
              ) : (
                labelContent
              )}
            </span>
            {ellipsisFt ? (
              <span
                className="label-value-value"
                style={props.valueStyle}
                onClick={item.onClick}
              >
                <TextOverflow
                  text={item.value as string}
                  onClick={item.onClick}
                />
              </span>
            ) : (
              <span
                className="label-value-value"
                style={{
                  wordBreak: 'break-all',
                  ...props.valueStyle,
                }}
              >
                {item.onClick ? (
                  <a onClick={item.onClick}>{item.value}</a>
                ) : (
                  item.value
                )}
              </span>
            )}
          </BoxGrid.Col>
        );
      })
      .filter(Boolean);
  };

  const onBoxBreakpointChange = hooks.useCallbackRef(
    (breakpoint: TBoxBreakpoint) => {
      setBreakpoint(breakpoint);
    }
  );

  const innerStyle = useMemo(() => {
    /** 小屏幕不控制宽度 */
    if (['xs', 'sm'].includes(screenType) || !width) {
      return {};
    }
    return { width };
  }, [screenType, width]);

  const align = (function () {
    if (labelAlign) return labelAlign;
    if (bordered) return 'left';
    if (directionNew === 'horizontal') return 'right';
    return 'left';
  })();

  return (
    <BoxGrid.Row
      style={
        {
          ...innerStyle,
          ...props.style,
          '--lvr-label-width':
            directionNew === 'horizontal' ? labelWidthNew : undefined,
        } as TAny
      }
      className={classNames(
        'label-value-render',
        `lvr-${directionNew}`,
        `lvr-size-${size}`,
        `lvr-label-${align}`,
        { 'lvr-border': bordered },
        props.className
      )}
      gutter={bordered ? [0, 0] : gutter || [10, 0]}
      onBoxBreakpointChange={onBoxBreakpointChange}
    >
      {getFormRowChildren()}
    </BoxGrid.Row>
  );
};
