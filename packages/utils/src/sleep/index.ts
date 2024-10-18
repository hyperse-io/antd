/**
 * 延迟
 * @param time 毫米
 * @returns
 */
export const sleep = (time: number) =>
  new Promise((resolve) => setTimeout(resolve, time));
