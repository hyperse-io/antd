import { type FC, useEffect, useRef } from 'react';
import { classNames } from '@dimjs/utils';
import {
  alignPropsMap,
  justifyPropsMap,
  PresetDefaultGrid,
} from './constant.js';
import { BoxGridProviderCtx, defaultCtx } from './ctx.js';
import { useBoxBreakpoint, useGutter } from './hooks.js';
import {
  type GutterParams,
  type ICommonReact,
  type TBoxBreakpoint,
} from './type.js';

export interface BoxRowProps {
  /**
   * 在不同响应尺寸下的元素占位格数
   * 应用到所有Col子元素上
   */
  defaultGrid?: Partial<typeof PresetDefaultGrid>;
  /** 间距 */
  gutter?: GutterParams;
  /** flex 布局的垂直对齐方式 */
  align?: 'top' | 'middle' | 'bottom' | 'stretch';
  /** flex 布局的水平排列方式 */
  justify?:
    | 'start'
    | 'end'
    | 'center'
    | 'space-around'
    | 'space-between'
    | 'space-evenly';
  /** 尺寸变化回调 */
  onBoxBreakpointChange?: (breakpoint: TBoxBreakpoint) => void;
}

export const Row: FC<BoxRowProps & ICommonReact> = (props) => {
  const {
    defaultGrid = PresetDefaultGrid,
    children,
    className,
    style,
    gutter,
    align,
    justify,
    onBoxBreakpointChange,
  } = props;
  const comRef = useRef<HTMLDivElement>(null);
  const { boxBreakpoint, haveWidth } = useBoxBreakpoint(comRef);
  const { horizontalGap, verticalGap } = useGutter(gutter, boxBreakpoint);

  useEffect(() => {
    onBoxBreakpointChange?.(boxBreakpoint);
  }, [boxBreakpoint]);

  return (
    <BoxGridProviderCtx.Provider
      value={{
        ...defaultCtx,
        defaultGrid: {
          ...PresetDefaultGrid,
          ...defaultGrid,
        },
        boxBreakpoint,
        horizontalGap,
        verticalGap,
      }}
    >
      <div
        className={classNames('box-grad-root', className)}
        ref={comRef}
        style={style}
      >
        <div
          className="box-grad-row"
          style={{
            alignItems: align ? alignPropsMap[align] : 'normal',
            justifyContent: justify ? justifyPropsMap[justify] : 'normal',
            marginLeft: `-${horizontalGap / 2}px`,
            marginRight: `-${horizontalGap / 2}px`,
            rowGap: `${verticalGap}px`,
            /**
             * fix: boxBreakpoint多次变化，闪一下的问题
             * 子元素拿不到宽度，boxBreakpoint 会快速变化，导致元素闪烁
             * 场景：
             * 1. 使用 Tabs 组件时，任意父级元素disabled，子元素拿不到宽度
             * 2. 初始渲染，拿不到宽度
             */
            opacity: haveWidth ? 1 : 0,
          }}
        >
          {children}
        </div>
      </div>
    </BoxGridProviderCtx.Provider>
  );
};
