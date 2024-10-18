import { Fragment, useMemo, useRef, useState } from 'react';
import { Form, FormListFieldData } from 'antd';
import { arrayRemove, classNames } from '@dimjs/utils';
import { closestCenter, DndContext, DragOverlay } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { TAny, toArray, TPlainObject } from '@hyperse/utils';
import { hooks } from '@wove/react';
import { fbaHooks } from '../fba-hooks/index.js';
import { SortableItem } from './sortable-item.js';
import { DragCollapseFormListProps } from './types.js';
import './style.less';

/**
 * 可拖拽 折叠面板+FormList
 * ```
 * 1. FormList数组中必须要有唯一值字段，默认值字段名称uid，可通过uidFieldName自定义设置名称
 * ```
 */
export const DragCollapseFormList = (props: DragCollapseFormListProps) => {
  const [dragActiveId, setDragActiveId] = useState<string | number>();
  const [openKeys, setOpenKeys] = useState<(number | string)[]>([]);
  const form = Form.useFormInstance();
  const formListOperationRef = useRef<FormListFieldData[]>([]);

  const formListValue = Form.useWatch(props.formListName, form);

  const getUidValue = hooks.useCallbackRef((item) => {
    return item?.[props.uidFieldName || 'uid'] as string | number;
  });

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

  const onChange = (key: number | string) => {
    let openKeysNew: (number | string)[] = [];
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
  };

  function handleDragStart(event) {
    const { active } = event;
    setDragActiveId(active.id);
  }

  const getItems = hooks.useCallbackRef(() => {
    return (form.getFieldValue(props.formListName) || []) as TPlainObject[];
  });

  function handleDragEnd(event) {
    const { active, over } = event;
    const items = getItems();
    if (active.id !== over.id) {
      const oldIndex = items.findIndex(
        (item) => getUidValue(item) === active.id
      );
      const newIndex = items.findIndex((item) => getUidValue(item) === over.id);
      const newList = arrayMove<TPlainObject>(items, oldIndex, newIndex);
      form.setFields([
        {
          name: props.formListName,
          value: newList,
        },
      ]);
      props.onDropChange?.(newList);
    }
    setDragActiveId(undefined);
  }

  const dragOverlayItem = useMemo(() => {
    if (!dragActiveId) return undefined;
    const items = getItems();
    const targetIndex = items.findIndex(
      (item) => getUidValue(item) === dragActiveId
    );
    return formListOperationRef.current.find(
      (item) => item.name === targetIndex
    );
  }, [dragActiveId, getItems, getUidValue]);

  const cName = classNames(
    'drag-collapse-formlist-wrapper',
    { 'dcfw-isEmpty': toArray(formListValue).length === 0 },
    props.className
  );
  return (
    <div className={cName} style={props.style}>
      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Form.List name={props.formListName} rules={props.rules}>
          {(fields, operate) => {
            formListOperationRef.current = fields;
            return (
              <Fragment>
                <SortableContext
                  items={getItems().map((temp) => getUidValue(temp))}
                  strategy={verticalListSortingStrategy}
                >
                  <Fragment>
                    {fields.map((item, index) => {
                      const uid = getUidValue(getItems()[index]);
                      return (
                        <SortableItem
                          formListOperate={operate}
                          formListFieldData={item}
                          uid={uid}
                          key={`${uid}-${item.key}`}
                          isActive={openKeys.includes(uid)}
                          collapsible={props.collapsible}
                          expandIcon={props.expandIcon}
                          expandIconPosition={props.expandIconPosition}
                          size={props.size}
                          dragIcon={props.dragIcon}
                          getItemDragDisabled={props.getItemDragDisabled}
                          dragDisabled={props.dragDisabled}
                          onChange={onChange}
                          isGray={uid === dragActiveId}
                          isLast={index === getItems().length - 1}
                          header={props.header}
                          content={props.content}
                          index={index}
                          formStageCompleteName={[
                            ...toArray<string | number>(props.formListName),
                            item.name,
                          ]}
                        />
                      );
                    })}
                  </Fragment>
                </SortableContext>
                <DragOverlay dropAnimation={{ duration: 0 }}>
                  {dragActiveId && dragOverlayItem ? (
                    <SortableItem
                      isOverlay={true}
                      uid={dragActiveId}
                      key={dragActiveId}
                      className="overlay-sortable-item"
                      formListFieldData={dragOverlayItem}
                      isActive={openKeys.includes(dragActiveId)}
                      collapsible={props.collapsible}
                      expandIcon={props.expandIcon}
                      expandIconPosition={props.expandIconPosition}
                      size={props.size}
                      dragIcon={props.dragIcon}
                      onChange={onChange}
                      header={props.header}
                      content={props.content}
                      formListOperate={null as TAny}
                      index={0}
                      formStageCompleteName={[
                        ...toArray<string | number>(props.formListName),
                        dragOverlayItem.name,
                      ]}
                    />
                  ) : null}
                </DragOverlay>
              </Fragment>
            );
          }}
        </Form.List>
      </DndContext>
    </div>
  );
};
