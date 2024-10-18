export const urlJoin = (first: string, second: string) => {
  return (
    (first || '').replace(/\/$/, '') + '/' + (second || '').replace(/^\//, '')
  );
};

/**
 * url片段拼接
 * @param first
 * @param second
 * @returns
 */
export const urlJoinMulti = (firstUrl: string, ...fragment: string[]) => {
  let str = firstUrl;
  fragment.forEach((item) => {
    str = urlJoin(str, item);
  });
  return str;
};
