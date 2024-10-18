import { CSSProperties, ReactElement, useMemo, useRef, useState } from 'react';
import Ace, { type IAceEditorProps } from 'react-ace';
import { Space } from 'antd';
import xmlFormat from 'xml-formatter';
import { isObject } from '@dimjs/lang';
import {
  isUndefinedOrNull,
  type TAny,
  type TPlainObject,
} from '@hyperse/utils';
import { hooks } from '@wove/react';
import { ButtonWrapper } from '../button-wrapper/button-wrapper.js';
import { ErrorBoundaryWrapper } from '../error-boundary-wrapper/error-boundary.js';
import { FlexLayout } from '../flex-layout/flex-layout.js';
import { validateXML } from './validate-xml.js';
import 'ace-builds/src-noconflict/ext-language_tools.js';
import 'ace-builds/src-noconflict/mode-xml.js';
import 'ace-builds/src-noconflict/snippets/xml.js';

export type AceEditorXmlProps = Omit<
  IAceEditorProps,
  'mode' | 'value' | 'onChange' | 'theme'
> & {
  /** 编辑器高度，默认值：100%，可输入值例如 300px、100% */
  height?: string;
  value?: string | TPlainObject | TPlainObject[];
  onChange?: (value?: string | TPlainObject | TPlainObject[]) => void;
  /** 配置输入自动提示关键字 */
  autoCompleterList?: { name: string; desc?: string }[];
  /** 隐藏【验证数据】按钮 */
  hiddenVerifyBtn?: boolean;
  /** 是否隐藏内部验证异常文案 */
  hiddenErrorMsg?: boolean;
  /** 隐藏【美化】按钮 */
  hiddenFormatterBtn?: boolean;
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
 * xml编辑器
 * ```
 * 1. 受控组件，需要使用value、onChange配合显示数据
 * 2. heigth 默认为100%，如果外层无高度，需要自定义设置height属性
 * 3. 通过 autoCompleterList 配置自动提示关键字
 * 4. 通过 hiddenVerifyBtn、hiddenFormatterBtn可隐藏底部操作按钮
 * 5. 通过 theme 配置编辑器主题，例如：
 *    5.1 顶部引入 import 'ace-builds/src-noconflict/theme-xxxx';
 *    5.2 配置 theme = xxxx
 * ```
 */
export const AceEditorXml = (props: AceEditorXmlProps) => {
  const {
    value,
    onChange,
    height,
    hiddenVerifyBtn,
    hiddenFormatterBtn,
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
    const result = validateXML(inputValue);
    if (result.result) {
      onChange?.(inputValue);
    } else {
      setErrorMsg(result.message);
    }
  };

  const footer = (
    <Space style={{ alignItems: 'flex-start' }}>
      <ButtonWrapper
        hidden={hiddenFormatterBtn === true}
        type="primary"
        ghost
        onClick={() => {
          const currentValue = editorRef.current?.getValue();
          onChange?.(xmlFormat(currentValue || ''));
        }}
      >
        美化
      </ButtonWrapper>
      <ButtonWrapper
        hidden={hiddenVerifyBtn === true}
        type="primary"
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
        <span
          style={{ color: 'red' }}
          dangerouslySetInnerHTML={{ __html: errorMsg }}
        ></span>
      ) : null}
    </Space>
  );

  return (
    <FlexLayout
      fullIndex={0}
      className="ace-editor-xml"
      key={rootNodekey}
      style={{ height: heightFt }}
    >
      <div className="aex-content">
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
            mode="xml"
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
        className="ace-editor-xml-footer"
        style={{ marginTop: 10, ...props.footerStyle }}
      >
        {props.footerExtraRender ? props.footerExtraRender(footer) : footer}
      </div>
    </FlexLayout>
  );
};
