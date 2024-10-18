import { type DataNode } from 'antd/es/tree';
import { dequal } from 'dequal';
import { isArray, isObject } from '@dimjs/lang';
import { cloneState } from '@dimjs/model';
import { walkThroughTree } from '@dimjs/utils';
import {
  isUndefinedOrNull,
  type LabelValueItem,
  type TAny,
  type TPlainObject,
  treeLeafParentsArray,
  treeToArray,
  treeToTiledArray,
} from '@hyperse/utils';

export const getDefaultExpandAllKeys = (
  treeList: TPlainObject[],
  fieldNames: { label: string; value: string; children: string }
) => {
  const allValues = treeToArray(treeList, fieldNames.children)
    .filter((item) => {
      const childrenValue = item[fieldNames.children] as TAny[] | undefined;
      return childrenValue && childrenValue.length > 0;
    })
    .map((item) => {
      return item[fieldNames.value];
    });
  return allValues as Array<string | number>;
};

export const getExpandedKeys = (
  value: string | number,
  treeList: TPlainObject[],
  fieldNames: { label: string; value: string; children: string }
) => {
  const tiledArray = treeToTiledArray(treeList, fieldNames);
  return treeLeafParentsArray(value, tiledArray, true, {
    value: 'value',
    parentValue: 'parentValue',
  })
    .filter((item) => {
      const childrenValue = item[fieldNames.children] as TAny[] | undefined;
      return childrenValue && childrenValue.length > 0;
    })
    .map((item) => item.value);
};

export const getVauleList = (
  data,
  labelInValueFieldNames: LabelValueItem<string | number>
) => {
  let tempList = isUndefinedOrNull(data) ? [] : data;
  tempList = isArray(tempList) ? tempList : [tempList];
  tempList = tempList.map((item) => {
    if (isObject(item)) return item[labelInValueFieldNames.value];
    return item;
  });
  return tempList as Array<string | number>;
};

export const array2map = (
  data,
  labelInValueFieldNames: LabelValueItem<string | number>
) => {
  const list = getVauleList(data, labelInValueFieldNames);
  const map = {};
  list.forEach((item) => {
    map[item] = true;
  });
  return map;
};

/**
 * value的类型包括
 * string、number、
 * Array<string | number>、{ label: string, value: string | nuber }、
 * Array<{ label: string, value: string | nuber }>
 * 将数组转成对象，深度比较时不用考虑顺序问题
 * @param value1
 * @param value2
 * @returns
 */
export const treeWrapperValueDeepEqual = (
  value1: TAny,
  value2: TAny,
  labelInValueFieldNames: LabelValueItem<string | number>
) => {
  if (isUndefinedOrNull(value1) && isUndefinedOrNull(value2)) return true;
  const object1 = array2map(value1, labelInValueFieldNames);
  const object2 = array2map(value2, labelInValueFieldNames);
  return dequal(object1, object2);
};

type OnTreeDropMethod = (
  dataList: TPlainObject[],
  fieldNames: { value: string; children: string },
  info: TAny
) => {
  dataList: TPlainObject[];
  dragNodeData: {
    parentId?: string | number;
    id: string | number;
    index: number;
  };
};

export const onTreeDrop: OnTreeDropMethod = (dataList, fieldNames, info) => {
  const dropKey = info.node.key;
  const dragKey = info.dragNode.key;
  const dropPos = info.node.pos.split('-');
  const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);
  const treeKeyName = fieldNames.value;
  const treeChildrenName = fieldNames.children;

  const loop = (
    data: DataNode[],
    key: React.Key,
    callback: (node: DataNode, i: number, data: DataNode[]) => void
  ) => {
    for (let i = 0; i < data.length; i++) {
      if (data[i][treeKeyName] === key) {
        return callback(data[i], i, data);
      }
      if (data[i][treeChildrenName]) {
        loop(data[i][treeChildrenName]!, key, callback);
      }
    }
  };
  const data = cloneState(dataList) as DataNode[];

  // Find dragObject
  let dragObj: DataNode;
  loop(data, dragKey, (item, index, arr) => {
    arr.splice(index, 1);
    dragObj = item;
  });

  if (!info.dropToGap) {
    // Drop on the content
    loop(data, dropKey, (item) => {
      item[treeChildrenName] = item[treeChildrenName] || [];
      // where to insert 示例添加到头部，可以是随意位置
      item[treeChildrenName].unshift(dragObj);
    });
  } else if (
    (info.node.props.children || []).length > 0 && // Has children
    info.node.props.expanded && // Is expanded
    dropPosition === 1 // On the bottom gap
  ) {
    loop(data, dropKey, (item) => {
      item[treeChildrenName] = item[treeChildrenName] || [];
      // where to insert 示例添加到头部，可以是随意位置
      item[treeChildrenName].unshift(dragObj);
      // in previous version, we use item.children.push(dragObj) to insert the
      // item to the tail of the children
    });
  } else {
    let ar: DataNode[] = [];
    let i: number;
    loop(data, dropKey, (_item, index, arr) => {
      ar = arr;
      i = index;
    });
    if (dropPosition === -1) {
      ar.splice(i!, 0, dragObj!);
    } else {
      ar.splice(i! + 1, 0, dragObj!);
    }
  }
  return {
    dataList: data,
    dragNodeData: dragNodeData(dragKey, data, fieldNames),
  };
};

export const dragNodeData = (
  dorpNodeId: TAny,
  dataList: TAny[],
  fieldNames: { value: string; children: string }
) => {
  const id = fieldNames.value;
  const children = fieldNames.children;
  walkThroughTree<TPlainObject, TAny>(
    { [id]: undefined, [children]: dataList } as TAny,
    (node, index, _parent) => {
      node['__index'] = index;
      node['__parentId'] = _parent?.[id];
    },
    children
  );
  const tileList = treeToArray(dataList, children);
  const target = tileList.find((item) => item[id] === dorpNodeId);
  return {
    parentId: target?.['__parentId'],
    id: target?.[id],
    index: target?.['__index'],
  };
};
