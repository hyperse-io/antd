export const isHttpUri = (uri: string): boolean => {
  return !uri
    ? false
    : uri.startsWith('//') || new RegExp('(https|http)?://').test(uri);
};
