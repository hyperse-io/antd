import { Dayjs } from 'dayjs';
import { DayjsDateTypeEnum } from './constants.js';

const range = (start: number, end: number) => {
  const result: number[] = [];
  for (let i = start; i <= end; i++) {
    result.push(i);
  }
  return result;
};
export const getDisabledHour = (
  current?: Dayjs,
  options?: {
    minDateTime?: Dayjs;
    maxDateTime?: Dayjs;
    disabledHourList?: number[];
  }
) => {
  if (!options || !current) return [];
  let minTimeHour = 0;
  let maxTimeHour = 23;

  if (
    options.minDateTime?.format(DayjsDateTypeEnum.YMD) ===
    current.format(DayjsDateTypeEnum.YMD)
  ) {
    minTimeHour = options.minDateTime.get('hour');
  }
  if (
    options.maxDateTime?.format(DayjsDateTypeEnum.YMD) ===
    current.format(DayjsDateTypeEnum.YMD)
  ) {
    maxTimeHour = options.maxDateTime.get('hour');
  }
  let selectableMinute = range(minTimeHour, maxTimeHour);
  if (options.disabledHourList) {
    selectableMinute = selectableMinute.filter(
      (item) => !options.disabledHourList?.includes(item)
    );
  }
  return range(0, 23).filter((item) => !selectableMinute.includes(item));
};

export const getDisabledMinute = (
  current?: Dayjs,
  options?: {
    minDateTime?: Dayjs;
    maxDateTime?: Dayjs;
    disabledMinuteList?: number[];
  }
) => {
  if (!options || !current) return [];
  let minTimeMinute = 0;
  let maxTimeMinute = 59;
  if (
    options.minDateTime?.format(DayjsDateTypeEnum.YMDH) ===
    current.format(DayjsDateTypeEnum.YMDH)
  ) {
    minTimeMinute = options.minDateTime.get('minute');
  }
  if (
    options.maxDateTime?.format(DayjsDateTypeEnum.YMDH) ===
    current.format(DayjsDateTypeEnum.YMDH)
  ) {
    maxTimeMinute = options.maxDateTime.get('minute');
  }
  let selectableMinute = range(minTimeMinute, maxTimeMinute);
  if (options.disabledMinuteList) {
    selectableMinute = selectableMinute.filter(
      (item) => !options.disabledMinuteList?.includes(item)
    );
  }
  return range(0, 59).filter((item) => !selectableMinute.includes(item));
};

export const getDisabledSecond = (
  current?: Dayjs,
  options?: {
    minDateTime?: Dayjs;
    maxDateTime?: Dayjs;
    disabledSecondList?: number[];
  }
) => {
  if (!options || !current) return [];
  let minTimeSecond = 0;
  let maxTimeSecond = 59;
  if (
    options.minDateTime?.format(DayjsDateTypeEnum.YMDHm) ===
    current.format(DayjsDateTypeEnum.YMDHm)
  ) {
    minTimeSecond = options.minDateTime.get('second');
  }
  if (
    options.maxDateTime?.format(DayjsDateTypeEnum.YMDHm) ===
    current.format(DayjsDateTypeEnum.YMDHm)
  ) {
    maxTimeSecond = options.maxDateTime.get('second');
  }
  let selectableMinute = range(minTimeSecond, maxTimeSecond);
  if (options.disabledSecondList) {
    selectableMinute = selectableMinute.filter(
      (item) => !options.disabledSecondList?.includes(item)
    );
  }
  return range(0, 59).filter((item) => !selectableMinute.includes(item));
};
