// export const urlJoin = (first: string, second: string) => {
//   return (first || '').replace(/\/$/, '') + '/' + (second || '').replace(/^\//, '');
// };
/**
 * make sure the endfix slash as expect.
 * @param str path fragment
 * @param slashEndfix flag to indicates if we need keep last slash `/`
 */
export const ensureSlash = (str: string, slashEndfix = false) => {
  str = str.replace(/\/$/, '');
  return slashEndfix ? str + '/' : str;
};

/**
 * 按照item.`path`长度越长的排列到最前面
 * @param items
 * @returns
 */
export const sortItemsByPath = <T extends { path: string | null }>(
  items: T[] = []
) => {
  return items.slice(0).sort((a, b) => {
    return (b.path || '').length - (a.path || '').length;
  });
};

/**
 * path1 是否 包含 path2
 * @param path1
 * @param path2
 * @returns
 */
export const pathIncludePath = (path1: string, path2: string) => {
  return ensureSlash(path1, true).startsWith(ensureSlash(path2, true));
};
