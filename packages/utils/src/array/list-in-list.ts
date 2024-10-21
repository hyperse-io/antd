import { isUndefinedOrNull } from '../lang/is-empty.js';
import { TPlainObject } from '../types/index.js';

/**
 * 通过规则字段 来源数组 并入 目标数组
 * @param sourceList 来源数组
 * @param targetList 目标数组
 * @param inRuleFieldName 规则字段，默认值: value
 *
 * ```
 * listInList([{ value: 1, name: '张三', age: 100 }], [{ value: 1, age: 20, sex: 1 }], 'value')
 * =>
 * [{ value: 1, name: '张三', age: 100, sex: 1 }]
 * ```
 */
export const listInList = (
  sourceList: TPlainObject[],
  targetList: TPlainObject[],
  inRuleFieldName = 'value'
) => {
  const resultList = targetList.map((item) => {
    const target = sourceList.find(
      (sourceItem) =>
        !isUndefinedOrNull(item[inRuleFieldName]) &&
        sourceItem[inRuleFieldName] === item[inRuleFieldName]
    );
    return {
      ...item,
      ...target,
    };
  });
  return resultList as TPlainObject[];
};
