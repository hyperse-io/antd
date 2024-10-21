import { type ReactElement } from 'react';
import { Form } from 'antd';
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
import { type TPlainObject } from '@hyperse/utils';
import {
  EditableTable,
  EditableTableColumn,
  EditableTableProps,
} from '../editable-table/index.js';
import { CtxProvider } from './context.js';
import { Row } from './row.jsx';

export type DragEditableTableProps = EditableTableProps & {
  /**
   * 拖拽图标自定义，默认使用 DragOutlined 图标
   */
  dragIcon?: ReactElement;

  /** 禁用拖拽 */
  disabledDrag?: boolean;
  /**
   * 表格数据唯一值字段Key
   * ```
   * ```
   */
  uidFieldKey: string;
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
 * 可拖拽编辑表格
 * ```
 * 1. 表格数据必须要有唯一值字段，通过参数 uidFieldKey 告诉组件
 * 2. Table 参数 components.body.row 被组件内部使用
 * ```
 */
export const DragEditableTable = (props: DragEditableTableProps) => {
  const { dragIcon, uidFieldKey, onDragChange, disabledDrag, ...otherProps } =
    props;
  const form = Form.useFormInstance();
  const dataList = Form.useWatch(
    props.completeName ? props.completeName : props.name,
    form
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        // 当拖拽触发区域有其他点击事件时，需要延迟触发拖拽动作
        delay: 0,
        tolerance: 0,
      },
    })
  );

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      const activeIndex = dataList.findIndex(
        (i) => i[uidFieldKey] === active.id
      );
      const overIndex = dataList.findIndex((i) => i[uidFieldKey] === over?.id);
      const dataListNew = arrayMove(dataList, activeIndex, overIndex);
      form.setFields([
        {
          name: props.completeName ? props.completeName : props.name,
          value: dataListNew,
        },
      ]);
      onDragChange?.(dataListNew as TPlainObject[], {
        activeId: active.id,
        activeIndex,
        overIndex,
      });
    }
  };

  const columns: EditableTableColumn[] = disabledDrag
    ? otherProps.columns
    : [
        {
          dataIndex: '__sort',
          width: 40,
          key: '__sort',
          align: 'center',
        } as EditableTableColumn,
      ].concat(otherProps.columns || []);

  return (
    <CtxProvider
      value={{
        dragIcon,
        uidFieldKey,
      }}
    >
      <DndContext
        sensors={sensors}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={dataList?.map((i) => i[uidFieldKey]) || []}
          strategy={verticalListSortingStrategy}
        >
          <EditableTable
            {...otherProps}
            uidFieldKey={uidFieldKey}
            columns={columns}
            tableProps={{
              ...otherProps.tableProps,
              components: {
                ...otherProps.tableProps?.components,
                body: {
                  ...otherProps.tableProps?.components?.body,
                  row: disabledDrag ? undefined : Row,
                },
              },
            }}
          />
        </SortableContext>
      </DndContext>
    </CtxProvider>
  );
};
