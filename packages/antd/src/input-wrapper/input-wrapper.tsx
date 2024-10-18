import { useRef, useState } from 'react';
import { Input, InputProps } from 'antd';
import { isUndefinedOrNull, TAny } from '@hyperse/utils';
import { hooks } from '@wove/react';
import { fbaHooks } from '../fba-hooks/index.js';

export type InputWrapperProps = Omit<InputProps, 'defaultValue'> & {
  // 防抖触发时间，单位毫秒 默认值：0
  debounceDuration?: number;
};

/**
 * ```
 * 1. 在输入框内输入拼音的时候，在拼音尚未输入完成时，字母会触发Input的onChange事件；导致以上效果的原因是input事件没办法知道我们在使用中文输入法
 * 2. 此处封装可以解决此问题，在输入拼音未完成时不会触达onChange，选择拼音结果触发onChange
 *
 * 3. 设置value时，内部可将受控操作转为非受控操作（具体实现逻辑，自行查看源码）
 * 4. 适用场景：需要通过onChange事件处理业务逻辑，例如：在onChange中调用接口数据
 * 5. defaultValue不可使用
 * 6. 可设置防抖执行时间
 * ```
 */
export const InputWrapper = (props: InputWrapperProps) => {
  const { value, debounceDuration, ...otherProps } = props;
  const inputValueRef = useRef<string>();
  const isFirstUseValueRef = useRef(true);
  const [inputKey, setInputKey] = useState(0);

  fbaHooks.useEffectCustom(() => {
    if (isUndefinedOrNull(value) && isFirstUseValueRef.current) return;
    isFirstUseValueRef.current = false;
    if (value === inputValueRef.current && !isUndefinedOrNull(value)) return;
    setInputKey(Date.now());
  }, [value]);

  const onChange = hooks.useDebounceCallback((event) => {
    if (event.nativeEvent['inputType'] === 'insertCompositionText') {
      return;
    }
    inputValueRef.current = event.target.value;
    props.onChange?.(event);
  }, debounceDuration || 0);

  const onCompositionEnd = hooks.useCallbackRef((event) => {
    onChange(event);
  });

  return (
    <Input
      {...otherProps}
      key={inputKey}
      onCompositionEnd={onCompositionEnd}
      onChange={onChange}
      defaultValue={value as TAny}
    />
  );
};
