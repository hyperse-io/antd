import { modifyQueryString, paramStrToJson } from '@dimjs/utils';
import { TPlainObject } from '../types/define';

export const toLinkPathWithQuery = (path: string, query: TPlainObject = {}) => {
  return modifyQueryString(
    path,
    Object.assign(paramStrToJson(window.location.href), query)
  );
};
