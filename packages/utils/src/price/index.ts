import { add, divide, multiply, subtract } from './calculate';
import { priceFen2wan } from './fen2wan';
import { priceFen2yuan } from './fen2yuan';
import { priceFormat } from './format';
import { priceRemoveTailZero } from './remove-zero';
import { priceSplit } from './split';
import { priceWan2fen } from './wan2fen';
import { priceYuan2fen } from './yuan2fen';

type FlatbizPrice = {
  /**
   * 金额转换 分 => 元
   */
  fen2yuan: typeof priceFen2yuan;
  /**
   * 金额转换  元 => 分
   */
  yuan2fen: typeof priceYuan2fen;
  /**
   * 金额转换 分 => 万
   */
  fen2wan: typeof priceFen2wan;
  /**
   * 金额转换  万 => 分
   */
  wan2fen: typeof priceWan2fen;
  /**
   * 金额小数点尾号去零
   * ```
   * 例如：
   * 19.90 => 19.9
   * 19.00 => 19
   * ```
   */
  removeTailZero: typeof priceRemoveTailZero;
  /**
   * 格式化金额保留小数点后2位
   */
  format: typeof priceFormat;
  /**
   * 金额分割
   * ```
   * 例如：
   * 19.09 => ['19', '.09']
   * 99.00 => ['99', '.00']
   * ```
   */
  split: typeof priceSplit;
  /**
   * 金额计算：加
   */
  add: typeof add;
  /**
   * 金额计算：减
   */
  subtract: typeof subtract;
  /**
   * 金额计算：乘
   */
  multiply: typeof multiply;
  /**
   * 金额计算：除
   */
  divide: typeof divide;
};

export const flatbizPrice: FlatbizPrice = {
  fen2yuan: priceFen2yuan,
  fen2wan: priceFen2wan,
  yuan2fen: priceYuan2fen,
  wan2fen: priceWan2fen,
  removeTailZero: priceRemoveTailZero,
  format: priceFormat,
  split: priceSplit,
  add: add,
  subtract: subtract,
  multiply: multiply,
  divide: divide,
};
