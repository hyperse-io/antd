import { CSSProperties, Fragment } from 'react';
import { Collapse, Form, FormListFieldData, FormListOperation } from 'antd';
import { DragOutlined } from '@ant-design/icons';
import { classNames } from '@dimjs/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toArray } from '@hyperse/utils';
import { DragCollapseFormListProps } from './types.js';
export type SortableItemProps = {
  formListFieldData: FormListFieldData;
  formListOperate: FormListOperation;
  onChange: (activeKey: number | string) => void;
  header: DragCollapseFormListProps['header'];
  content: DragCollapseFormListProps['content'];
  collapsible?: DragCollapseFormListProps['collapsible'];
  expandIcon?: DragCollapseFormListProps['expandIcon'];
  expandIconPosition?: DragCollapseFormListProps['expandIconPosition'];
  size?: DragCollapseFormListProps['size'];
  dragIcon?: DragCollapseFormListProps['dragIcon'];
  getItemDragDisabled?: DragCollapseFormListProps['getItemDragDisabled'];
  dragDisabled?: DragCollapseFormListProps['dragDisabled'];
  isGray?: boolean;
  isLast?: boolean;
  className?: string;
  style?: CSSProperties;
  uid: string | number;
  isActive?: boolean;
  headerStyle?: CSSProperties;
  index: number;
  isOverlay?: boolean;
  formStageCompleteName: Array<string | number>;
};
export function SortableItem(props: SortableItemProps) {
  const form = Form.useFormInstance();
  const isDisabled = props.isOverlay
    ? false
    : props.getItemDragDisabled?.(props.uid, props.index);
  const { listeners, setNodeRef, transform, transition } = useSortable({
    id: props.uid,
    disabled: isDisabled,
  });

  const header = () => {
    const dragIcon = props.dragIcon ? props.dragIcon : <DragOutlined />;
    const headerContent = props.header({
      formListFieldData: props.formListFieldData,
      operation: props.formListOperate,
      uid: props.uid,
      formStageCompleteName: props.formStageCompleteName,
      getInsideFormItemName: (key: string | string[]) => {
        return [props.formListFieldData.name, ...toArray(key)] as (
          | string
          | number
        )[];
      },
      getInsideFormItemData: () => {
        return form.getFieldValue(props.formStageCompleteName) || {};
      },
      index: props.index,
    });
    return props.dragDisabled ? (
      headerContent
    ) : (
      <Fragment>
        <span className="dc-drag-trigger" {...listeners}>
          {dragIcon}
        </span>
        <span className="dc-drag-header-content" style={props.headerStyle}>
          {headerContent}
        </span>
      </Fragment>
    );
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...props.style,
  };

  const cname = classNames(
    'drag-collapse',
    {
      'drag-collapse-grap': props.isGray,
      'drag-collapse-last': props.isLast,
      'drag-collapse-drag-disabled': isDisabled,
    },
    props.className
  );
  return (
    <Collapse
      activeKey={props.isActive ? props.uid : undefined}
      accordion
      className={cname}
      collapsible={props.collapsible}
      expandIcon={props.expandIcon}
      expandIconPosition={props.expandIconPosition}
      size={props.size}
      onChange={props.onChange?.bind(null, props.uid)}
      style={{ ...style }}
      ref={setNodeRef}
    >
      <Collapse.Panel header={header()} key={props.uid}>
        {props.content({
          formListFieldData: props.formListFieldData,
          operation: props.formListOperate,
          uid: props.uid,
          formStageCompleteName: props.formStageCompleteName,
          getInsideFormItemName: (key: string | string[]) => {
            return [props.formListFieldData.name, ...toArray(key)] as (
              | string
              | number
            )[];
          },
          getInsideFormItemData: () => {
            return form.getFieldValue(props.formStageCompleteName) || {};
          },
          index: props.index,
        })}
      </Collapse.Panel>
    </Collapse>
  );
}
