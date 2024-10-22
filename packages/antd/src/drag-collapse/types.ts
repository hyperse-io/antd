import { type CSSProperties, type ReactElement, type ReactNode } from 'react';
import { type CollapseProps } from 'antd';

export type DragCollapseItemKey = number | string;
export type DragCollapseItem = {
  key: DragCollapseItemKey;
  header: ReactNode;
  content: ReactElement;
};

export type DragCollapseProps = {
  className?: string;
  style?: CSSProperties;
  /** 面板数据 */
  items: DragCollapseItem[];
  /** 拖拽面板回调 */
  onDropChange: (items: DragCollapseItem[]) => void;
  /** 手风琴模式，只允许单个内容区域展开 */
  accordion?: boolean;
  /** 当前激活 tab 面板的key  */
  activeKey?: DragCollapseItemKey | DragCollapseItemKey[];
  /** 所有子面板是否可折叠或指定可折叠触发区域，可选: header | icon | disabled */
  collapsible?: CollapseProps['collapsible'];
  /** 初始化选中面板的 key */
  defaultActiveKey?: DragCollapseItemKey[];
  /** 自定义切换图标	 */
  expandIcon?: CollapseProps['expandIcon'];
  /** 设置图标位置，可选：start | end */
  expandIconPosition?: CollapseProps['expandIconPosition'];
  /** 设置折叠面板大小	 */
  size?: CollapseProps['size'];
  /** 隐藏拖拽图标，默认不隐藏 */
  hideDragIcon?: boolean;
  /** 设置拖拽图标 */
  dragIcon?: ReactElement;
  /** 切换面板的回调	 */
  onChange?: (activeKey?: DragCollapseItemKey | DragCollapseItemKey[]) => void;
};
