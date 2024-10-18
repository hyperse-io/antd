export enum DayjsDateTypeEnum {
  YMDHms = 'YYYY-MM-DD HH:mm:ss',
  YMDHm = 'YYYY-MM-DD HH:mm',
  YMDH = 'YYYY-MM-DD HH',
  YMD = 'YYYY-MM-DD',
}

export enum DayjsTimeTypeEnum {
  Hms = 'HH:mm:ss',
  Hm = 'HH:mm',
  H = 'HH',
  ms = 'mm:ss',
  m = 'mm',
  s = 'ss',
}

export type TDayjsDateType =
  | 'YYYY-MM-DD HH:mm:ss'
  | 'YYYY-MM-DD HH:mm'
  | 'YYYY-MM-DD HH'
  | 'YYYY-MM-DD'
  | (string & {});

export type TDayjsTimeType =
  | 'HH:mm:ss'
  | 'HH:mm'
  | 'HH'
  | 'mm:ss'
  | 'mm'
  | 'ss'
  | (string & {});
