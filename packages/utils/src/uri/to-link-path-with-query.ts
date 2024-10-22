import { modifyQueryString, paramStrToJson } from '@dimjs/utils';
import { type TPlainObject } from '../types/define.js';

export const toLinkPathWithQuery = (path: string, query: TPlainObject = {}) => {
  return modifyQueryString(
    path,
    Object.assign(paramStrToJson(window.location.href), query)
  );
};
