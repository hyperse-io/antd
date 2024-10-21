import { isUndefinedOrNull } from '../lang/is-empty.js';

export const getValueOrDefault = (
  value: string | number | null | undefined,
  defaultValue: string | number
) => {
  return (isUndefinedOrNull(value) ? defaultValue : value) as string | number;
};
