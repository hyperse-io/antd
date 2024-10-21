export const hyperseRegExp = {
  /** 汉字格式  */
  chineseCharactersRegExp: /[\u4e00-\u9fa5]/,
  /** 手机号格式  */
  mobileRegExp: /^1[0-9]{10}$/,
  /** 正整数格式 */
  integerRegExp: /^[0-9]*$/,
  /** 金额格式  */
  amountRegExp: /^(([1-9]\d*)|0)(\.\d{1,})?$/,
  /** 密码格式：英文大小写、数字、符号[!@#$%^&*?.]其中两种及以上，长度8-20位 */
  passwordRegExp:
    /^.*(?=.{8,20})((?=.*\d)(?=.*[A-Z]))|((?=.*\d)(?=.*[a-z]))|((?=.*\d)(?=.*[!@#$%^&*?.]))|((?=.*[A-Z])(?=.*[a-z]))|((?=.*[A-Z])(?=.*[!@#$%^&*?.]))|((?=.*[a-z])(?=.*[!@#$%^&*?.])).*$/,
  /** 8-20位数字和字母的组合 */
  passwordRegExp2: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,20}$/,
};
