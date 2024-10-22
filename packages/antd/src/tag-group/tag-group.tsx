import { type FC } from 'react';
import { Space, type SpaceProps, Tag } from 'antd';
import { fbaHooks } from '../fba-hooks/index.js';

type TagGroupDataItem = {
  label: string;
  value: string | number;
  color?: string;
};

export type TagGroupProps = {
  dataList: TagGroupDataItem[];
  /**
   * 颜色配置数据，例如：{ 1:'red', 2: 'blue'} key值与 dataList中value相同
   */
  colorMap?: Record<string, string>;
  spaceProps?: SpaceProps;
};

/**
 * Tag 列表显示
 */
export const TagGroup: FC<TagGroupProps> = (props) => {
  const theme = fbaHooks.useThemeToken();
  return (
    <Space wrap size={5} {...props.spaceProps}>
      {props.dataList.map((item, index) => {
        const color =
          item.color || props.colorMap?.[item.value] || theme.colorPrimary;
        return (
          <Tag color={color} key={index}>
            {item.label}
          </Tag>
        );
      })}
    </Space>
  );
};
