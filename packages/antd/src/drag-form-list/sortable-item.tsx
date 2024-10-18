import { type CSSProperties, Fragment, type ReactElement } from 'react';
import { Form, type FormListFieldData, type FormListOperation } from 'antd';
import { DragOutlined } from '@ant-design/icons';
import { classNames } from '@dimjs/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toArray } from '@hyperse/utils';
import { hooks } from '@wove/react';
import {
  type DragFormListContentProps,
  type DragFormListProps,
} from './types.js';
export type SortableItemProps = {
  formListFieldData: FormListFieldData;
  formListOperate: FormListOperation;
  dragIcon?: DragFormListProps['dragIcon'];
  getItemDragDisabled?: DragFormListProps['getItemDragDisabled'];
  dragDisabled?: DragFormListProps['dragDisabled'];
  isGray?: boolean;
  className?: string;
  style?: CSSProperties;
  uid: string | number;
  index: number;
  isOverlay?: boolean;
  formStageCompleteName: (string | number)[];
  children: (data: DragFormListContentProps) => ReactElement;
  prevCompleteName: (string | number)[];
  uidFieldName: string;
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

  const dragIconRender = hooks.useCallbackRef(() => {
    const dragIcon = props.dragIcon ? props.dragIcon : <DragOutlined />;
    return props.dragDisabled ? (
      <Fragment />
    ) : (
      <span className="drag-form-list-item-trigger" {...listeners}>
        <span>{dragIcon}</span>
      </span>
    );
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...props.style,
  };

  const cname = classNames(
    'drag-form-list-item',
    {
      'drag-form-list-item-grap': props.isGray,
      'drag-form-list-item-disabled': isDisabled,
    },
    props.className
  );
  return (
    <div style={{ ...style }} ref={setNodeRef} className={cname}>
      <Form.Item noStyle>{dragIconRender()}</Form.Item>
      <div className="drag-form-list-item-content">
        {props.children({
          formListFieldData: props.formListFieldData,
          operation: props.formListOperate,
          formStageCompleteName: props.formStageCompleteName,
          index: props.index,
          getInsideFormItemName: (key: string | string[]) => {
            return [props.formListFieldData.name, ...toArray<string>(key)];
          },
          getInsideFormItemData: () => {
            return form.getFieldValue(props.formStageCompleteName) || {};
          },
          prevCompleteName: props.prevCompleteName,
          uidKey: props.uidFieldName,
        })}
      </div>
    </div>
  );
}
