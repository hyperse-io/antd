import { CSSProperties, ReactElement } from 'react';
import { CollapseProps, FormListFieldData, FormListOperation } from 'antd';
import { FormListProps } from 'antd/es/form';
import { TPlainObject } from '@hyperse/utils';

export type DragCollapseFormListContentProps = {
  /** Form.List item fieldData */
  formListFieldData: FormListFieldData;
  /** 当前阶段 完整 formItem name */
  formStageCompleteName: Array<string | number>;
  /** Form.List 操作项 */
  operation: FormListOperation;
  uid: string | number;
  /** 获取当前FormList 内部 Form.Item name */
  getInsideFormItemName: (key: string | string[]) => Array<string | number>;
  /** 获取当前 FormList Item 数据 */
  getInsideFormItemData: () => TPlainObject;
  /** 索引 */
  index: number;
};

export type DragCollapseFormListHeaderProps = DragCollapseFormListContentProps;

export type DragCollapseFormListProps = {
  /** formList item 数据中的唯一值，默认值：uid */
  uidFieldName?: string;
  className?: string;
  style?: CSSProperties;
  /** formList name */
  formListName: string | number | (string | number)[];
  /** 拖拽面板回调 */
  onDropChange?: (items: TPlainObject[]) => void;
  /** 手风琴模式，只允许单个内容区域展开 */
  accordion?: boolean;
  /** 当前激活 tab 面板的key  */
  activeKey?: number | number[];
  /** 所有子面板是否可折叠或指定可折叠触发区域，可选: header | icon | disabled */
  collapsible?: CollapseProps['collapsible'];
  /** 初始化选中面板的 key */
  defaultActiveKey?: number[];
  /** 自定义切换图标	 */
  expandIcon?: CollapseProps['expandIcon'];
  /** 设置图标位置，可选：start | end */
  expandIconPosition?: CollapseProps['expandIconPosition'];
  /** 设置折叠面板大小	 */
  size?: CollapseProps['size'];
  /** 设置拖拽图标 */
  dragIcon?: ReactElement;
  /** 切换面板的回调	 */
  onChange?: (activeKey?: number | string | (number | string)[]) => void;
  /** 禁用拖拽，拖拽图标隐藏 */
  dragDisabled?: boolean;
  /** 折叠面板 header 渲染 */
  header: (data: DragCollapseFormListHeaderProps) => ReactElement;
  /** 折叠面板 content 渲染 */
  content: (data: DragCollapseFormListContentProps) => ReactElement;
  /** 设置面板禁止拖拽   */
  getItemDragDisabled?: (uid: string | number, index: number) => boolean;
  rules?: FormListProps['rules'];
};
