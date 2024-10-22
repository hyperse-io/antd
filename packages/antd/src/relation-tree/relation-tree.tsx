import { Fragment, type ReactElement, useState } from 'react';
import { Empty, Form } from 'antd';
import { classNames } from '@dimjs/utils';
import { type TPlainObject } from '@hyperse/utils';
import { hooks } from '@wove/react';
import { fbaHooks } from '../fba-hooks/index.js';
import { Relation } from './compts/relation.jsx';
import { RelationGroupList } from './compts/relation-group-list.jsx';
import { RelationItem } from './compts/relation-item.jsx';
import {
  type RelationTreeProps,
  type TRelationTreeCustomData,
  type TRelationTreeData,
  type TRelationTreeRelationItem,
} from './type.js';
import { deleteLoop, filterSurplusData } from './utils.js';
import './style.less';

type TRelationTreeLoop = {
  dataSource: TRelationTreeData;
  relationItemRender: (
    data: TRelationTreeCustomData,
    extraData?: TPlainObject
  ) => ReactElement;
  className?: string;
  relationProps?: RelationTreeProps['relationProps'];
  onTagClick?: RelationTreeProps['onTagClick'];
};

type RelationItemRenderProps = TRelationTreeLoop & {
  relationItem: TRelationTreeRelationItem;
  index: number;
  onlyOne?: boolean;
};

const RelationItemRender = (props: RelationItemRenderProps) => {
  const relationItem = props.relationItem;
  const dataSource = props.dataSource;
  const index = props.index;

  if (
    relationItem.customData &&
    relationItem.children &&
    relationItem.children.length > 0
  ) {
    return (
      <Fragment key={relationItem.uid}>
        <RelationItem
          isFirst={index === 0}
          isLast={index === dataSource.relationList.length - 1}
          onlyOne={props.onlyOne}
        >
          {props.relationItemRender(
            relationItem.customData,
            relationItem.extraData
          )}
        </RelationItem>
        <RelationGroupList>
          {relationItem.children?.map((innerItem) => {
            return (
              <RelationTreeLoop
                dataSource={innerItem}
                relationItemRender={props.relationItemRender}
                key={innerItem.uid}
                relationProps={props.relationProps}
                onTagClick={props.onTagClick}
                className={props.className}
              />
            );
          })}
        </RelationGroupList>
      </Fragment>
    );
  }
  if (relationItem.children && relationItem.children.length > 0) {
    return (
      <div
        className={classNames('form-list-no-main-group', {
          'form-list-no-main-group': index === 0,
        })}
        key={relationItem.uid}
      >
        {relationItem.children?.map((innerItem) => {
          return (
            <RelationTreeLoop
              dataSource={innerItem}
              relationItemRender={props.relationItemRender}
              key={innerItem.uid}
              className={classNames('form-list-no-main', {
                'form-list-no-main-first': index === 0,
                'form-list-no-main-last':
                  index === dataSource.relationList.length - 1,
              })}
              relationProps={props.relationProps}
              onTagClick={props.onTagClick}
            />
          );
        })}
      </div>
    );
  }
  if (relationItem.customData) {
    return (
      <RelationItem
        key={relationItem.uid}
        isFirst={index === 0}
        isLast={index === dataSource.relationList.length - 1}
        onlyOne={props.onlyOne}
      >
        <Form component={false}>
          {props.relationItemRender(
            relationItem.customData,
            relationItem.extraData
          )}
        </Form>
      </RelationItem>
    );
  }
  return null;
};

const RelationTreeLoop = (props: TRelationTreeLoop) => {
  const dataSource = props.dataSource;
  const relationList = dataSource.relationList || [];

  const lastRelationItem = relationList[relationList.length - 1];
  const hasSolt2 =
    relationList.length > 0 &&
    lastRelationItem.customData &&
    lastRelationItem.children &&
    lastRelationItem.children.length > 0;
  const onlyOne = relationList.length == 1;
  // const onlyNoMainOne =
  //   onlyOne && !relationList[0].customData && toArray(relationList[0].children).length === 1;
  return (
    <Relation
      {...props.relationProps}
      tagName={dataSource.tagName}
      key={dataSource.uid}
      onlyOne={onlyOne}
      label={dataSource.label}
      className={props.className}
      onTagClick={() => {
        props.onTagClick?.(dataSource.uid, dataSource.extraData);
      }}
      solt1={() => {
        return (
          <Fragment>
            {relationList.map((relationItem, index) => {
              const flat = hasSolt2 && index === relationList.length - 1;
              return (
                <RelationItemRender
                  key={index}
                  dataSource={props.dataSource}
                  relationItemRender={props.relationItemRender}
                  relationProps={props.relationProps}
                  onTagClick={props.onTagClick}
                  relationItem={
                    flat
                      ? {
                          ...relationItem,
                          children: undefined,
                        }
                      : relationItem
                  }
                  index={index}
                  onlyOne={onlyOne}
                />
              );
            })}
          </Fragment>
        );
      }}
      solt2={() => {
        // 渲染最后一个relation item的children list数据
        if (
          hasSolt2 &&
          lastRelationItem.children &&
          lastRelationItem.children.length > 0
        ) {
          return (
            <RelationGroupList key={lastRelationItem.uid}>
              {lastRelationItem.children.map((innerItem) => {
                return (
                  <RelationTreeLoop
                    dataSource={innerItem}
                    relationItemRender={props.relationItemRender}
                    key={innerItem.uid}
                    relationProps={props.relationProps}
                    onTagClick={props.onTagClick}
                  />
                );
              })}
            </RelationGroupList>
          );
        }
        return null;
      }}
    ></Relation>
  );
};

export const RelationTree = (props: RelationTreeProps) => {
  const [dataSource, setDataSource] = useState<TRelationTreeData>();

  fbaHooks.useEffectCustom(() => {
    setDataSource(props.dataSource);
  }, [props.dataSource]);

  const onRelationItemContentChange = hooks.useCallbackRef(
    (data: TRelationTreeCustomData, name, value) => {
      if (data) {
        data[name] = value;
        props.onChange?.({ ...dataSource } as TRelationTreeData);
      }
    }
  );

  const getTargetRelationList = (
    relationTreeList: TRelationTreeData[],
    uid: string
  ) => {
    for (let index = 0; index < relationTreeList.length; index++) {
      const relationTree = relationTreeList[index];
      for (
        let innerIndex = 0;
        innerIndex < relationTree.relationList.length;
        innerIndex++
      ) {
        const element = relationTree.relationList[innerIndex];
        if (element.customData?.uid === uid) {
          return {
            relationTree,
            index: innerIndex,
            element: element,
          };
        } else if (element.children) {
          const result = getTargetRelationList(element.children, uid);
          if (result) {
            return result;
          }
        }
      }
    }
    return null;
  };

  const onAdd = hooks.useCallbackRef(
    (data: TRelationTreeCustomData, initialData: TRelationTreeRelationItem) => {
      if (!dataSource) return;
      const result = getTargetRelationList([dataSource], data.uid);
      if (result.relationTree?.relationList) {
        result.relationTree?.relationList.splice(
          (result.index as number) + 1,
          0,
          initialData
        );
        props.onChange?.(dataSource);
      }
    }
  );
  const addChildren = hooks.useCallbackRef(
    (data: TRelationTreeCustomData, initialData: TRelationTreeData) => {
      if (!dataSource) return;
      const result = getTargetRelationList([dataSource], data.uid);
      if (result.element) {
        result.element.children = (result.element.children || []).concat(
          initialData
        );
        props.onChange?.(dataSource);
      }
    }
  );

  const onRemove = hooks.useCallbackRef((uid: string) => {
    if (!dataSource) return;
    deleteLoop(dataSource, uid);
    if (dataSource['_delete']) {
      props.onChange?.(undefined);
    } else {
      filterSurplusData(dataSource);
      props.onChange?.(dataSource);
    }
  });

  if (!dataSource) return <Empty description="暂无数据"></Empty>;

  return (
    <div className={classNames('relation-tree', props.className)}>
      <RelationTreeLoop
        dataSource={dataSource}
        relationProps={props.relationProps}
        onTagClick={props.onTagClick}
        relationItemRender={(data, extraData) => {
          return props.children(
            data,
            {
              add: onAdd,
              addChildren: addChildren,
              remove: onRemove,
              onChange: onRelationItemContentChange.bind(null, data),
            },
            extraData
          );
        }}
      />
    </div>
  );
};
