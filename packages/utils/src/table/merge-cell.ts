import { isArray } from '@dimjs/lang';
import { valueIsEqual } from '../string';
import { TAny, TPlainObject } from '../types';

/**
 * 表格合并单元格计算
 * @param dataSource 正常表格数据，如果合并了单元格，会使用第一条数据中的字段值
 * @param mergeFields 如果存在相同合并，可复用之前的合并字段
 * @returns
 *```
 * 1. 设置mergeFields数组后， 会在每一条数据中添加 xxxRowSpan合并单元格数量字段
 * 2. 存在单元格合并，分页使用单独组件
 *```
 */
export const tableMergeCellCalculate = (
  dataSource: TPlainObject[],
  mergeFields: string[]
) => {
  if (!isArray(dataSource) || dataSource.length === 0) return [];
  if (!isArray(mergeFields) || mergeFields.length === 0) return dataSource;
  const mergeFieldsGroup = [] as string[][];
  mergeFields.forEach((item, index) => {
    if (index === 0) {
      mergeFieldsGroup.push([item]);
    } else {
      mergeFieldsGroup.push([...mergeFieldsGroup[index - 1], item]);
    }
  });

  function theSameSort(originalData: TPlainObject[], fieldList: string[]) {
    let newOriginalData = [] as TPlainObject[];
    const fieldValueList = originalData.map((originalItem) => {
      const originalValue = fieldList
        .map((temp) => originalItem[temp])
        .join('_');
      return originalValue;
    });
    const newFieldValueList = Array.from(new Set(fieldValueList));

    newFieldValueList.map((filedValue) => {
      const tempList = originalData.filter((originalItem) => {
        const originalValue = fieldList
          .map((temp) => originalItem[temp])
          .join('_');
        return filedValue === originalValue;
      });
      newOriginalData = newOriginalData.concat(tempList);
    });
    return newOriginalData;
  }

  // 对数据源进行排序
  let newDataSource = dataSource;
  mergeFieldsGroup.forEach((fields) => {
    newDataSource = theSameSort(newDataSource, fields);
  });

  const dataSourceValueGroup = [] as TPlainObject[][];
  mergeFieldsGroup.forEach((fieldsGroupItem) => {
    const fieldValueList = [] as TPlainObject[];
    newDataSource.forEach((dataSourceItem) => {
      let mergeValue = null as unknown as TPlainObject;
      fieldsGroupItem.forEach((fieldItem) => {
        if (!mergeValue) {
          mergeValue = {
            value: dataSourceItem[fieldItem],
            fields: fieldsGroupItem,
            item: dataSourceItem,
          };
        } else {
          mergeValue = {
            value: `${mergeValue.value}_${dataSourceItem[fieldItem]}`,
            fields: fieldsGroupItem,
          };
        }
      });
      fieldValueList.push(mergeValue);
    });
    dataSourceValueGroup.push(fieldValueList);
  });

  const newDataSourceValueGroup = [] as TPlainObject[][];
  dataSourceValueGroup.forEach((fieldValueList) => {
    const newFieldValueList = [] as TPlainObject[];
    fieldValueList.forEach((item, index) => {
      if (index === 0) {
        newFieldValueList.push({ ...item, count: 1 });
      } else {
        const targetIndex = newFieldValueList.findIndex((newItem) =>
          valueIsEqual(newItem.value as string, item.value as string)
        );
        if (targetIndex >= 0) {
          newFieldValueList[targetIndex].count =
            (newFieldValueList[targetIndex].count as number) + 1;
        } else {
          newFieldValueList.push({ ...item, count: 1 });
        }
      }
    });
    newDataSourceValueGroup.push(newFieldValueList);
  });

  const valueUseList = [] as string[];
  newDataSource.forEach((dataSourceItem) => {
    newDataSourceValueGroup.forEach((item) => {
      item.forEach((fieldValueItem) => {
        const mergeValueList = [] as TAny[];
        fieldValueItem.fields.forEach((fieldItem) => {
          mergeValueList.push(dataSourceItem[fieldItem]);
        });
        const mergeValue = mergeValueList.join('_');
        if (valueIsEqual(mergeValue, fieldValueItem.value as string)) {
          const lastField =
            fieldValueItem.fields[fieldValueItem.fields.length - 1];
          if (!valueUseList.find((temp) => valueIsEqual(temp, mergeValue))) {
            valueUseList.push(mergeValue);
            dataSourceItem[`${lastField}RowSpan`] = fieldValueItem.count;
          } else {
            dataSourceItem[`${lastField}RowSpan`] = 0;
          }
        }
      });
    });
  });
  // 添加序号
  let _mergeSerialNumber = 1;
  newDataSource.forEach((item) => {
    if (item[`${mergeFields[0]}RowSpan`] > 0) {
      item['_mergeSerialNumber'] = _mergeSerialNumber;
      _mergeSerialNumber += 1;
    }
  });

  return newDataSource;
};
