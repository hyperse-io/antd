import { CSSProperties, Fragment } from 'react';
import { Collapse } from 'antd';
import { DragOutlined } from '@ant-design/icons';
import { classNames } from '@dimjs/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  DragCollapseItem,
  DragCollapseItemKey,
  DragCollapseProps,
} from './types.js';
type SortableItemProps = {
  openKeys: DragCollapseItemKey[];
  style?: CSSProperties;
  item: DragCollapseItem;
  collapsible?: DragCollapseProps['collapsible'];
  expandIcon?: DragCollapseProps['expandIcon'];
  expandIconPosition?: DragCollapseProps['expandIconPosition'];
  size?: DragCollapseProps['size'];
  dragIcon?: DragCollapseProps['dragIcon'];
  hideDragIcon?: DragCollapseProps['hideDragIcon'];
  onChange: (activeKey: DragCollapseItemKey) => void;
  isGray?: boolean;
  className?: string;
  isLast?: boolean;
};
export function SortableItem(props: SortableItemProps) {
  const { listeners, setNodeRef, transform, transition } = useSortable({
    id: props.item.key,
  });

  const header = (item: DragCollapseItem) => {
    const dragIcon = props.dragIcon ? props.dragIcon : <DragOutlined />;
    return props.hideDragIcon ? (
      item.content
    ) : (
      <Fragment>
        <span className="dc-drag-trigger" {...listeners}>
          {dragIcon}
        </span>
        <span className="dc-drag-header-content">{item.content}</span>
      </Fragment>
    );
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    ...props.style,
  };

  const isActive = props.openKeys.includes(props.item.key);
  const cname = classNames(
    'drag-collapse',
    { 'drag-collapse-grap': props.isGray, 'drag-collapse-last': props.isLast },
    props.className
  );
  return (
    <Collapse
      activeKey={isActive ? props.item.key : undefined}
      accordion
      className={cname}
      collapsible={props.collapsible}
      expandIcon={props.expandIcon}
      expandIconPosition={props.expandIconPosition}
      size={props.size}
      onChange={props.onChange?.bind(null, props.item.key)}
      style={{ ...style }}
      ref={setNodeRef}
    >
      <Collapse.Panel header={header(props.item)} key={props.item.key}>
        {props.item.content}
      </Collapse.Panel>
    </Collapse>
  );
}
