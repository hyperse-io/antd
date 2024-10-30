import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useEventListener } from 'ahooks';
import { type MentionProps, Mentions } from 'antd';
import { type TAny, toArray } from '@hyperse/utils';
import { hooks } from '@wove/react';
import { fbaHooks } from '../fba-hooks/index.js';
import {
  getOverallKeyWordsPosition,
  judgmentCursorInKeyWordsPosition,
} from './utils.js';

export type MentionsWrapperRef = {
  getInputInstance: () => any;
};
export type MentionsWrapperProps = Omit<
  MentionProps,
  | 'value'
  | 'onChange'
  | 'onClick'
  | 'onCursorChange'
  | 'options'
  | 'id'
  | 'split'
  | 'validateSearch'
  | 'ref'
  | 'prefix'
> & {
  value?: string;
  onChange?: (value?: string) => void;
  /** 设置列表提示关键字，例如：@、$等 */
  prefix?: string | string[];
  onClick?: (value?: string) => void;
  /** 光标移动回调 */
  onCursorChange?: (position: number) => void;
  /**
   * 输入框内整体关键词列表
   * ```
   * 整体关键词交互
   * 1. 光标可整体移动
   * 2. 光标不会存在关键词内部
   * 3. 删除时，整体删除
   * ```
   */
  options?: string[];
};

/**
 * 基于Antd Mentions进行二次封装，可实现输入内关键字整体控制，包括光标移动、关键词删除等
 * ```
 * 可实现
 * 1. 控制光标输入
 * 2. 可设置关键词，光标不会出现在关键词内部
 * 3. 可整体删除关键词
 *
 * 应用场景例如：
 * 1. 公式输入
 * (【xx金额1】+【xx金额2】)*2
 * <MentionsWrapper prefix="$" options={['【xx金额1】', '【xx金额2】']}/>
 *
 * 2. 短信模板设置
 * 您的订单号为${订单号}，订单交易时间为${订单时间}
 * <MentionsWrapper prefix="$" options={['${订单号}', '${订单时间}']}/>
 *
 * demo：https://xx.xx.com/docs/admin/main/other/widget
 * ```
 *
 */
export const MentionsWrapper = forwardRef<
  MentionsWrapperRef,
  MentionsWrapperProps
>((props: MentionsWrapperProps, ref) => {
  const {
    value,
    onChange,
    onClick,
    onCursorChange,
    onSelect,
    options,
    prefix,
    ...otherProps
  } = props;
  const id = hooks.useId(undefined, 'overall-input');
  const inputInnerRef = useRef<TAny>();
  const [cursorPosition, setCursorPosition] = useState(0);
  const invalidOnChangeRef = useRef(false);
  const valueNew = value || '';
  /** 关键词位置 */
  const overallKeyWordsPosition = useMemo(() => {
    if (options) {
      return getOverallKeyWordsPosition({
        overallKeyWords: options || [],
        value: valueNew,
      });
    }
    return [];
  }, [options, valueNew]);

  const getInputInstance = () => {
    return inputInnerRef.current?.textarea;
  };

  fbaHooks.useEffectCustom(() => {
    onCursorChange?.(cursorPosition || 0);
  }, [cursorPosition]);

  useEventListener(
    'keydown',
    (ev) => {
      const selectionStart = getInputInstance()?.selectionStart as number;
      const selectionEnd = getInputInstance()?.selectionEnd as number;
      if (['ArrowLeft', 'ArrowRight'].includes(ev.code)) {
        let positionValue = 0;
        if (ev.code === 'ArrowLeft') {
          if (selectionStart - 1 < 0) return;
          positionValue = selectionStart - 1;
          setCursorPosition(positionValue);
          const targret = judgmentCursorInKeyWordsPosition({
            keyWordsPosition: overallKeyWordsPosition,
            cursorPosition: positionValue,
          });
          if (targret) {
            getInputInstance()?.setSelectionRange(targret.start, targret.start);
          }
        } else if (ev.code === 'ArrowRight') {
          if (selectionStart + 1 > valueNew.length) return;
          positionValue = selectionStart + 1;
          setCursorPosition(positionValue);
          const targret = judgmentCursorInKeyWordsPosition({
            keyWordsPosition: overallKeyWordsPosition,
            cursorPosition: positionValue,
          });
          if (targret) {
            getInputInstance()?.setSelectionRange(
              targret.end - 1,
              targret.end - 1
            );
          }
        }
      } else if (ev.code === 'Backspace') {
        /** 选中关键字/关键字+文字 的情况，直接删除 */
        if (selectionStart !== selectionEnd) {
          return;
        }
        const targret = judgmentCursorInKeyWordsPosition({
          keyWordsPosition: overallKeyWordsPosition,
          cursorPosition: selectionStart - 1,
        });
        if (targret) {
          invalidOnChangeRef.current = true;
          const result =
            valueNew.substring(0, targret.start - 1) +
            valueNew.substring(targret.end);
          setTimeout(() => {
            getInputInstance()?.setSelectionRange(
              targret.start - 1,
              targret.start - 1
            );
          }, 50);
          if (!result) {
            invalidOnChangeRef.current = false;
          }
          onChange?.(result);
        }
      }
    },
    {
      target: () => {
        return document.querySelector(`#${id}`);
      },
    }
  );

  useEventListener(
    'keyup',
    (ev) => {
      const selectionStart = getInputInstance()?.selectionStart || 0;
      if (['ArrowUp', 'ArrowDown'].includes(ev.code)) {
        setCursorPosition(selectionStart);
        const targret = judgmentCursorInKeyWordsPosition({
          keyWordsPosition: overallKeyWordsPosition,
          cursorPosition: selectionStart,
        });
        if (targret) {
          if (selectionStart - targret.start < targret.end - selectionStart) {
            getInputInstance()?.setSelectionRange(
              targret.start - 1,
              targret.start - 1
            );
          } else {
            getInputInstance()?.setSelectionRange(targret.end, targret.end);
          }
        }
      }
    },
    {
      target: () => {
        return document.querySelector(`#${id}`);
      },
    }
  );

  const onInputChange = hooks.useCallbackRef((value) => {
    if (otherProps.disabled) return;
    if (invalidOnChangeRef.current) {
      invalidOnChangeRef.current = false;
      return;
    }
    const selectionStart = getInputInstance()?.selectionStart || 0;
    setCursorPosition(selectionStart);
    onChange?.(value);
  });

  const onInputClick = hooks.useCallbackRef((event) => {
    const selectionStart = getInputInstance()?.selectionStart || 0;
    setCursorPosition(selectionStart);
    onClick?.(event.target.value);
    const targret = judgmentCursorInKeyWordsPosition({
      keyWordsPosition: overallKeyWordsPosition,
      cursorPosition: selectionStart,
    });
    if (targret) {
      if (selectionStart - targret.start < targret.end - selectionStart) {
        getInputInstance()?.setSelectionRange(
          targret.start - 1,
          targret.start - 1
        );
      } else {
        getInputInstance()?.setSelectionRange(targret.end, targret.end);
      }
    }
  });

  const onHandleSelect = (options, prefix) => {
    const addPos: number = options.value?.length || 0;
    setCursorPosition((prePos) => prePos + addPos);
    if (onSelect) {
      onSelect(options, prefix);
    }
  };

  const mentionOptions = useMemo(() => {
    const prefixList = toArray<string>(prefix);
    return (
      options?.map((item) => {
        let opValue = item;
        for (let index = 0; index < prefixList.length; index++) {
          const element = prefixList[index];
          if (opValue.startsWith(element)) {
            opValue = opValue.replace(element, '');
            break;
          }
        }
        return { label: opValue, value: opValue };
      }) || []
    );
  }, [options, prefix]);

  useImperativeHandle(ref, () => {
    return {
      getInputInstance,
    };
  });

  return (
    <Mentions
      notFoundContent={<div>暂无数据</div>}
      rows={3}
      {...otherProps}
      prefix={prefix}
      style={{ width: '100%', ...otherProps.style }}
      id={id}
      value={valueNew}
      ref={inputInnerRef}
      onSelect={onHandleSelect}
      onChange={onInputChange}
      onClick={onInputClick}
      split=""
      validateSearch={(text: string) => {
        if (!mentionOptions.length) return false;
        const target = mentionOptions.find(
          (item) => text.indexOf(item.value) >= 0
        );
        return target && text.length > target.value.length ? false : true;
      }}
      options={mentionOptions}
    />
  );
});
