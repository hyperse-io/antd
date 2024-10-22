import { arrayTotal } from '@hyperse/utils';
import { type TLabelValueRenderItem } from './types.js';

export const getRenderGrid = (dataList: TLabelValueRenderItem[]) => {
  let results: TLabelValueRenderItem[][] = [];

  let currentSum = 0;
  let currentArr: TLabelValueRenderItem[] = [];
  for (let i = 0; i < dataList.length; i++) {
    const item = dataList[i];
    const grid = item.grid;
    const temp = {
      ...item,
      grid: grid,
    } as TLabelValueRenderItem;
    if (currentSum + grid <= 24 && grid > 0) {
      currentSum += grid;
      currentArr.push(temp);
    } else {
      results.push(currentArr);
      currentSum = grid;
      currentArr = [temp];
    }
  }

  if (currentArr.length > 0) {
    results.push(currentArr);
  }
  if (results.length > 0) {
    results = results.map((item, index) => {
      if (item.length === 1) {
        item[0].grid = 24;
      } else {
        const total = arrayTotal(item, 'grid');
        const lastItem = item[item.length - 1];
        if (total < 24) {
          lastItem.grid = 24 - total + lastItem.grid;
        }
      }
      if (index === results.length - 1) {
        return item.map((temp) => {
          temp.isLast = true;
          return temp;
        });
      }
      return item;
    });
  }

  let resultsFt: TLabelValueRenderItem[] = [];
  results.forEach((item) => {
    resultsFt = resultsFt.concat(item);
  });
  return resultsFt;
};
