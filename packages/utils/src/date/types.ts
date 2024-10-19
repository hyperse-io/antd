export type DateFormatType =
  | 'YYYY-MM'
  | 'YYYY-MM-DD'
  | 'YYYY-MM-DD hh:mm'
  | 'YYYY-MM-DD hh:mm:ss'
  | 'MM-DD'
  | 'YYYY/MM'
  | 'YYYY/MM/DD'
  | 'YYYY/MM/DD hh:mm'
  | 'YYYY/MM/DD hh:mm:ss'
  | 'MM/DD'
  | 'YYYY.MM'
  | 'YYYY.MM.DD'
  | 'YYYY.MM.DD hh:mm'
  | 'YYYY.MM.DD hh:mm:ss'
  | 'MM.DD'
  | 'YYYY年MM月'
  | 'YYYY年MM月DD日'
  | 'YYYY年MM月DD日 hh:mm'
  | 'YYYY年MM月DD日 hh:mm:ss'
  | 'MM月DD日'
  | 'hh:mm'
  | 'hh:mm:ss'
  | 'YYYYMM'
  | 'YYYYMMDD'
  | 'YYYYMMDD hh:mm'
  | 'YYYYMMDD hh:mm:ss';

export type DateType = Date | string | number;