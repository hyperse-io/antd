import {
  CSSProperties,
  Fragment,
  ReactElement,
  useMemo,
  useRef,
  useState,
} from 'react';
import Ace, { type IAceEditorProps } from 'react-ace';
import { isObject } from '@dimjs/lang';
import { classNames } from '@dimjs/utils';
import {
  isUndefinedOrNull,
  jsonStringToJsonObject,
  type TAny,
  type TPlainObject,
} from '@hyperse/utils';
import { hooks } from '@wove/react';
import { ButtonWrapper } from '../button-wrapper/button-wrapper.js';
import { ErrorBoundaryWrapper } from '../error-boundary-wrapper/error-boundary.js';
import { FlexLayout } from '../flex-layout/flex-layout.js';
import 'ace-builds/src-noconflict/ext-language_tools.js';
import 'ace-builds/src-noconflict/mode-json.js';
import 'ace-builds/src-noconflict/snippets/json.js';

export type AceEditorJsonProps = Omit<
  IAceEditorProps,
  'mode' | 'value' | 'onChange' | 'theme'
> & {
  /** 编辑器高度，默认值：100%，可输入值例如 300px、100% */
  height?: string;
  value?: string | TPlainObject | TPlainObject[];
  onChange?: (value?: string | TPlainObject | TPlainObject[]) => void;
  /** 配置输入自动提示关键字 */
  autoCompleterList?: { name: string; desc?: string }[];
  /** 是否隐藏【验证数据】按钮 */
  hiddenVerifyBtn?: boolean;
  /** 是否隐藏内部验证异常文案 */
  hiddenErrorMsg?: boolean;
  /**
   * 编辑器主题配置，例如：github、terminal、xcode
   * ```
   * 1. 顶部引入 import 'ace-builds/src-noconflict/theme-xxxx';
   * 2. 配置 theme = xxxx
   * ```
   */
  theme?: string;
  /** 底部额外布局 */
  footerExtraRender?: (children: ReactElement) => ReactElement;
  footerStyle?: CSSProperties;
};

/**
 * Json编辑器
 * ```
 * 1. 受控组件，需要使用value、onChange配合显示数据
 * 2. heigth 默认为100%，如果外层无高度，需要自定义设置height属性
 * 3. 通过 autoCompleterList 配置自动提示关键字
 * 4. 通过 hiddenVerifyBtn 配置隐藏底部操作按钮
 * 5. 通过 theme 配置编辑器主题，例如：
 *    5.1 顶部引入 import 'ace-builds/src-noconflict/theme-xxxx';
 *    5.2 配置 theme = xxxx
 * ```
 */
export const AceEditorJson = (props: AceEditorJsonProps) => {
  const {
    value,
    onChange,
    height,
    hiddenVerifyBtn,
    autoCompleterList,
    onLoad,
    hiddenErrorMsg,
    ...otherProps
  } = props;
  const heightFt = isUndefinedOrNull(height) ? '100%' : height;

  const [rootNodekey, setRootNodekey] = useState(Date.now());
  const [errorMsg, setErrorMsg] = useState<string>();

  const editorRef = useRef<TAny>();

  const valueNew = useMemo(() => {
    if (isObject(value)) {
      return JSON.stringify(value, null, 2);
    }
    return value as string | undefined;
  }, [value]);

  const handleChange = hooks.useCallbackRef((content: string) => {
    if (errorMsg) {
      setErrorMsg(undefined);
    }
    onChange?.(content);
  });

  const getCompletions = hooks.useCallbackRef((_a, _b, _c, _d, callback) => {
    callback(
      null,
      autoCompleterList?.map((item) => ({
        name: item.name,
        value: item.name,
        // score: 100,
        meta: item.desc,
      }))
    );
  });

  const onLoadHandle = (editor) => {
    editorRef.current = editor;
    /** 向编辑器中添加自动补全列表 */
    const findIndex = editor.completers.findIndex(
      (item) => item.id === 'custom'
    );
    if (findIndex >= 0) {
      editor.completers[findIndex] = { getCompletions, id: 'custom' };
    } else {
      editor.completers.push({ getCompletions, id: 'custom' });
    }
    onLoad?.(editor);
  };

  const inputValueVerify = (inputValue: string) => {
    try {
      const result = jsonStringToJsonObject(inputValue);
      onChange?.(result);
    } catch (_error: TAny) {
      setErrorMsg('数据解析异常，正确格式：{"name":"张三", "age": 20}');
    }
  };
  const footer = (
    <Fragment>
      <ButtonWrapper
        hidden={hiddenVerifyBtn === true}
        type="primary"
        block={false}
        ghost
        onClick={() => {
          const currentValue = editorRef.current?.getValue();
          if (!currentValue) {
            onChange?.(currentValue);
            return;
          }
          inputValueVerify(currentValue);
        }}
      >
        验证&格式化数据
      </ButtonWrapper>
      {!hiddenErrorMsg && errorMsg ? (
        <span style={{ color: 'red', marginLeft: 10 }}>{errorMsg}</span>
      ) : null}
    </Fragment>
  );

  return (
    <FlexLayout
      fullIndex={0}
      className={classNames('ace-editor-json', props.className)}
      style={{ height: heightFt, ...props.style }}
      key={rootNodekey}
    >
      <div className="aej-content">
        <ErrorBoundaryWrapper
          onRenderReset={() => {
            onChange?.(undefined);
            setRootNodekey(Date.now());
          }}
        >
          <Ace
            fontSize={14}
            showPrintMargin={true}
            showGutter={true}
            highlightActiveLine={true}
            height="100%"
            width="auto"
            placeholder="请输入"
            {...otherProps}
            setOptions={{
              useWorker: false,
              enableBasicAutocompletion: false,
              enableLiveAutocompletion: true,
              enableSnippets: false,
              showLineNumbers: true,
              tabSize: 2,
              ...otherProps.setOptions,
            }}
            mode="json"
            onLoad={onLoadHandle}
            onChange={handleChange}
            onBlur={(_event, editor) => {
              const value = editor?.getValue();
              if (value) {
                inputValueVerify(value);
              }
            }}
            value={valueNew}
          />
        </ErrorBoundaryWrapper>
      </div>
      <div
        className="ace-editor-json-footer"
        style={{ marginTop: 10, ...props.footerStyle }}
      >
        {props.footerExtraRender ? (
          props.footerExtraRender(footer)
        ) : (
          <Fragment>{footer}</Fragment>
        )}
      </div>
    </FlexLayout>
  );
};
