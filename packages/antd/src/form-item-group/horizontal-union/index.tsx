import {
  cloneElement,
  CSSProperties,
  isValidElement,
  ReactElement,
  useMemo,
} from 'react';
import { Form } from 'antd';
import { classNames } from '@dimjs/utils';
import { FlexLayout } from '../../flex-layout/index.js';
import './style.less';

export type FormItemHorizontalUnionProps = {
  className?: string;
  style?: CSSProperties;
  label?: string | ReactElement;
  /** 水平布局元素 */
  groupConfigList: {
    hidden?: boolean;
    before?: ReactElement | string;
    /**
     * 设置宽度
     * ```
     * 1. 自适应可设置：auto
     * 2. 可设置具体数值
     * 3. 不设置会在铺满flex剩余空间
     * 4. 多个未设置会等分铺满剩余空间
     * ```
     */
    width?: number | string;
    mainItem: ReactElement;
    after?: ReactElement | string;
  }[];
  /** 水平布局原始之间的间距 */
  gap?: number;
  flexLayoutStyle?: CSSProperties;
  flexLayoutClassName?: string;
  hidden?: boolean;
  required?: boolean;
  colon?: boolean;
};

/**
 * FormItem 水平布局
 * ```
 * Demo: https://fex.qa.tcshuke.com/docs/admin/main/form/input
 * ```
 * @param props
 * @returns
 */
export const FormItemHorizontalUnion = (
  props: FormItemHorizontalUnionProps
) => {
  const groupFlexElementData = useMemo(() => {
    const fullIndex = [] as number[];
    const flexElementList = [] as Array<ReactElement>;
    const groupConfigList = props.groupConfigList.filter(
      (item) => !item.hidden
    );
    groupConfigList.forEach((item) => {
      if (item.before) {
        flexElementList.push(
          isValidElement(item.before) ? (
            (item.before as ReactElement)
          ) : (
            <div className="union-before-text">{item.before}</div>
          )
        );
      }
      if (item.width) {
        flexElementList.push(
          cloneElement(item.mainItem, {
            style: { width: item.width, ...item.mainItem.props.style },
          })
        );
      } else {
        fullIndex.push(flexElementList.length);
        flexElementList.push(item.mainItem);
      }
      if (item.after) {
        flexElementList.push(
          isValidElement(item.after) ? (
            (item.after as ReactElement)
          ) : (
            <div className="union-after-text">{item.after}</div>
          )
        );
      }
    });
    return {
      flexElementList,
      fullIndex,
    };
  }, [props.groupConfigList]);

  return (
    <Form.Item
      label={props.label}
      className={classNames(
        'form-item-group-horizontal-union',
        props.className
      )}
      style={props.style}
      hidden={props.hidden}
      required={props.required}
      colon={props.colon}
    >
      <FlexLayout
        direction="horizontal"
        gap={props.gap === undefined ? 15 : props.gap}
        fullIndex={groupFlexElementData.fullIndex}
        style={props.flexLayoutStyle}
        className={props.flexLayoutClassName}
      >
        {groupFlexElementData.flexElementList.map((item, index) => {
          return cloneElement(item, { key: index });
        })}
      </FlexLayout>
    </Form.Item>
  );
};
