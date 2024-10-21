import { dateTimeEq, dateTimeGt, dateTimeGte, dateTimeIn } from './compare.js';
import { dateDetail } from './date-detail.js';
import { dateNew } from './date-new.js';
import { dateNormalize } from './date-normalize.js';
import { dateFormat } from './format.js';
import { isDate } from './is-date.js';

export * from './types.js';

type HyperseDate = {
  /**
   * 判断是否为合法日期
   */
  isDate: typeof isDate;
  /**
   * 日期格式化，默认格式：YYYY-MM-DD
   */
  format: typeof dateFormat;
  /**
   * 日期比较：大于等于
   */
  gte: typeof dateTimeGte;
  /**
   * 日期比较：大于
   */
  gt: typeof dateTimeGt;
  /**
   * 日期比较：等于
   */
  eq: typeof dateTimeEq;
  /**
   * 判断目标日期是否在指定区间内，包含临界值
   * @param targetDate
   * @param minDate
   * @param maxDate
   * ```
   * 例如：targetDate e>= minDate && targetDate <= maxDate
   * ```
   */
  in: typeof dateTimeIn;
  /**
   * 日期详情
   * ```
   * 1. 解析日期中的【'y' |'m' |'d' |'h' |'mi' |'s' |'ms' |'week'】数据
   * 2. 解析后月份 1～12
   * 3. 解析后星期 1～7
   * ```
   */
  detail: typeof dateDetail;
  /**
   * 日期修改
   * ```
   * 对日期【'y' | 'm' | 'd' | 'h' | 'mi' | 's'】中进行加减值处理
   * ```
   */
  update: typeof dateNew;
  /**
   * 指定数据转日期格式
   */
  dateNormalize: typeof dateNormalize;
};

export const hyperseDate: HyperseDate = {
  isDate: isDate,
  format: dateFormat,
  gte: dateTimeGte,
  gt: dateTimeGt,
  eq: dateTimeEq,
  detail: dateDetail,
  update: dateNew,
  in: dateTimeIn,
  dateNormalize: dateNormalize,
};
