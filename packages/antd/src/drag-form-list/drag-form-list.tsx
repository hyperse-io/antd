import { Fragment, type ReactElement, useMemo, useRef, useState } from 'react';
import { Empty, Form, type FormListFieldData } from 'antd';
import { classNames } from '@dimjs/utils';
import { closestCenter, DndContext, DragOverlay } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { getUuid, type TAny, toArray, type TPlainObject } from '@hyperse/utils';
import { hooks } from '@wove/react';
import { BlockLayout } from '../block-layout/index.js';
import { ButtonWrapper } from '../button-wrapper/index.js';
import { type FormItemHorizontalUnionProps } from '../form-item-group/horizontal-union/index.jsx';
import { FormItemGroup } from '../form-item-group/index.js';
import { TextSymbolWrapper } from '../text-symbol-wrapper/index.js';
import { SortableItem } from './sortable-item.jsx';
import { type DragFormListProps } from './types.js';
import './style.less';

type FormListChildrenWrapperProps = {
  wrapper?: DragFormListProps['formListChildrenWrapper'];

  children: ReactElement;
};
const FormListChildrenWrapper = (props: FormListChildrenWrapperProps) => {
  if (props.wrapper) return props.wrapper({ children: props.children });
  return props.children;
};

const FormListTitleRender = (props: {
  formListItemTitleList: DragFormListProps['formListItemTitleList'];
  formListItemTitleHProps?: DragFormListProps['formListItemTitleHorizontalUnionProps'];
  dragDisabled?: boolean;
}) => {
  const gap = props.formListItemTitleHProps?.gap;
  const innerList: FormItemHorizontalUnionProps['groupConfigList'] =
    props.dragDisabled
      ? []
      : [
          {
            width: 35,
            mainItem: (
              <div style={{ marginRight: gap === undefined ? -15 : -gap }} />
            ),
          },
        ];
  return (
    <FormItemGroup.HorizontalUnion
      {...props.formListItemTitleHProps}
      style={{ marginBottom: 10, ...props.formListItemTitleHProps?.style }}
      groupConfigList={innerList.concat(
        props.formListItemTitleList?.map((item) => {
          if (item.required) {
            return {
              width: item.width,
              mainItem: (
                <div style={{ textAlign: 'center' }}>
                  <TextSymbolWrapper text={item.title} symbolType="required" />
                </div>
              ),
            };
          }
          return {
            width: item.width,
            mainItem: <div style={{ textAlign: 'center' }}>{item.title}</div>,
          };
        }) || []
      )}
    />
  );
};

/**
 * 可拖拽FormList
 * ```
 * Demo: https://xx.xx.com/docs/admin/main/form/list
 * 1. FormList数组中必须要有唯一值字段，默认值字段名称uid，可通过uidFieldName自定义设置
 * 2. 通过 itemGap 设置FormList Item 之间间隙
 * ```
 */
export const DragFormList = (props: DragFormListProps) => {
  const stageCompleteName = [
    ...props.prevCompleteName,
    ...toArray(props.name),
  ] as Array<string | number>;
  const [dragActiveId, setDragActiveId] = useState<string | number>();
  const form = Form.useFormInstance();
  const formListOperationRef = useRef<FormListFieldData[]>([]);

  const uidFieldName = props.uidFieldName || 'uid';
  // 使用 useWatch 可确保FormList在变更后及时刷新
  const formListValue = Form.useWatch(stageCompleteName, form);

  const getUidValue = hooks.useCallbackRef((item) => {
    return item?.[uidFieldName] as string | number;
  });

  function handleDragStart(event) {
    const { active } = event;
    setDragActiveId(active.id);
  }

  const getItems = hooks.useCallbackRef(() => {
    /** 只能通过getFieldValue取值 */
    return (form.getFieldValue(stageCompleteName) || []) as TPlainObject[];
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
          name: props.name,
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

  const gapHalf = props.itemGap ? props.itemGap / 2 : 8;

  return (
    <BlockLayout
      className={classNames('drag-form-list', props.className)}
      style={props.style}
    >
      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Form.List name={props.name} rules={props.rules}>
          {(fields, operation, { errors }) => {
            formListOperationRef.current = fields;
            return (
              <div
                style={{
                  borderRadius: '6px',
                  border: errors?.length
                    ? '1px solid #ff4d4f'
                    : '1px solid transparent',
                }}
              >
                {props.formListItemTitleList?.length ? (
                  <FormListTitleRender
                    formListItemTitleList={props.formListItemTitleList}
                    formListItemTitleHProps={
                      props.formListItemTitleHorizontalUnionProps
                    }
                    dragDisabled={props.dragDisabled}
                  />
                ) : null}
                {!props.hiddenEmptyRender && !formListValue?.length ? (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    style={{ margin: '15px 0' }}
                  />
                ) : null}
                <Fragment>
                  <SortableContext
                    items={getItems().map((temp) => getUidValue(temp))}
                    strategy={verticalListSortingStrategy}
                  >
                    <Fragment>
                      <FormListChildrenWrapper
                        wrapper={props.formListChildrenWrapper}
                      >
                        <Fragment>
                          {fields.map((item, index) => {
                            const uid = getUidValue(getItems()[index]);
                            if (!uid) return null;
                            return (
                              <SortableItem
                                formListOperate={operation}
                                formListFieldData={item}
                                uid={uid}
                                key={`${uid}-${item.key}`}
                                dragIcon={props.dragIcon}
                                getItemDragDisabled={props.getItemDragDisabled}
                                dragDisabled={props.dragDisabled}
                                isGray={!!uid && uid === dragActiveId}
                                index={index}
                                formStageCompleteName={[
                                  ...stageCompleteName,
                                  item.name,
                                ]}
                                prevCompleteName={stageCompleteName}
                                uidFieldName={uidFieldName}
                                style={{
                                  ...props.itemStyle,
                                  padding: `${gapHalf}px 0 ${gapHalf}px 0`,
                                }}
                              >
                                {props.children}
                              </SortableItem>
                            );
                          })}
                        </Fragment>
                      </FormListChildrenWrapper>
                      {props.onCustomAddRowButton ? (
                        props.onCustomAddRowButton(operation)
                      ) : (
                        <ButtonWrapper
                          hidden={props.hiddenAddRowButton}
                          type="dashed"
                          block
                          onClick={() =>
                            operation.add({
                              [uidFieldName]: getUuid(),
                              ...props.getAddRowDefaultValues?.(),
                            })
                          }
                        >
                          添加
                        </ButtonWrapper>
                      )}
                    </Fragment>
                  </SortableContext>
                  <DragOverlay dropAnimation={{ duration: 0 }}>
                    {dragActiveId && dragOverlayItem ? (
                      <SortableItem
                        isOverlay={true}
                        uid={dragActiveId}
                        key={dragActiveId}
                        className="drag-form-list-overlay"
                        formListFieldData={dragOverlayItem}
                        dragIcon={props.dragIcon}
                        formListOperate={null as TAny}
                        index={0}
                        formStageCompleteName={[
                          ...stageCompleteName,
                          dragOverlayItem.name,
                        ]}
                        prevCompleteName={stageCompleteName}
                        uidFieldName={uidFieldName}
                      >
                        {props.children}
                      </SortableItem>
                    ) : null}
                  </DragOverlay>
                  <Form.ErrorList
                    errors={
                      errors?.length
                        ? [
                            <div
                              style={{ color: '#ff4d4f', padding: '5px' }}
                              key="0"
                            >
                              {errors}
                            </div>,
                          ]
                        : undefined
                    }
                  />
                </Fragment>
              </div>
            );
          }}
        </Form.List>
      </DndContext>
    </BlockLayout>
  );
};
