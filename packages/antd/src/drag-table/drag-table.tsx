import { type ReactElement, useEffect, useMemo, useState } from 'react';
import { Table, type TableProps } from 'antd';
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { type TAny, type TPlainObject } from '@hyperse/utils';
import { CtxProvider } from './context.js';
import { Row } from './row.jsx';

type DragTableProps = Omit<TableProps<TPlainObject>, 'dataSource'> & {
  /**
   * ```
   * 1. 可自定义拖拽图标
   * 2. dragIcon = false，可设置表格行拖拽
   * ```
   */
  dragIcon?: false | ReactElement;
  /** 表格数据唯一值字段Key，未填或者无法唯一，都不能拖拽能力 */
  uidFieldKey: string;
  dataSource?: TPlainObject[];
  /** 禁用拖拽 */
  disabledDrag?: boolean;
  /**
   * 拖拽结束事件
   * ```
   * dataSource: 拖拽完成后的数据源
   * dragData
   * 1. activeId 拖拽ID
   * 2. activeIndex 拖拽起始表格数组索引值
   * 3. overIndex 拖拽结束表格数组索引值
   * ```
   */
  onDragChange?: (
    dataSource: TPlainObject[],
    dragData: {
      activeId: string | number;
      activeIndex: number;
      overIndex: number;
    }
  ) => void;
};

/**
 * 可拖拽表格
 * ```
 * 1. 必须设置唯一值字段 uidFieldKey
 * 2. 如果拖拽显示异常，请检查 uidFieldKey 是否正确
 * 3. Table 参数 components.body.row 被组件内部使用
 * ```
 */
export const DragTable = (props: DragTableProps) => {
  const {
    dragIcon,
    uidFieldKey,
    columns,
    dataSource,
    onDragChange,
    disabledDrag,
    ...otherProps
  } = props;
  const [dataList, setDataList] = useState<TAny[]>([]);

  useEffect(() => {
    setDataList(dataSource || []);
  }, [dataSource]);

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      const activeIndex = dataList.findIndex(
        (i) => i[uidFieldKey] === active.id
      );
      const overIndex = dataList.findIndex((i) => i[uidFieldKey] === over?.id);
      const dataListNew = arrayMove(dataList, activeIndex, overIndex);
      setDataList([...dataListNew]);
      onDragChange?.(dataListNew, {
        activeId: active.id,
        activeIndex,
        overIndex,
      });
    }
  };

  const columnsList = useMemo(() => {
    if (dragIcon === false || props.disabledDrag) return columns;
    return [
      {
        key: 'sort',
        dataIndex: 'sort',
        align: 'center',
        width: 50,
      } as TAny,
    ].concat(columns || []);
  }, [columns, dragIcon, props.disabledDrag]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        // 当拖拽触发区域有其他点击事件时，需要延迟触发拖拽动作
        delay: dragIcon === false ? 150 : 0,
        tolerance: 0,
      },
    })
  );

  return (
    <CtxProvider value={{ dragIcon }}>
      <DndContext
        sensors={sensors}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={dataList.map((i) => i[uidFieldKey])}
          strategy={verticalListSortingStrategy}
        >
          <Table
            pagination={false}
            rowKey={uidFieldKey}
            bordered
            components={{
              ...otherProps.components,
              body: {
                ...otherProps.components?.body,
                row: disabledDrag ? undefined : Row,
              },
            }}
            {...otherProps}
            dataSource={dataList}
            columns={columnsList}
          />
        </SortableContext>
      </DndContext>
    </CtxProvider>
  );
};
