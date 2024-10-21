import { dateNormalize } from './date-normalize.js';
import { DateType } from './types.js';

const weekConfig = {
  1: '一',
  2: '二',
  3: '三',
  4: '四',
  5: '五',
  6: '六',
  7: '日',
};

/**
 * 日期解析
 * @param dateInput
 * @returns
 * ```
 * 1. 解析后月份 1～12
 * 2. 解析后星期 1～7
 * ```
 */
export const dateDetail = (dateInput: DateType) => {
  const dateInstance = dateNormalize(dateInput);
  const week = dateInstance.getDay();
  const type7Week = week === 0 ? 7 : week;
  return {
    y: dateInstance.getFullYear(),
    m: dateInstance.getMonth() + 1,
    d: dateInstance.getDate(),
    h: dateInstance.getHours(),
    mi: dateInstance.getMinutes(),
    s: dateInstance.getSeconds(),
    ms: dateInstance.getMilliseconds(),
    week: type7Week,
    weekString: weekConfig[type7Week],
    instance: dateInstance,
  };
};
