import { Children, cloneElement, type ReactElement } from 'react';
import { type RowProps } from 'antd';
import { DragOutlined } from '@ant-design/icons';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { isUndefinedOrNull, noop } from '@hyperse/utils';
import { IconWrapper } from '../icon-wrapper/icon-wrapper.jsx';

type TableTrHandleProps = RowProps & {
  dragIcon?: ReactElement;
};
export const TableTrHandle = (props: TableTrHandleProps) => {
  const { dragIcon, ...innerProps } = props;
  const rowId = innerProps['data-row-key'] as number;

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

  if (isUndefinedOrNull(rowId)) {
    return <tr {...innerProps} />;
  }
  const style: React.CSSProperties = {
    ...innerProps.style,
    transform: CSS.Transform.toString(transform && { ...transform, scaleY: 1 }),
    transition,
    cursor: 'move',
    ...(isDragging
      ? {
          position: 'relative',
          zIndex: 9999,
          boxShadow: ' 0px 0px 12px 4px rgba(34, 33, 81, 0.1)',
          backgroundColor: 'var(--block-bg-color)',
        }
      : {}),
  };
  const iconElement = dragIcon || <DragOutlined />;
  return (
    <tr {...innerProps} ref={setNodeRef} style={style} key={rowId}>
      {Children.map(props.children, (child) => {
        if ((child as React.ReactElement).key === '__sort') {
          return cloneElement(child as React.ReactElement, {
            children: (
              <span
                ref={setActivatorNodeRef}
                style={{
                  touchAction: 'none',
                  cursor: 'move',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
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
