import { TRelationTreeData } from './type.js';

export const deleteLoop = (data: TRelationTreeData, uid: string) => {
  if (data.uid === uid) {
    data['_delete'] = true;
  }
  data?.relationList?.forEach((item) => {
    if (item.uid === uid || item.customData?.uid === uid) {
      item['_delete'] = true;
      if (data.relationList.length === 1) {
        data['_delete'] = true;
      }
    }

    item.children?.forEach((innerItem) => {
      deleteLoop(innerItem, uid);
    });
  });
};

export const filterSurplusData = (data: TRelationTreeData) => {
  data.relationList = data.relationList || [];
  data.relationList = data.relationList.filter((item) => !item['_delete']);

  data.relationList.forEach((item) => {
    item.children = item.children || [];
    item.children = item.children.filter((item) => !item['_delete']);

    item.children.forEach((innerItem) => {
      filterSurplusData(innerItem);
    });
  });

  data.relationList = data.relationList.filter((item) => {
    if (!item.customData && !item.children) {
      return false;
    }
    if (!item.customData && (!item.children || item.children.length === 0)) {
      return false;
    }
    return true;
  });
};
