import { getQueryString } from '@dimjs/utils';

export const isMockMeEnv = () => {
  const env = getQueryString('env');

  return env === 'me';
};

export const isMockDevEnv = () => {
  const env = getQueryString('env');
  return env === 'dev';
};

/** 是否为mac系统（包含iphone手机） */
export const isMacEnv = () => {
  return /macintosh|mac os x/i.test(navigator.userAgent);
};

/** 是否为windows系统 */
export const isWindowsEnv = () => {
  return /windows|win32|win64/i.test(navigator.userAgent);
};
