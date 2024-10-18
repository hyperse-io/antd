/**
 * 用于计算 operateCol 所占用网格数
 * ```
 * col网格数据 [8,8,8,12,24,0,8] => [[8,8,8],[12],[24],[0,8]]，分组后计算operateCol所在行中剩余网格数
 * ```
 * @returns
 */
export const calculateOperateGrid = (
  gridList: number[],
  operateColIndex: number
) => {
  try {
    const groupList = [] as { index: number; value: number }[][];
    const getGroupItem = function (index) {
      const value = gridList[index];
      return { index, value: value > 24 ? 24 : value };
    };
    let condition = true;
    let groupItemList = [] as { index: number; value: number }[];
    let currentIndex = 0;
    let total = 0;
    while (condition) {
      const currentValue = gridList[currentIndex];
      groupItemList.push(getGroupItem(currentIndex));
      if (currentValue >= 24) {
        groupList.push(groupItemList);
        groupItemList = [];
        total = 0;
      } else if (currentIndex === gridList.length - 1) {
        groupList.push(groupItemList);
      } else {
        total += currentValue;
        if (total >= 24) {
          groupList.push(groupItemList);
          groupItemList = [];
          total = 0;
        }
      }
      currentIndex = currentIndex + 1;
      if (currentIndex >= gridList.length) {
        condition = false;
      }
    }
    const hasOperateList =
      groupList.find(
        (item) => !!item.find((temp) => temp.index === operateColIndex)
      ) || [];
    let hasOperateTotal = 0;
    let hasOperateIndex = 0;
    hasOperateList.forEach((item, index) => {
      if (item.index === operateColIndex) hasOperateIndex = index;
      if (item.index < operateColIndex) {
        hasOperateTotal = hasOperateTotal + item.value;
      }
    });
    if (hasOperateTotal === 24 || hasOperateTotal === 0) {
      hasOperateList[hasOperateIndex].value = 24;
    } else {
      hasOperateList[hasOperateIndex].value = 24 - hasOperateTotal;
    }

    return {
      gridList: groupList
        .reduce((a, b) => a.concat(b))
        .map((temp) => temp.value),
      gridGroupList: groupList,
    };
  } catch (_error) {
    return {
      gridList,
      gridGroupList: [],
    };
  }
};
