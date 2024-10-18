import { useMemo, useState } from 'react';
import { DatePicker } from 'antd';
import { RangePickerDateProps } from 'antd/es/date-picker/generatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { flatbizDate, TAny } from '@hyperse/utils';
import { hooks } from '@wove/react';
import { DayjsDateTypeEnum, TDayjsDateType } from '../_utils/constants.js';
import {
  getDisabledHour,
  getDisabledMinute,
  getDisabledSecond,
} from '../_utils/time.js';

export type DateRangePickerWrapperProps = Omit<
  RangePickerDateProps<TAny>,
  'value' | 'onChange' | 'onCalendarChange' | 'format'
> & {
  value?: [string, string];
  onChange?: (value?: [string, string]) => void;
  /**
   * 1. minDate、maxDate 与 format格式相同；默认：YYYY-MM-DD
   * 2. maxDays 最大可选的天数
   */
  disabledDateConfig?: {
    minDate?: TDayjsDateType;
    maxDate?: TDayjsDateType;
    maxDays?: number;
    /** 禁用 小时 刻度列表，与日期无关  */
    disabledHourList?: number[];
    /** 禁用 分钟 刻度列表，与日期无关 */
    disabledMinuteList?: number[];
    /** 禁用 秒钟 刻度列表，与日期无关 */
    disabledSecondList?: number[];
  };
  format?: TDayjsDateType;
  /** value 输出适配 */
  outputNormalize?: (value: [string, string]) => TAny;
  /** value 输入适配 */
  inputNormalize?: (value?: TAny) => [string, string] | undefined;
};

type RangeValue = [Dayjs | null, Dayjs | null] | null;

/**
 * DatePicker.RangePicker包装组件
 * ```
 * 1. value类型为 [string, string],可以通过 inputNormalize来进行自定义转换
 * 2. onChange返回类型 [string, string]，可以通过 outputNormalize来进行自定义转换
 * 3. 默认格式化类型 YYYY-MM-DD； 当showTime===true时，默认格式化类型YYYY-MM-DD HH:mm:ss；其他格式化类型自定义format
 * 4. 可设置disabledDateConfig，来控制日期项的disbaled状态
 * 5. 设置 disabledDate 后，disabledDateConfig配置将失效
 * 6. 设置 disabledTime 后，内置的disabledTime逻辑将失效
 *
 * TODO: 引用DatePicker.RangePicker TS有问题，待解决
 * TODO: 存在场景缺陷，当设置maxDays、showTime后，在选择单个日期不通过确认按钮直接切换输入框，无法获取回调，无法约束disabledDate
 * ```
 */
export const DateRangePickerWrapper = (props: DateRangePickerWrapperProps) => {
  const {
    value,
    onChange,
    style,
    format,
    onOpenChange: onAntdOpenChange,
    outputNormalize,
    inputNormalize,
    ...otherProps
  } = props;
  const {
    maxDays,
    minDate,
    maxDate,
    disabledHourList,
    disabledMinuteList,
    disabledSecondList,
  } = props.disabledDateConfig || {};
  const minDateTimeDayInst = minDate ? dayjs(minDate) : undefined;
  const maxDateTimeDayInst = maxDate ? dayjs(maxDate) : undefined;

  const [dates, setDates] = useState<RangeValue>(null);
  const [hackValue, setHackValue] = useState<RangeValue>(null);

  const [date1, date2] = useMemo(() => {
    if (inputNormalize) {
      return inputNormalize(value) || [];
    }
    return value || [];
  }, [value]);
  const rangePickerValue = useMemo(() => {
    if (date1 && date2) {
      const newDate1 = flatbizDate.dateNormalize(date1);
      const newDate2 = flatbizDate.dateNormalize(date2);
      return [dayjs(newDate1), dayjs(newDate2)];
    }
    return undefined;
  }, [date1, date2]) as [Dayjs, Dayjs];

  const customFormat = useMemo(() => {
    if (format) return format as string;
    if (props.showTime === true) return DayjsDateTypeEnum.YMDHms;
    return DayjsDateTypeEnum.YMD;
  }, [props.showTime, format]);

  const showTime = useMemo(() => {
    if (props.showTime) return props.showTime;
    if (customFormat && customFormat.includes('HH')) {
      return true;
    }
    return false;
  }, [props.showTime, customFormat]);

  const onChangeDate = hooks.useCallbackRef((dates, dateStrings) => {
    if (dates && dates[0] && dates[1]) {
      if (outputNormalize) {
        onChange?.(outputNormalize(dateStrings) as [string, string]);
      } else {
        onChange?.(dateStrings);
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

    if (!maxDays || (!dates?.[0] && !dates?.[1])) {
      return false;
    }

    const tooLate = dates?.[0] && current.diff(dates[0], 'days') > maxDays - 1;
    const tooEarly = dates?.[1] && dates[1].diff(current, 'days') > maxDays - 1;
    return !!tooEarly || !!tooLate;
  });

  const onOpenChange = (open: boolean) => {
    if (maxDays && maxDays > 0) {
      if (open) {
        setHackValue([null, null]);
        setDates([null, null]);
      } else {
        setHackValue(null);
      }
    }
    onAntdOpenChange?.(open);
  };

  const getDisabledTime = hooks.useCallbackRef((current) => {
    const options = {
      minDateTime: minDateTimeDayInst,
      maxDateTime: maxDateTimeDayInst,
      disabledHourList,
      disabledMinuteList,
      disabledSecondList,
    };
    current = current || dayjs(date1 || new Date());
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

  return (
    <DatePicker.RangePicker
      disabledDate={getDisabledDate}
      disabledTime={getDisabledTime}
      {...otherProps}
      showTime={showTime}
      format={customFormat}
      style={{ width: '100%', ...style }}
      value={(hackValue || rangePickerValue) as any}
      onChange={onChangeDate}
      onOpenChange={onOpenChange}
      onCalendarChange={(val) => setDates(val as RangeValue)}
    />
  );
};
