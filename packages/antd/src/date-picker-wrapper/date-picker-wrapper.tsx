import { useMemo } from 'react';
import { DatePicker } from 'antd';
import type { PickerProps } from 'antd/es/date-picker/generatePicker';
import dayjs from 'dayjs';
import { flatbizDate, TAny } from '@hyperse/utils';
import { hooks } from '@wove/react';
import { DayjsDateTypeEnum, TDayjsDateType } from '../_utils/constants.js';
import {
  getDisabledHour,
  getDisabledMinute,
  getDisabledSecond,
} from '../_utils/time.js';

export type DatePickerWrapperProps = Omit<
  PickerProps<TAny>,
  'value' | 'onChange' | 'format'
> & {
  /** 默认格式为 'YYYY-MM-DD' */
  value?: string;
  onChange?: (value?: string) => void;
  disabledDateConfig?: {
    minDate?: TDayjsDateType;
    maxDate?: TDayjsDateType;
    /** 禁用 小时 刻度列表，与日期无关  */
    disabledHourList?: number[];
    /** 禁用 分钟 刻度列表，与日期无关 */
    disabledMinuteList?: number[];
    /** 禁用 秒钟 刻度列表，与日期无关 */
    disabledSecondList?: number[];
  };
  /** 可自定义格式 */
  format?: TDayjsDateType;
  /** value 输出适配 */
  outputNormalize?: (value?: TAny) => TAny;
  /** value 输入适配 */
  inputNormalize?: (value?: TAny) => string | undefined;
};

/**
 * DatePicker包装组件
 * ```
 * 1. value 默认格式为 'YYYY-MM-DD'，可以通过 inputNormalize 来进行自定义转换
 * 2. onChange返回类型 string，可以通过 outputNormalize 来进行自定义转换
 * 3. 默认格式化类型 YYYY-MM-DD； 当showTime===true时，默认格式化类型 DayjsDateTypeEnum.YMDHms；其他格式化类型自定义format
 * 4. 设置 disabledDate 后，disabledDateConfig配置将失效
 * 5. 设置 disabledTime 后，内置的disabledTime逻辑将失效
 * ```
 */
export const DatePickerWrapper = (props: DatePickerWrapperProps) => {
  const {
    value,
    onChange,
    style,
    format,
    outputNormalize,
    inputNormalize,
    ...otherProps
  } = props;
  const {
    minDate,
    maxDate,
    disabledHourList,
    disabledMinuteList,
    disabledSecondList,
  } = props.disabledDateConfig || {};
  const minDateTimeDayInst = minDate ? dayjs(minDate) : undefined;
  const maxDateTimeDayInst = maxDate ? dayjs(maxDate) : undefined;
  const customFormat = useMemo(() => {
    if (format) return format as string;
    if (props.showTime) return DayjsDateTypeEnum.YMDHms;
    return DayjsDateTypeEnum.YMD;
  }, [props.showTime, format]);

  const onChangeDate = hooks.useCallbackRef((date, dateString: string) => {
    if (date) {
      if (outputNormalize) {
        onChange?.(outputNormalize(dateString));
      } else {
        onChange?.(dateString);
      }
    } else {
      onChange?.(undefined);
    }
  });

  const getDisabledDate = hooks.useCallbackRef((current) => {
    const currentDate = current.format(DayjsDateTypeEnum.YMD);
    if (!props.disabledDateConfig) {
      return false;
    }
    if (minDateTimeDayInst && maxDateTimeDayInst) {
      if (
        !flatbizDate.in(
          currentDate,
          minDateTimeDayInst.format(DayjsDateTypeEnum.YMD),
          maxDateTimeDayInst.format(DayjsDateTypeEnum.YMD)
        )
      ) {
        return true;
      }
    } else if (minDateTimeDayInst) {
      if (
        !flatbizDate.gte(
          currentDate,
          minDateTimeDayInst.format(DayjsDateTypeEnum.YMD)
        )
      ) {
        return true;
      }
    } else if (maxDateTimeDayInst) {
      if (
        !flatbizDate.gte(
          maxDateTimeDayInst.format(DayjsDateTypeEnum.YMD),
          currentDate
        )
      ) {
        return true;
      }
    }
    return false;
  });

  const datePickerValue = useMemo(() => {
    if (value) {
      const valueFt = inputNormalize ? inputNormalize(value) : value;
      if (valueFt) {
        return dayjs(flatbizDate.dateNormalize(valueFt));
      }
    }
    return undefined;
  }, [value]);

  const getDisabledTime = hooks.useCallbackRef((current) => {
    const options = {
      minDateTime: minDateTimeDayInst,
      maxDateTime: maxDateTimeDayInst,
      disabledHourList,
      disabledMinuteList,
      disabledSecondList,
    };
    current = current || datePickerValue || dayjs(new Date());
    return {
      disabledHours: () => {
        return getDisabledHour(current, options);
      },
      disabledMinutes: () => {
        return getDisabledMinute(current, options);
      },
      disabledSeconds: () => {
        return getDisabledSecond(current, options);
      },
    };
  });

  const showTime = useMemo(() => {
    if (props.showTime) return props.showTime;
    if (customFormat && customFormat.includes('HH')) {
      return true;
    }
    return false;
  }, [props.showTime, customFormat]);

  return (
    <DatePicker
      disabledDate={getDisabledDate}
      disabledTime={getDisabledTime}
      {...otherProps}
      showTime={showTime}
      format={customFormat}
      style={{ width: '100%', ...style }}
      value={datePickerValue as any}
      onChange={onChangeDate}
    />
  );
};
