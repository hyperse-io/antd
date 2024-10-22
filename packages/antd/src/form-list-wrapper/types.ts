import { type CSSProperties, type ReactElement } from 'react';
import { type FormListFieldData, type FormListOperation } from 'antd';
import { type FormListProps } from 'antd/es/form';
import { type TPlainObject } from '@hyperse/utils';
import { type FormItemHorizontalUnionProps } from '../form-item-group/horizontal-union/index.jsx';

export type FormListWrapperContentProps = {
  /** Form.List item fieldData */
  formListFieldData: FormListFieldData;
  /**
   * 当前阶段 完整 formItem name
   * ```
   * 1. 获取当前输入项Item数据
   *    form.getFieldValue(props.formStageCompleteName);
   * 2. 获取当前输入项Item指定字段数据
   *    form.getFieldValue([...props.formStageCompleteName, 'key']);
   * ```
   */
  formStageCompleteName: (string | number)[];
  /**
   * formList上一级 formItem完整name
   */
  prevCompleteName: (string | number)[];
  /** Form.List 操作项 */
  operation: FormListOperation;
  /** 索引 */
  index: number;
  /** 获取当前FormList 内部 Form.Item name */
  getInsideFormItemName: (key: string | string[]) => Array<string | number>;
  /** 获取当前 FormList Item 数据 */
  getInsideFormItemData: () => TPlainObject;
  /** 唯一值字段Key */
  uidKey: string;
};

export type FormListWrapperProps = {
  className?: string;
  style?: CSSProperties;
  /** formList item 数据中的唯一值，默认值：uid */
  uidFieldName?: string;
  /** formList name */
  name: string | number | (string | number)[];
  /**
   * formList上一级 formItem完整name
   * ```
   * 1. 如果没有传 []
   * 2. FormList内部通过 Form.useWatch 取值需要完整 name
   * ```
   */
  prevCompleteName: (string | number)[];
  /** formListItem 内容 */
  /** 新增行默认值，自定义onTableAfterRender后失效 */
  getAddRowDefaultValues?: () => TPlainObject;
  /** 隐藏新增行按钮 */
  hiddenAddRowButton?: boolean;
  /** 自定义新增行按钮，getAddRowDefaultValues配置失效 */
  onCustomAddRowButton?: (operation: FormListOperation) => ReactElement;
  /** formListItem 内容 */
  children: (data: FormListWrapperContentProps) => ReactElement;
  /** 隐藏数据为空渲染 */
  hiddenEmptyRender?: boolean;
  /** formList内部渲染包装，多用于FormListWrapper嵌套布局 */
  formListChildrenWrapper?: (props: { children: ReactElement }) => ReactElement;
  /**
   * Form.List rules
   * ```
   rules={[
      {
        validator: async (_, names) => {
          if (!names || names.length < 2) {
            return Promise.reject(new Error('At least 2 passengers'));
          }
        },
      },
    ]}
   * ```
   */
  rules?: FormListProps['rules'];
  /**
   * 设置FormList字段标题&必填标志
   * ```
   * demo: http://dev.flatjs.com:6007/pages/flat/oss-demo/main/form/list?env=me
   * 1. 会根据数组顺序进行渲染
   * ```
   */
  formListItemTitleList?: {
    title: string;
    required?: boolean;
    width?: number;
  }[];
  /** formListItemTitle HorizontalUnionProps 配置 */
  formListItemTitleHorizontalUnionProps?: Omit<
    FormItemHorizontalUnionProps,
    'groupConfigList'
  >;
  /** FormList Item 之间间隙，默认值：16 */
  itemGap?: number;
};
