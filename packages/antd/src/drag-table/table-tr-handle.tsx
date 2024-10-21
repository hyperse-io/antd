import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
} from 'react';
import { type RowProps } from 'antd';
import { DragOutlined } from '@ant-design/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { noop } from '@hyperse/utils';
import { IconWrapper } from '../icon-wrapper/index.js';
type TableTrHandleProps = RowProps & {
  dragIcon?: false | ReactElement;
};
export const TableTrHandle = (props: TableTrHandleProps) => {
  const { dragIcon, ...innerProps } = props;
  const rowId = innerProps['data-row-key'];
  const {
    setActivatorNodeRef,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: rowId,
  });

  if (!rowId) {
    return <tr {...innerProps} />;
  }
  const style: React.CSSProperties = {
    ...innerProps.style,
    transform: CSS.Transform.toString(transform && { ...transform, scaleY: 1 }),
    transition,
    cursor: dragIcon === false ? 'move' : undefined,
    ...(isDragging
      ? {
          position: 'relative',
          zIndex: 9999,
          boxShadow: ' 0px 0px 12px 4px rgba(34, 33, 81, 0.1)',
          backgroundColor: 'var(--block-bg-color)',
        }
      : {}),
  };
  const iconElement = isValidElement(dragIcon) ? dragIcon : <DragOutlined />;
  return (
    <tr {...innerProps} ref={setNodeRef} style={style}>
      {Children.map(props.children, (child) => {
        if ((child as React.ReactElement).key === 'sort') {
          return cloneElement(child as React.ReactElement, {
            children: (
              <span
                ref={setActivatorNodeRef}
                style={{
                  touchAction: 'none',
                  cursor: 'move',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  display: 'inline-flex',
                }}
                {...listeners}
              >
                <IconWrapper
                  style={{
                    touchAction: 'none',
                    cursor: 'move',
                    padding: '1px 0px',
                    margin: 0,
                    justifyContent: 'center',
                    color: '#787878',
                  }}
                  icon={iconElement}
                  onClick={noop}
                  size="small"
                />
              </span>
            ),
          });
        }
        return child;
      })}
    </tr>
  );
};
