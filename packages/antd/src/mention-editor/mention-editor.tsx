import { type ReactElement, useMemo, useRef } from 'react';
import { Button, Flex } from 'antd';
import { type TAny } from '@hyperse/utils';
import { hooks } from '@wove/react';
import {
  MentionsWrapper,
  type MentionsWrapperProps,
} from '../mentions-wrapper/index.js';
import { type ParamItem } from './types.js';

export type OperationPresetProps = {
  /** icon */
  icon: ReactElement;
  /** 模版参数文案 */
  label?: string;
  /** 模版参数类型 */
  type: string;
  /** 自增code前缀 */
  codePrefix: string;
  /** 自定义生成模版参数code */
  codeAdapter?: () => string | undefined;
};

export type MentionEditorProps = Omit<MentionsWrapperProps, 'prefix'> & {
  /**
   * onChange
   * @item 点击的预设模版参数
   */
  onSelectParam?: (item: ParamItem, prefix?: string) => void;
  /** 模版参数前缀 & ｜ $ */
  prefix?: string;
  /** editor 支持添加的模版参数类型 */
  operations?: OperationPresetProps[];
  /** 模版参数列表 */
  params?: ParamItem[] | undefined;
};

/**
 * 基于MentionWrapper封装的模版字符串配置组件
 * 1. 提供变量，数字，链接等可选的模版参数
 * 2. 不同类型模版参数可配置多个
 * 3. mention 会根据 传入的params自动推断出关键字
 * 4. 模版参数建议都以${_xxx}为格式
 * 5. Demo: https://xx.xx.com/docs/admin/main/widget?key=mention-editor
 */
export const MentionEditor = (props: MentionEditorProps) => {
  const iMap = useRef<Record<string, number>>({});
  const mentionRef = useRef<TAny>();
  const curPosition = useRef<number>(0);

  const { prefix, operations = [], ...otherProps } = props;

  const onAddParam = (opt: OperationPresetProps) => {
    let content = props.value || '';
    const position = inputInstance?.selectionStart || curPosition.current;
    const param =
      opt.codeAdapter?.() || `${opt.codePrefix}${getIndex(opt.codePrefix)}`;
    const addPos = param.length + (prefix?.length || 0) + 2;
    if (content) {
      content =
        content.slice(0, position) +
        getOptionCode(param) +
        content.slice(position);
    } else {
      content = getOptionCode(param);
    }
    props.onChange?.(content);
    if (props.onSelectParam) {
      props.onSelectParam(
        {
          code: param,
          type: opt.type as any,
          value: undefined,
        },
        prefix
      );
    }
    curPosition.current += addPos;
  };

  const onInputBlur = (e) => {
    curPosition.current = props.value?.length || 0;
    if (props.onBlur) {
      props.onBlur(e);
    }
  };

  const getOptionCode = hooks.useCallbackRef((code: string) => {
    return (prefix || '') + '{' + code + '}';
  });

  const getIndex = hooks.useCallbackRef((code) => {
    const indexMap = iMap.current;
    if (indexMap[code] >= 0) {
      indexMap[code] += 1;
    } else {
      indexMap[code] = 0;
    }
    return indexMap[code];
  });

  const inputInstance = useMemo(() => {
    return mentionRef.current ? mentionRef.current.getInputInstance() : null;
  }, [mentionRef.current]);

  const options = useMemo(() => {
    const options = (props.params || []).map((item) =>
      getOptionCode(item.code)
    );
    const optionSet = new Set(options);
    return Array.from(optionSet);
  }, [props.params]);

  return (
    <div>
      {operations && operations.length > 0 && (
        <Flex gap={4} style={{ marginBottom: 8 }}>
          {operations.map((operation) => {
            return (
              <Button
                key={operation.type}
                type="text"
                icon={operation.icon}
                onClick={() => onAddParam(operation)}
              >
                {operation.label && <span>{operation.label}</span>}
              </Button>
            );
          })}
        </Flex>
      )}
      <MentionsWrapper
        {...otherProps}
        ref={mentionRef}
        prefix={prefix}
        options={options}
        value={props.value}
        onBlur={onInputBlur}
        onChange={props.onChange}
        onCursorChange={(position) => {
          curPosition.current = position;
        }}
      />
    </div>
  );
};
