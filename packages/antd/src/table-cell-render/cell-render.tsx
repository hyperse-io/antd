import { Fragment, ReactElement } from 'react';
import { Badge, Space } from 'antd';
import { isEmpty, isObject, isPlainObject, isString } from '@dimjs/lang';
import { get } from '@dimjs/utils';
import {
  cutString,
  DateFormatType,
  hyperseDate,
  hypersePrice,
  isNumber,
  isUndefinedOrNull,
  TAny,
  TPlainObject,
} from '@hyperse/utils';
import { ButtonOperate, ButtonOperateProps } from '../button-operate/index.js';
import {
  TagListRender,
  TagListRenderProps,
  TagListRenderValue,
} from '../tag-list-render/tag-list.js';
import './style.less';
const tableColumnOperateRender = (
  options: (item: TAny, index: number) => ButtonOperateProps
) => {
  return (_value: string | number, record, index: number) => {
    const operateProps = options(record, index);
    return <ButtonOperate {...operateProps} />;
  };
};

const tableColumnDateRender = (
  dateFormatType?: DateFormatType,
  defaultValue?: string
) => {
  return (value: string | number) => {
    if (isEmpty(value) || value === '') return defaultValue;
    try {
      return hyperseDate.format(new Date(value), dateFormatType);
    } catch (_error) {
      return value || defaultValue;
    }
  };
};

const tableColumnIndexRender = (
  method?: () => { pageNo?: number; pageSize?: number }
) => {
  return (_value, _record, index: number) => {
    const { pageNo, pageSize } = method?.() || {};
    if (pageSize && pageNo) {
      return (pageNo - 1) * pageSize + index + 1;
    }
    return index + 1;
  };
};

const tableColumnSelectorRender = (
  selectorList: TagListRenderProps['dataList'],
  colorMap?: TagListRenderProps['colorMap'],
  options?: {
    /** 最大显示Tag数量，超出折叠隐藏 */
    maxShowCount?: number;
    /** 触发maxShowCount后，被折叠的内容是否显示完整tag，默认值：false */
    foldShowAllTag?: boolean;
  }
) => {
  return (value?: TAny) => {
    if (isUndefinedOrNull(value)) return null;
    return (
      <TagListRender
        dataList={selectorList}
        colorMap={colorMap}
        value={value}
        forceMatch={false}
        {...options}
      />
    );
  };
};

const tableColumnObjectRender = (key: string, defaultValue?: string) => {
  return (value?: TPlainObject) => {
    if (isPlainObject(value)) {
      const target = get<TPlainObject, string>(value || {}, key, defaultValue);
      if (!target) return '';
      if (isObject(target)) return JSON.stringify(target);
      return target;
    }
    return value || defaultValue;
  };
};

const tableColumnFen2yuanCellRender = (options?: {
  /** 是否显示分隔符，默认值：false */
  separator?: boolean;
  defaultValue?: string | number;
  /** 隐藏背景颜色 */
  hideBgColor?: boolean;
}) => {
  const className = options?.hideBgColor ? '' : 'table-fen-color';
  return (value?: string | number) => {
    if (isUndefinedOrNull(value) || value === '') {
      if (isUndefinedOrNull(options?.defaultValue)) return undefined;
      if (isNumber(options?.defaultValue as string | number)) {
        return (
          <span className={className}>
            {hypersePrice.format(options?.defaultValue)}
          </span>
        );
      }
      return <span className={className}>{options?.defaultValue}</span>;
    }
    if (!isNumber(value as number | string)) return value;
    const amount = hypersePrice.fen2yuan(value);
    return (
      <span className={className}>
        {hypersePrice.format(amount, options?.defaultValue, {
          separator: options?.separator || false,
        })}
      </span>
    );
  };
};

const tableColumnFen2wanCellRender = (options?: {
  /** 是否显示分隔符，默认值：false */
  separator?: boolean;
  defaultValue?: string | number;
  /** 隐藏背景颜色，默认：false */
  showBgColor?: boolean;
  /** 移除小数点后末尾零 */
  removeTailZero?: boolean;
}) => {
  const className = options?.showBgColor === true ? 'table-wan-color' : '';
  return (value?: string | number) => {
    if (isUndefinedOrNull(value) || value === '') {
      if (isUndefinedOrNull(options?.defaultValue)) return undefined;
      if (isNumber(options?.defaultValue as string | number)) {
        return (
          <span className={className}>
            {hypersePrice.format(options?.defaultValue)}
          </span>
        );
      }
      return <span className={className}>{options?.defaultValue}</span>;
    }
    if (!isNumber(value as number | string)) return value;
    const amount = hypersePrice.fen2wan(value);
    const amountNew = options?.removeTailZero
      ? hypersePrice.removeTailZero(amount, options?.defaultValue, {
          separator: options?.separator || false,
        })
      : hypersePrice.format(amount, options?.defaultValue, {
          separator: options?.separator || false,
        });
    return <span className={className}>{amountNew}</span>;
  };
};

type TableColumnIconRenderProps = {
  /** 额外内容，一般为Icon  */
  extra: ReactElement;
  extraPosition?: 'before' | 'after';
  onClick?: (e) => void;
  /** 是否显示原单元格数据，默认值：true */
  showData?: boolean;
  /** 溢出显示【...】, 最大长度（默认：20个字节） */
  showMaxNumber?: number;
  /** 未溢出显示【extra】配置，默认值：true  */
  notOverflowShowExtra?: boolean;
};

const tableColumnExtraContentRender = (
  handle: (item: TPlainObject) => TableColumnIconRenderProps
) => {
  return (value: TAny, item: TPlainObject) => {
    const options = handle?.(item);
    if (!options) return <Fragment>{value}</Fragment>;
    const showData = isUndefinedOrNull(options.showData)
      ? true
      : options.showData;
    const notOverflowShowExtra = isUndefinedOrNull(options.notOverflowShowExtra)
      ? true
      : options.notOverflowShowExtra;
    const showMaxNumber = isUndefinedOrNull(options.showMaxNumber)
      ? 10
      : (options.showMaxNumber as number);
    const extraPosition = options.extraPosition
      ? options.extraPosition
      : 'after';
    const renderValue = isString(value)
      ? cutString(value, showMaxNumber * 2)
      : value;

    if (options.extra && showData) {
      if (renderValue === value && !notOverflowShowExtra) {
        return value;
      }
      const spaceContent = [
        <span key="1">{renderValue}</span>,
        <Fragment key="2">{options.extra}</Fragment>,
      ];
      const spaceContentRender =
        extraPosition === 'before' ? spaceContent.reverse() : spaceContent;
      return (
        <Space
          onClick={options.onClick}
          style={{ cursor: options.onClick ? 'pointer' : undefined }}
          size={5}
        >
          {spaceContentRender.map((item, index) => {
            return <Fragment key={index}>{item}</Fragment>;
          })}
        </Space>
      );
    }
    return <span onClick={options.onClick}>{options.extra}</span>;
  };
};

const tableColumnBadgeRender = (
  selectorList: { label: string; value: TagListRenderValue; color?: string }[],
  colorMap?: Record<string | string, string>
) => {
  return (value?: TAny) => {
    if (!value) return null;
    const target = selectorList.find((item) => item.value === value);
    if (target)
      return (
        <Badge
          color={target?.color || colorMap?.[value] || 'rgba(0, 0, 0, 0.25)'}
          text={target?.label}
        />
      );
    return value;
  };
};

const tableColumnClickRender = (
  onClick: (record: TPlainObject, e) => void,
  defaultValue?: string
) => {
  return (value: TAny, record: TPlainObject) => {
    if (!value) return defaultValue;
    return <a onClick={onClick.bind(null, record)}>{value}</a>;
  };
};

export const tableCellRender = {
  /**
   * 表格单元格 拼接额外内容渲染
   * ```
   * 1. extra 额外内容
   * 2. showData 是否显示原单元格数据，默认值：true
   * 3. showMaxNumber 显示最大长度，作用于原单元格字符串数据
   *
   *
   * 结合table column render 使用
   * # 在单元格渲染文字右侧添加图标
   * render: tableCellRender.extraContentRender(() => {
   *   return {
   *     extra: <FullscreenOutlined />,
   *     onClick: () => { ... },
   *   };
   * }),
   * ```
   */
  extraContentRender: tableColumnExtraContentRender,
  /**
   * table 序号展示，如果存在pageSize、pageNo参数可分页展示累加序号，否则每页都从1开始
   * ```
   *  render: tableCellRender.serialNumberCell(() => {
   *    return { pageNo,pageSize };
   *  }),
   * ```
   */
  serialNumberCell: tableColumnIndexRender,
  /**
   * 表格日期格式数据渲染，默认格式：YYYY-MM-DD
   * ```
   * 独立使用
   * tableCellRender.dateCell('YYYY-MM-DD hh:mm:ss')(value)
   *
   * 结合table column render 使用
   * render: tableCellRender.dateCell('YYYY-MM-DD hh:mm:ss')
   * render: (value) => {
   *   return tableCellRender.dateCell('YYYY-MM-DD')(value);
   * }
   * ```
   */
  dateCell: tableColumnDateRender,
  /**
   * table操作栏目渲染
   * ```
   * 使用方式
   * tableCellRender.operateCell((item) => ({
   *   operateList: [
   *     {
   *       text: '编辑',
   *       onClick: onItemOperate.bind(null, 'update', item),
   *     },
   *     {
   *       text: '删除',
   *       needConfirm: true,
   *       confirmMessage: '确定要删除吗？',
   *       onClick: onItemOperate.bind(null, 'delete', item),
   *     },
   *   ],
   * }))
   * ```
   */
  operateCell: tableColumnOperateRender,
  /**
   * Tag格式数据渲染，可结合枚举定义数据
   * ```
   * 独立使用
   * tableCellRender.selectorCell([{ label: '已开启', value: 1 }])(value)
   * tableCellRender.selectorCell([{ label: '已开启', value: 1, color: '#108ee9' }])(value)
   * tableCellRender.selectorCell([{ label: '已开启', value: 1 }], { 1: '#108ee9' })(value)
   * tableCellRender.selectorCell(taskTypeEnumList)(value);
   *
   *
   * 结合table column render 使用
   * render: tableCellRender.selectorCell(taskTypeEnumList);
   * render: tableCellRender.selectorCell([{ label: '已开启', value: 1 ]);
   * render: (value) => {
   *   return tableCellRender.selectorCell([{ label: '已开启', value: 1 ])(value);
   * }
   *
   * 其中value值可以是单个值或者数组；例如：'1' 或者 ['1', '2']
   * ```
   */
  selectorCell: tableColumnSelectorRender,
  /**
   * 单元格对象数据处理，支持多级处理
   * ```
   * tableCellRender.objectCell('a.b.c')
   * ```
   */
  objectCell: tableColumnObjectRender,
  /**
   * 分金额展示，入参分，显示元（默认添加千分位）
   * ```
   * 可配置
   * 1. separator：是否显示千分位分隔符，默认值：false
   * 2. defaultValue：当值为空默认展示
   * 3. hideBgColor：隐藏背景颜色
   *
   * 例如：
   * fen2yuanCell()(100090) => 1000.90
   * fen2yuanCell({separator: true})(100090) => 1,000.90
   * fen2yuanCell()('abc') => abc
   * fen2yuanCell({defaultValue: '--'})('') =>  --
   * fen2yuanCell()('') => undefined
   * fen2yuanCell({ defaultValue: 0 })('') => 0.00
   * ```
   */
  fen2yuanCell: tableColumnFen2yuanCellRender,
  /**
   * 分金额展示，入参分，显示万元（默认添加千分位）
   * ```
   * 可配置
   * 1. separator：是否显示千分位分隔符，默认值：false
   * 2. defaultValue：当值为空默认展示
   * 3. showBgColor：隐藏背景颜色
   * 4. removeTailZero：移除小数点后末尾零
   *
   * 例如：
   * fen2yuanCell()(1000900000) => 1000.90
   * fen2yuanCell({separator: true})(1000900000) => 1,000.90
   * fen2yuanCell()('abc') => abc
   * fen2yuanCell({defaultValue: '--'})('') =>  --
   * fen2yuanCell()('') => undefined
   * fen2yuanCell({ defaultValue: 0 })('') => 0.00
   * ```
   */
  fen2wanCell: tableColumnFen2wanCellRender,
  /**
   * 单元格徽标展示数据
   * ```
   * 1. badge 默认颜色：灰色rgba(0, 0, 0, 0.25)
   *
   * 独立使用
   * tableCellRender.badgeCell([{ label: '已开启', value: 1 ])(value)
   * tableCellRender.badgeCell([{ label: '已开启', value: 1, color: '#108ee9' }])(value)
   * tableCellRender.badgeCell([{ label: '已开启', value: 1 }], { 1: '#108ee9' })(value)
   *
   * 结合table column render 使用
   * render: tableCellRender.badgeCell([{ label: '已开启', value: 1 ])
   * render: (value) => {
   *   return tableCellRender.badgeCell([{ label: '已开启', value: 1 ])(value)
   * }
   * ```
   */
  badgeCell: tableColumnBadgeRender,
  /**
   * 单元格点击事件
   * ```
   * 独立使用
   * tableCellRender.clickCell(onClick)(value, record)
   *
   * 结合table column render 使用
   * render: tableCellRender.clickCell(onClick)
   * render: (value, record) => {
   *   return tableCellRender.clickCell(onClick)(value, record)
   * }
   * ```
   */
  clickCell: tableColumnClickRender,
};
