import { type CSSProperties, type ReactElement, type ReactNode } from 'react';
import { type TPlainObject } from '@hyperse/utils';
import { type InputSearchWrapperProps } from '../input-search-wrapper/index.js';

export interface ISearchMenuProps {
  size?: 'small' | 'default';
  /**
   * 如果传了value，就变成受控组件
   * 目前只支持单选
   */
  value?: string;
  onChange?: (key: string, targetItem?: TPlainObject) => void;
  /** 树型源数据 */
  dataSource: TPlainObject[];
  /** 惰性搜索 */
  lazySearch?: boolean;
  /** 搜索目标字段 */
  searchKeyList?: string[];
  /** 格式化参数 */
  fieldNames?: {
    label?: string;
    key?: string;
  };
  /** 自定义渲染条目 */
  renderItem?: (nodeData: TPlainObject) => ReactElement;
  /** 搜索框参数 */
  inputProps?: InputSearchWrapperProps;
  /** 搜索位置额外元素 */
  searchExtraElement?: ReactElement;
  placeholder?: string;
  className?: string;
  wrapStyle?: CSSProperties;
  style?: CSSProperties;
  searchStyle?: CSSProperties;
  /** 是否显示搜索区域 */
  showSearch?: boolean;
}

export interface IListViewItem {
  label: ReactNode;
  key: string;
}
