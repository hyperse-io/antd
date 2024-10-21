import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { Form, Input } from 'antd';
import { isArray } from '@dimjs/lang';
import { TAny } from '@hyperse/utils';
import { hooks } from '@wove/react';
import {
  DateRangePickerWrapper,
  DateRangePickerWrapperProps,
} from '../date-range-picker-wrapper/date-range-picker-wrapper.jsx';
import { fbaHooks } from '../fba-hooks/index.js';
import {
  FormItemWrapper,
  FormItemWrapperProps,
} from '../form-item-wrapper/form-item-wrapper.jsx';
import { FormItemNamePath } from '../types/index.js';

export type DateRangePickerWrapperFormItemProps = Omit<
  FormItemWrapperProps,
  'name'
> & {
  /**
   * 开始的时间name
   */
  startName: FormItemNamePath;
  /**
   * 结束的时间name
   */
  endName: FormItemNamePath;
  /**
   * 如果 DateRangePickerWrapperFormItem 在Form.List场景下 必传
   */
  formListName?: FormItemNamePath;
  dateRangePickerWrapperProps?: DateRangePickerWrapperProps;
};
/**
 * 包含了Form.Item组件的时间区间选择组件
 * ```
 * 1. 时间区间组件可以定义成两个字段操作，不用再通过数组处理
 * 2. 会在form中产生一个 `__#invalid_date_xxxx_xxxx` 的无效字段，可以直接忽略
 * ```
 */
export const DateRangePickerWrapperFormItem = (
  props: DateRangePickerWrapperFormItemProps
) => {
  const {
    startName,
    endName,
    formListName,
    dateRangePickerWrapperProps,
    ...otherProps
  } = props;
  const form = Form.useFormInstance();
  const bodyName = useMemo(() => {
    if (isArray(startName) && isArray(endName)) {
      const startNameNew = startName as string[];
      const endNameNew = endName as string[];
      return startNameNew
        .slice(0, startNameNew.length - 1)
        .concat(
          `__#invalid_date_${startNameNew[startNameNew.length - 1]}_${endNameNew[endNameNew.length - 1]}`
        );
    }
    return `__#invalid_date_${startName}_${endName}`;
  }, [startName, endName]);

  const startNameMerge = useMemo(() => {
    return formListName
      ? ([] as (string | number)[]).concat(formListName, startName)
      : startName;
  }, [startName, formListName]);

  const endNameMerge = useMemo(() => {
    return formListName
      ? ([] as (string | number)[]).concat(formListName, endName)
      : endName;
  }, [endName, formListName]);

  const startVal = Form.useWatch(startNameMerge, form);
  const endVal = Form.useWatch(endNameMerge, form);
  // const bodyVal = Form.useWatch(bodyName, form);

  const preValue1 = fbaHooks.usePrevious(startVal);
  const preValue2 = fbaHooks.usePrevious(endVal);

  fbaHooks.useEffectCustom(() => {
    const name = formListName
      ? ([] as (string | number)[]).concat(formListName, bodyName)
      : bodyName;
    if (startVal && endVal) {
      form.setFields([{ name, value: [startVal, endVal] }]);
    }
    if (preValue1 && preValue2 && !startVal && !endVal) {
      form.setFields([{ name, value: undefined }]);
    }
  }, [startVal, endVal]);

  const reftest = useRef<InputContentRef>(null);
  const reftest2 = useRef<InputContentRef>(null);

  const onChange = hooks.useCallbackRef((data) => {
    form.setFields([
      { name: startNameMerge, value: data?.[0] },
      { name: endNameMerge, value: data?.[1] },
    ]);
    // 为了解决 外部Form onValuesChange获取到操作值
    reftest.current?.onChange?.(data?.[0]);
    reftest2.current?.onChange?.(data?.[1]);
    dateRangePickerWrapperProps?.onChange?.(data);
  });

  return (
    <>
      <Form.Item name={startName} hidden>
        <InputContent ref={reftest} />
      </Form.Item>
      <Form.Item name={endName} hidden>
        <InputContent ref={reftest2} />
      </Form.Item>
      <FormItemWrapper {...otherProps} name={bodyName}>
        <DateRangePickerWrapper
          {...dateRangePickerWrapperProps}
          onChange={onChange}
        />
      </FormItemWrapper>
    </>
  );
};

type InputContentProps = {
  onChange?: (data: TAny) => void;
  value?: string;
};

type InputContentRef = {
  onChange?: (data: TAny) => void;
};

const InputContent = forwardRef<InputContentRef, InputContentProps>(
  (props, ref) => {
    useImperativeHandle(ref, () => {
      return {
        onChange: (startVal) => {
          props.onChange?.(startVal);
        },
      };
    });

    return <Input value={props.value} />;
  }
);
