import { Children, Fragment, type ReactNode, useMemo, useRef } from 'react';
import { classNames } from '@dimjs/utils';
import { dom, isUndefinedOrNull, type TAny } from '@hyperse/utils';
import { BoxGrid } from '../box-grid/index.js';
import { type BoxRowProps } from '../box-grid/row.jsx';
import { type GutterParams } from '../box-grid/type.js';
import { fbaHooks } from '../fba-hooks/index.js';
import { FormWrapper, type FormWrapperProps } from '../form-wrapper/index.js';
import { preDefinedClassName } from '../pre-defined-class-name/index.js';
import './style.less';

export type EasyFormProps = Omit<FormWrapperProps, 'children'> & {
  /**
   * 定义一行显示几列（当外层宽度尺寸大于 992px（lg） 时，一行显示几列）, 默认值：3
   * ```
   * 1. 当外层宽度尺寸小于992px（lg），为xs、sm、md情况下不受column值影响（column=1除外）
   * 2. 宽度尺寸定义
   *    xs: 宽度 < 576px
   *    sm: 宽度 ≥ 576px
   *    md: 宽度 ≥ 768px
   *    lg: 宽度 ≥ 992px
   *    xl: 宽度 ≥ 1200px
   *    xxl: 宽度 ≥ 1600px
   * 3. 列数尺寸定义
   *  {
   *    1: { xs: 24, sm: 24, md: 24, lg: 24, xl: 24, xxl: 24 },
   *    2: { xs: 24, sm: 12, md: 12, lg: 12, xl: 12, xxl: 12 },
   *    3: { xs: 24, sm: 12, md: 12, lg: 8, xl: 8, xxl: 8 },
   *    4: { xs: 24, sm: 12, md: 12, lg: 6, xl: 6, xxl: 6 },
   *  };
   * ```
   */
  column?: 1 | 2 | 3 | 4;
  /**
   * 强制定义一行显示几列，不考虑响应式
   * ```
   * 1. 优先级大于column
   * 2. 建议优先使用column配置
   * ```
   */
  forceColumn?: 1 | 2 | 3 | 4;
  /**
   * Form显示宽度，可数值、可百分比；在小屏幕尺寸（xs、sm）上无效
   */
  width?: number | string;
  /** 网格间距 */
  gridGutter?: BoxRowProps['gutter'];
  children: ReactNode;
  /**
   * 是否为纯净模式，对EasyForm的子节点不做任何包装处理
   */
  isPure?: boolean;
};

/**
 * 简单Form布局，可自定义网格布局
 * ```
 * 1. demo：https://fex.qa.tcshuke.com/docs/admin/main/form/grid
 * 2. EasyForm的children列表会进行网格化布局，可通过设置 isPure = true设置纯净模式（对EasyForm的子节点不做任何包装处理）
 * 3. EasyForm可嵌套使用，嵌套内部的<EasyForm />节点Form相关属性失效，例如属性form、initialValues等都失效
 *  <EasyForm form={form}>
 *    ....
 *    <EasyForm>...</EasyForm>
 *    ....
 *    <EasyForm>...</EasyForm>
 *    ....
 *  </EasyForm>
 * 4. 布局网格以当前组件的宽度来计算的，不是屏幕宽度
 * 5. EasyForm 子节点包含 hidden = true 会被忽略
 * 6. 通过 column 可定义一行显示几列FormItem
 * 7. 通过 labelItemVertical 可定义 formitem 竖直布局
 * 8. 通过 formItemGap 可定义 formItem竖直方向间隙
 * 9. 通过 forceColumn 可强制定义一行显示几列，不考虑响应式
 * 10. 通过 labelWidth 可控制Form内部所有label的宽度（可实现整齐效果）
 * 11. 自定义栅格占位格数，见下方`例如`

 * 例如
 * <EasyForm column={3}>
 *	 <FormItemWrapper name="field1" label="条件1">
 *	   <Input placeholder="请输入" allowClear={true} />
 *	 </FormItemWrapper>
 *	 <!-- ！！自定义栅格占位格数第一种方式：可通过使用 BoxGrid.Col 包裹元素来自定义网格占比 -->
 *	 <BoxGrid.Col span={24}>
 *	   <FormItemWrapper name="field5" label="条件5">
 *	 	<Input placeholder="请输入" allowClear={true} />
 *	   </FormItemWrapper>
 *	 </BoxGrid.Col>
 *	 <!-- ！！自定义栅格占位格数第二种方式：如果为FormItemWrapper组件，可设置span属性 -->
 *	 <FormItemWrapper name="field6" label="条件6" span={24}>
 *	   <Input placeholder="请输入" allowClear={true} />
 *	 </FormItemWrapper>
 *	 <FormItemWrapper noStyle span={24}>
 *	   <Button>按钮</Buttone>
 *	 </FormItemWrapper>
 * </EasyForm>
 * ```
 */
export const EasyForm = (props: EasyFormProps) => {
  const screenType = fbaHooks.useResponsivePoint() || '';

  const {
    column,
    forceColumn,
    children,
    width,
    gridGutter,
    labelWidth,
    labelItemVertical,
    labelAlign,
    formItemGap = '15',
    isPure,
    ...otherProps
  } = props;

  const gridSize = useMemo(() => {
    if (forceColumn) {
      const num = 24 / forceColumn;
      return { xs: num, sm: num, md: num, lg: num, xl: num, xxl: num };
    }
    if (!column) {
      return { xs: 24, sm: 12, md: 12, lg: 8, xl: 8, xxl: 6 };
    }
    const columnMap = {
      1: { xs: 24, sm: 24, md: 24, lg: 24, xl: 24, xxl: 24 },
      2: { xs: 24, sm: 12, md: 12, lg: 12, xl: 12, xxl: 12 },
      3: { xs: 24, sm: 12, md: 12, lg: 8, xl: 8, xxl: 8 },
      4: { xs: 24, sm: 12, md: 12, lg: 6, xl: 6, xxl: 6 },
    };
    return columnMap[column];
  }, [column, forceColumn]);

  const getHiddenRowChildren = () => {
    return Children.toArray(children).filter((item: TAny) => {
      return (
        item.props['hidden'] || item.type['domTypeName'] == 'FormItemHidden'
      );
    });
  };

  const getFormRowChildren = () => {
    return Children.toArray(children)
      .filter((item: TAny) => {
        return (
          !item.props['hidden'] && item.type['domTypeName'] != 'FormItemHidden'
        );
      })
      .map((item: TAny, index) => {
        if (item.type['domTypeName'] === 'BoxGridCol')
          return <Fragment key={index}>{item}</Fragment>;
        let span: number | undefined = undefined;
        if (
          item.type['domTypeName'] === 'FormItemWrapper' ||
          item.type['domTypeName'] === 'FormItemText'
        ) {
          span = item.props['span'] as number;
          if (span) {
            if (screenType === 'xs') {
              span = 24;
            } else if (screenType === 'sm') {
              span = span > 12 ? span : 12;
            }
          }
        }
        return (
          <BoxGrid.Col key={index} {...gridSize} span={span}>
            {item}
          </BoxGrid.Col>
        );
      })
      .filter(Boolean);
  };

  const innerStyle = useMemo(() => {
    /** 小屏幕不控制宽度 */
    if (['xs', 'sm'].includes(screenType) || !width) {
      return {};
    }
    return { width };
  }, [screenType, width]);

  const gutter = isUndefinedOrNull(gridGutter)
    ? ([15, 0] as GutterParams)
    : gridGutter;
  const anchorRef = useRef<HTMLDivElement>(null);

  // 是否嵌套内部EasyForm节点
  const getIsNestedEasyForm = () => {
    try {
      if (anchorRef.current) {
        const target = dom.findParentsElement(anchorRef.current, (node) => {
          return node.classList?.contains?.('easy-form');
        });
        return target ? true : false;
      }
      return undefined;
    } catch (error) {
      console.log('error', error);
      return false;
    }
  };

  const isNestedEasyForm = getIsNestedEasyForm();

  const labelAlignNew = useMemo(() => {
    if (['xs'].includes(screenType)) {
      return 'left';
    }
    return labelAlign;
  }, [labelAlign, screenType]);

  const fromLayoutClassName = useMemo(() => {
    return preDefinedClassName.getFormLayoutClassName({
      labelWidth,
      labelItemVertical,
      labelAlign: labelAlignNew,
      formItemGap,
      className: otherProps.className,
    });
  }, [
    labelWidth,
    labelItemVertical,
    labelAlignNew,
    formItemGap,
    otherProps.className,
  ]);

  return (
    <Fragment>
      <div className="easy-form-anchor" ref={anchorRef}></div>
      {isNestedEasyForm === true ? (
        <div
          style={{ ...innerStyle, ...otherProps.style }}
          className={classNames(
            'easy-form',
            { 'easy-form-pure': isPure },
            'easy-form-nested',
            fromLayoutClassName
          )}
        >
          {getHiddenRowChildren()}
          {isPure ? (
            children
          ) : (
            <BoxGrid.Row gutter={gutter}>{getFormRowChildren()}</BoxGrid.Row>
          )}
        </div>
      ) : undefined}
      {isNestedEasyForm === false ? (
        <FormWrapper
          {...otherProps}
          labelWidth={labelWidth}
          labelAlign={labelAlignNew}
          labelItemVertical={labelItemVertical}
          formItemGap={formItemGap}
          style={{ ...innerStyle, ...otherProps.style }}
          className={classNames(
            'easy-form',
            { 'easy-form-pure': isPure },
            fromLayoutClassName
          )}
          autoComplete="off"
        >
          {getHiddenRowChildren()}
          {isPure ? (
            children
          ) : (
            <BoxGrid.Row gutter={gutter}>{getFormRowChildren()}</BoxGrid.Row>
          )}
        </FormWrapper>
      ) : undefined}
    </Fragment>
  );
};
