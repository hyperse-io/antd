import { ReactElement } from 'react';
import { TAny, TPlainObject } from '@hyperse/utils';

export type RelationProps = {
  /** 左侧Tag+线占用宽度 */
  tagLineWidth?: number;
  /** 缩进宽度，配合【RelationGroup】使用 */
  indentWidth?: number;
  /** 连接线上Tag文案 */
  tagName?: string;
  /** 连接线上Tag颜色 */
  tagColor?: string;
  /** 连接线上Tag宽度 */
  tagWidth?: number;
  /** 连接线上Tag点击事件 */
  onTagClick?: (tagName?: string) => void;

  /**连接线颜色 */
  lineColor?: string;
  solt1: () => ReactElement;
  solt2?: () => ReactElement | null;
  className?: string;
  onlyOne?: boolean;
  onlyNoMainOne?: boolean;
  label?: string;
};

export type RelationTreeProps = {
  className?: string;
  dataSource?: TRelationTreeData;
  children: (
    data: TRelationTreeCustomData,
    operate: TRelationTreeOperate,
    extraData?: TPlainObject
  ) => ReactElement;
  onChange?: (dataSource?: TRelationTreeData) => void;
  relationProps?: Pick<
    RelationProps,
    'tagLineWidth' | 'indentWidth' | 'tagColor' | 'tagWidth' | 'lineColor'
  >;
  onTagClick?: (uid: string, extraData?: TPlainObject) => void;
};

export type TRelationTreeCustomData = TPlainObject & {
  uid: string;
};

export type TRelationTreeRelationItem = {
  uid: string;
  customData?: TRelationTreeCustomData;
  children?: TRelationTreeData[];
  extraData?: TPlainObject;
};

export type TRelationTreeData = {
  uid: string;
  tagName: string;
  label?: string;
  relationList: TRelationTreeRelationItem[];
  extraData?: TPlainObject;
};

export type TRelationTreeOperate = {
  add: (
    soruceData: TRelationTreeCustomData,
    initialData: TRelationTreeRelationItem
  ) => void;
  addChildren: (
    soruceData: TRelationTreeCustomData,
    initialData: TRelationTreeData
  ) => void;
  remove: (uid: string) => void;
  onChange: (name: string, value: TAny) => void;
};
