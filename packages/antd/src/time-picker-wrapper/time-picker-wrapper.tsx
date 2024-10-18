import { useMemo } from 'react';
import { TimePicker, TimePickerProps } from 'antd';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter.js';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js';
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
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

export type TimePickerWrapperProps = Omit<
  TimePickerProps,
  'value' | 'onChange' | 'format'
> & {
  value?: string;
  onChange?: (value?: string) => void;
  /**
   * 1. minTime、maxTime设置为 DayjsTimeTypeEnum，默认格式：HH:mm:ss
   * 2. minTime、maxTime格式必须与 format 相同
   */
  disabledTimeConfig?: {
    minTime?: TDayjsTimeType;
    maxTime?: TDayjsTimeType;
    /** 禁用 小时 刻度列表，与日期无关  */
    disabledHourList?: number[];
    /** 禁用 分钟 刻度列表，与日期无关 */
    disabledMinuteList?: number[];
    /** 禁用 秒钟 刻度列表，与日期无关 */
    disabledSecondList?: number[];
  };
  format?: TDayjsTimeType;
};
/**
 * TimePicker组件包装
 * ```
 * 1. value类型为 string
 * 2. onChange返回类型 string
 * 3. 默认格式化类型 HH:mm:ss
 * 4. 其他格式化类型自定义format
 * 5. 设置disabledTime后，disabledTimeConfig配置将失效
 * ```
 */
export const TimePickerWrapper = (props: TimePickerWrapperProps) => {
  const { onChange, disabledTimeConfig, format, ...otherProps } = props;
  const {
    minTime,
    maxTime,
    disabledHourList,
    disabledMinuteList,
    disabledSecondList,
  } = disabledTimeConfig || {};

  const customFormat = format || DayjsTimeTypeEnum.Hms;

  const onChangeTime = hooks.useCallbackRef((time, timeString: string) => {
    if (time) {
      onChange?.(timeString);
    } else {
      onChange?.(undefined);
    }
  });

  const timePickerValue = useMemo(() => {
    const value = props.value;
    if (value) {
      return dayjs(value, customFormat);
    }
    return undefined;
  }, [customFormat, props.value]);

  const getDisabledTime: TimePickerProps['disabledTime'] = () => {
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

  const showNow = useMemo(() => {
    const now = dayjs();
    return (
      now.isSameOrAfter(dayjs(minTime || '00:00:00', customFormat)) &&
      now.isSameOrBefore(dayjs(maxTime || '23:59:59', customFormat))
    );
  }, [customFormat, maxTime, minTime]);

  return (
    <TimePicker
      showNow={showNow}
      disabledTime={getDisabledTime}
      {...otherProps}
      value={timePickerValue as any}
      onChange={onChangeTime}
      format={customFormat}
    />
  );
};
