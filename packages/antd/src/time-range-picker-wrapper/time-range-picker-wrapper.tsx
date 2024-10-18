import { useMemo } from 'react';
import { TimePicker, TimeRangePickerProps } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { hooks } from '@wove/react';
import {
  DayjsDateTypeEnum,
  DayjsTimeTypeEnum,
  TDayjsTimeType,
} from '../_utils/constants.js';
import {
  getDisabledHour,
  getDisabledMinute,
  getDisabledSecond,
} from '../_utils/time.js';

export type TimeRangePickerWrapperProps = Omit<
  TimeRangePickerProps,
  'value' | 'onChange' | 'format'
> & {
  value?: [string, string];
  onChange?: (value?: [string, string]) => void;
  /**
   * 1. minTime、maxTime设置格式，默认格式：HH:mm:ss
   * 2. minTime、maxTime格式必须与 format 相同
   */
  disabledTimeConfig?: {
    minTime?: TDayjsTimeType;
    maxTime?: TDayjsTimeType;
    /** 禁用 小时 刻度列表，与日期无关 */
    disabledHourList?: number[];
    /** 禁用 分钟 刻度列表，与日期无关 */
    disabledMinuteList?: number[];
    /** 禁用 秒钟 刻度列表，与日期无关 */
    disabledSecondList?: number[];
  };
  format?: TDayjsTimeType;
};
// export declare type EventValue<DateType> = DateType | null;
// export declare type RangeValue<DateType> = [EventValue<DateType>, EventValue<DateType>] | null;
/**
 * TimePicker组件包装
 * ```
 * 1. value类型为 [string, string]
 * 2. onChange返回类型 [string, string]
 * 3. 默认格式化类型 HH:mm:ss，其他格式化类型自定义format
 * 4. 设置disabledTime后，disabledTimeConfig配置将失效
 * ```
 */
export const TimeRangePickerWrapper = (props: TimeRangePickerWrapperProps) => {
  const { onChange, disabledTimeConfig, ...otherProps } = props;

  const {
    minTime,
    maxTime,
    disabledHourList,
    disabledMinuteList,
    disabledSecondList,
  } = disabledTimeConfig || {};

  const format = useMemo(() => {
    return props.format || DayjsTimeTypeEnum.Hms;
  }, [props.format]);

  const onChangeTime = hooks.useCallbackRef(
    (date, [timeStart, timeEnd]: [string, string]) => {
      if (date) {
        onChange?.([timeStart, timeEnd]);
      } else {
        onChange?.(undefined);
      }
    }
  );

  const timePickerValue = useMemo(() => {
    const value = props.value;
    if (value && value.length > 0) {
      return [
        value[0] ? dayjs(value[0], format) : value[0],
        value[1] ? dayjs(value[1], format) : value[1],
      ] as [Dayjs, Dayjs];
    }
    return undefined;
  }, [props.value, format]);

  const getDisabledTime: TimeRangePickerProps['disabledTime'] = () => {
    const date = dayjs().format(DayjsDateTypeEnum.YMD);
    const options = {
      minDateTime: minTime ? dayjs(`${date} ${minTime}`) : undefined,
      maxDateTime: maxTime ? dayjs(`${date} ${maxTime}`) : undefined,
      disabledHourList,
      disabledMinuteList,
      disabledSecondList,
    };
    return {
      disabledHours: () => {
        return getDisabledHour(dayjs(), options);
      },
      disabledMinutes: (hour: number) => {
        return getDisabledMinute(dayjs(`${date} ${hour}`), options);
      },
      disabledSeconds: (hour: number, minute: number) => {
        return getDisabledSecond(dayjs(`${date} ${hour}:${minute}`), options);
      },
    };
  };

  return (
    <TimePicker.RangePicker
      disabledTime={getDisabledTime}
      {...otherProps}
      value={timePickerValue as any}
      onChange={onChangeTime}
      format={format}
    />
  );
};
