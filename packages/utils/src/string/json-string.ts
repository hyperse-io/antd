/**
 * json string 转 json 对象
 * ```
 * 非json字符串会抛异常
 * ```
 */
export const jsonStringToJsonObject = (jsonString: string) => {
  try {
    window['__json_string_transform'] = null;
    let jsonValue = jsonString;
    let count = 0;
    while (typeof jsonValue != 'object') {
      eval(`window.__json_string_transform=${jsonValue} `);
      jsonValue = window['__json_string_transform'];
      if (count === 10) {
        throw new Error(`数据解析异常，【${jsonString}】`);
      }
      count++;
    }
    return jsonValue;
  } catch (error: any) {
    throw new Error(error?.message);
  }
};
