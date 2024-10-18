import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export const TableTr = (props) => {
  const { listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: props['data-row-key'],
    });

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Transform.toString(transform && { ...transform, scaleY: 1 }),
    transition,
    cursor: 'move',
    ...(isDragging
      ? {
          position: 'relative',
          zIndex: 9999,
          boxShadow: ' 0px 0px 12px 4px rgba(34, 33, 81, 0.1)',
        }
      : {}),
  };

  return <tr {...props} ref={setNodeRef} style={style} {...listeners} />;
};
