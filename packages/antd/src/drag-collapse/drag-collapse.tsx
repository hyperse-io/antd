import { useState } from 'react';
import { arrayRemove, classNames } from '@dimjs/utils';
import { closestCenter, DndContext, DragOverlay } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { toArray } from '@hyperse/utils';
import { hooks } from '@wove/react';
import { fbaHooks } from '../fba-hooks/index.js';
import { SortableItem } from './sortable-item.jsx';
import { type DragCollapseItemKey, type DragCollapseProps } from './types.js';
import './style.less';

/**
 * 可拖拽 折叠面板
 * @param props
 * @returns
 */
export const DragCollapse = (props: DragCollapseProps) => {
  const [dragActiveId, setDragActiveId] = useState<string | number>();
  const [openKeys, setOpenKeys] = useState<DragCollapseItemKey[]>([]);

  fbaHooks.useEffectCustom(() => {
    const defaultActiveKeys = toArray<string | number>(props.defaultActiveKey);
    if (!props.activeKey && defaultActiveKeys.length > 0) {
      setOpenKeys(defaultActiveKeys);
    } else {
      setOpenKeys(toArray(props.activeKey));
    }
  }, []);

  hooks.useUpdateEffect(() => {
    setOpenKeys(toArray(props.activeKey));
  }, [props.activeKey]);

  const onChange = hooks.useCallbackRef((key: DragCollapseItemKey) => {
    let openKeysNew: DragCollapseItemKey[] = [];
    if (props.accordion) {
      if (openKeys[0] && openKeys[0] === key) {
        openKeysNew = [];
      } else {
        openKeysNew = [key];
      }
    } else {
      const has = openKeys.includes(key);
      if (has) {
        arrayRemove(openKeys, key);
        openKeysNew = [...openKeys];
      } else {
        openKeysNew = openKeys.concat(key);
      }
    }
    setOpenKeys(openKeysNew);
    if (props.accordion) {
      props.onChange?.(openKeysNew.length ? openKeysNew[0] : undefined);
    } else {
      props.onChange?.(openKeysNew.length ? openKeysNew : undefined);
    }
  });

  function handleDragStart(event) {
    const { active } = event;
    setDragActiveId(active.id);
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = props.items.findIndex((item) => item.key === active.id);
      const newIndex = props.items.findIndex((item) => item.key === over.id);
      const newList = arrayMove(props.items, oldIndex, newIndex);
      props.onDropChange(newList);
    }
    setDragActiveId(undefined);
  }

  return (
    <div
      className={classNames('drag-collapse-wrapper', props.className)}
      style={props.style}
    >
      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={props.items.map((item) => item.key)}
          strategy={verticalListSortingStrategy}
        >
          {props.items.map((item, index) => (
            <SortableItem
              key={item.key}
              item={item}
              openKeys={openKeys}
              collapsible={props.collapsible}
              expandIcon={props.expandIcon}
              expandIconPosition={props.expandIconPosition}
              size={props.size}
              dragIcon={props.dragIcon}
              hideDragIcon={props.hideDragIcon}
              onChange={onChange}
              isGray={item.key === dragActiveId}
              isLast={index === props.items.length - 1}
            />
          ))}
        </SortableContext>

        <DragOverlay dropAnimation={{ duration: 0 }}>
          {dragActiveId ? (
            <SortableItem
              className="overlay-sortable-item"
              key={dragActiveId}
              item={props.items.filter((item) => item.key === dragActiveId)[0]}
              openKeys={openKeys}
              collapsible={props.collapsible}
              expandIcon={props.expandIcon}
              expandIconPosition={props.expandIconPosition}
              size={props.size}
              dragIcon={props.dragIcon}
              hideDragIcon={props.hideDragIcon}
              onChange={onChange}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
