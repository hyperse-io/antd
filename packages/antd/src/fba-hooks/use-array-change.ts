import { useRef } from 'react';
import { isArray } from '@dimjs/lang';
import { hooks } from '@wove/react';

export const useArrayChange = <T>(
  defautDataList: Array<T>,
  forceUpdate = true
) => {
  const changeListRef = useRef<Array<T>>(defautDataList);
  const update = hooks.useForceUpdate();
  const arrayOperate = {
    add: hooks.useCallbackRef((dataItem: T | Array<T>, isUnshift?: boolean) => {
      if (isUnshift) {
        const targetList = (isArray(dataItem) ? dataItem : [dataItem]) as T[];
        changeListRef.current = [...targetList, ...changeListRef.current];
      } else {
        changeListRef.current = changeListRef.current.concat(dataItem);
      }
      if (forceUpdate) {
        update();
      }
    }),
    update: hooks.useCallbackRef((index: number, dataItem: T) => {
      const target = changeListRef.current[index];
      if (target) {
        changeListRef.current[index] = { ...target, ...dataItem };
      }
      if (forceUpdate) {
        update();
      }
    }),
    delete: hooks.useCallbackRef((index: number) => {
      const deleteItem = changeListRef.current.splice(index, 1);
      if (forceUpdate) {
        update();
      }
      return deleteItem;
    }),
    resetList: hooks.useCallbackRef((dataList: Array<T>) => {
      changeListRef.current = dataList;
      if (forceUpdate) {
        update();
      }
    }),
    getList: hooks.useCallbackRef(() => {
      return changeListRef.current;
    }),
  };
  return [changeListRef.current, arrayOperate] as const;
};
