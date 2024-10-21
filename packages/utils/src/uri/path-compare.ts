import { ensureSlash } from './ensure-slash.js';

/**
 * 比较两个path是否相等
 * @param targetPath 目标path
 * @param comparedPath 被比较path
 * @returns
 */
export const pathEqual = (targetPath: string, comparedPath: string) => {
  return (
    ensureSlash(targetPath || '', true) ===
    ensureSlash(comparedPath || '', true)
  );
};

/**
 * 比较comparedPath是否包含targetPath
 * @param targetPath 目标path
 * @param comparedPath 被比较path
 * @returns
 */
export const pathEqualInclude = (targetPath: string, comparedPath: string) => {
  return (
    ensureSlash(comparedPath || '', true).indexOf(
      ensureSlash(targetPath || '', true)
    ) >= 0
  );
};
