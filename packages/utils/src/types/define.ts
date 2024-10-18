export type TAny = any;

export type TPlainObject<T = TAny> = Record<string, T>;

export type TNoopDefine = () => void;

export type TNoopHasParamsDefine<T = TAny> = (x: T) => void;

/**
 * 设置默认值
 */
export type TSetDefaultDefined<T, D> = T extends undefined | null ? D : T;
