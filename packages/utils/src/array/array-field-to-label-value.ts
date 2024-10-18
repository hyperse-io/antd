import { extend } from '@dimjs/utils';
import { isUndefinedOrNull } from '../lang';
import { LabelValueItem, TPlainObject } from '../types';

/**
 * 数组中的对象字段，转成label、value字段名对象，主要用于弹框中的数据源转换
 * @param dataList
 * @param fieldNames
 * @param isReserve 是否保留原字段，默认值：true
 * @returns
 * ```
 * 例如：[{ id: 1, name: '张三' }] => [{ id: 1, name: '张三', value: 1, label: '张三' }]
 * ```
 */
export const arrayField2LabelValue = (
  dataList: TPlainObject[],
  fieldNames?: { label?: string; value?: string },
  isReserve?: boolean
) => {
  const dataListNew = dataList || [];
  const fieldNamesNew = extend({ label: 'label', value: 'value' }, fieldNames);
  const isReserveNew = isUndefinedOrNull(isReserve) ? true : isReserve;
  return dataListNew.map((item) => {
    let respData = {
      label: item[fieldNamesNew.label],
      value: item[fieldNamesNew.value],
    } as TPlainObject;
    if (isReserveNew) {
      respData = extend({}, item, respData);
    }
    return respData;
  }) as Array<LabelValueItem & { [key: string]: any }>;
};
