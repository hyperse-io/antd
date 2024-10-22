import { type FC, Fragment, useMemo } from 'react';
import { Popover, Tag } from 'antd';
import { isUndefinedOrNull, toArray, valueIsEqual } from '@hyperse/utils';

export type TagListRenderValue = string | number | boolean;
export type TagListRenderDataItem = {
  label: string;
  value: TagListRenderValue;
  color?: string;
};

export type TagListRenderProps = {
  dataList: TagListRenderDataItem[];
  /** 颜色配置数据，例如：{ 1:'red', 2: 'blue'} key值与 dataList中value相同 */
  colorMap?: Record<string | number, string>;
  value?: TagListRenderValue | TagListRenderValue[];
  /** 是否强制匹配，默认值false */
  forceMatch?: boolean;
  /** 最大显示Tag数量，超出折叠隐藏 */
  maxShowCount?: number;
  /** 触发maxShowCount后，被折叠的内容是否显示完整tag，默认值：false */
  foldShowAllTag?: boolean;
  /** 所有tag背景匹配此颜色，在colorMap为空、dataList中未配置color的情况下有效果 */
  tagColor?: string;
};

/**
 * 在列表数据dataList中通过value匹配数据，以Tag形式展示
 * ```
 *  1. forceMatch: 是否强制匹配（默认值false）
 *     - false: 匹配不到显示value值，
 *     - true：匹配不到不显示
 *  2. value 与 dataList中label、value任一相等，都可匹配
 *
 *  用法1：
 *  <TagListRender
 *    dataList=[{ label: '启用', value: 1 }]
 *    colorMap={{ 1:'red', 2: 'blue'}}
 *    value={1} />
 *  =>
 *  <Tag color={'red'}>启用</Tag>
 *
 *  用法2
 *  <TagListRender
 *    dataList=[{ label: '启用', value: 1. color: 'red' }]
 *    value="启用" />
 *  =>
 *  <Tag color={'red'}>启用</Tag>
 * ```
 */
export const TagListRender: FC<TagListRenderProps> = (props) => {
  const valueList = toArray<TagListRenderValue>(props.value);
  const maxShowCount = props.maxShowCount || 0;
  const tagList = useMemo(() => {
    if (isUndefinedOrNull(props.value)) {
      return [];
    }
    return valueList
      .map((value) => {
        const target = props.dataList?.find(
          (item) => valueIsEqual(item.value, value) || item.label === value
        );
        if (target) {
          return {
            label: target.label || target.value,
            color: props.colorMap?.[String(target.value)] || target.color,
            value: value,
          };
        }
        if (props.forceMatch) {
          return undefined;
        }
        return { label: `${value}`, color: undefined, value: value };
      })
      .filter(Boolean) as TagListRenderDataItem[];
  }, [
    props.colorMap,
    props.dataList,
    props.forceMatch,
    props.value,
    valueList,
  ]);

  if (tagList.length === 0) {
    return <Fragment>{props.value}</Fragment>;
  }

  const hasColor = tagList.find((item) => !!item?.color);

  const newTagList = tagList.slice(0, maxShowCount || tagList.length);

  const popoverTagList =
    newTagList.length < tagList.length
      ? props.foldShowAllTag
        ? tagList
        : tagList.slice(maxShowCount, tagList.length)
      : [];

  if (hasColor || popoverTagList.length > 0) {
    return (
      <Fragment>
        {newTagList.map((item, index) => {
          return (
            <Tag
              color={item.color}
              style={
                index === newTagList.length - 1
                  ? { margin: '0' }
                  : { marginRight: 5 }
              }
              key={index}
            >
              {item.label}
            </Tag>
          );
        })}
        {popoverTagList.length > 0 ? (
          <Popover
            content={
              <TagListRender
                {...props}
                value={popoverTagList.map((item) => item.value)}
                dataList={popoverTagList}
                maxShowCount={undefined}
              />
            }
          >
            <Tag color="blue" style={{ marginLeft: 5, cursor: 'pointer' }}>
              ...
            </Tag>
          </Popover>
        ) : null}
      </Fragment>
    );
  }

  return <Fragment>{tagList.map((item) => item.label).join(',')}</Fragment>;
};

TagListRender.defaultProps = {
  forceMatch: false,
};
