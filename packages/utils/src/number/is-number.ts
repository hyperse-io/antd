import { isNumber as _isNumber } from '@dimjs/lang';

export const isNumber = (num: string | number) => {
  if (num === '' || num === undefined || num === null) {
    return false;
  }
  return _isNumber(Number(num));
};
