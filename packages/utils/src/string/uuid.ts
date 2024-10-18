import { cache } from '@dimjs/utils';

const uuidFactory = (() => {
  const now = `${Date.now()}`;
  return cache(`uuid-${now.substring(now.length - 4, now.length)}-`, 100);
})();

export const getUuid = () => {
  return uuidFactory();
};
