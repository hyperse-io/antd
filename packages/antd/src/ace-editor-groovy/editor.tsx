import { useMemo, useRef, useState } from 'react';
import Ace, { type IAceEditorProps } from 'react-ace';
import { isObject } from '@dimjs/lang';
import { classNames } from '@dimjs/utils';
import {
  isUndefinedOrNull,
  type TAny,
  type TPlainObject,
} from '@hyperse/utils';
import { hooks } from '@wove/react';
import { ErrorBoundaryWrapper } from '../error-boundary-wrapper/error-boundary.js';
import 'ace-builds/src-noconflict/ext-language_tools.js';
import 'ace-builds/src-noconflict/mode-groovy.js';
import 'ace-builds/src-noconflict/snippets/groovy.js';

export type AceEditorGroovyProps = Omit<
  IAceEditorProps,
  'mode' | 'value' | 'onChange' | 'theme'
> & {
  /** 编辑器高度，默认值：100%，可输入值例如 300px、100% */
  height?: string;
  value?: string | TPlainObject | TPlainObject[];
  onChange?: (value?: string | TPlainObject | TPlainObject[]) => void;
  /** 配置输入自动提示关键字 */
  autoCompleterList?: { name: string; desc?: string }[];
  /**
   * 编辑器主题配置，例如：github、terminal、xcode
   * ```
   * 1. 顶部引入 import 'ace-builds/src-noconflict/theme-xxxx';
   * 2. 配置 theme = xxxx
   * ```
   */
  theme?: string;
};

/**
 * groovy编辑器
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
export const AceEditorGroovy = (props: AceEditorGroovyProps) => {
  const { value, onChange, height, autoCompleterList, onLoad, ...otherProps } =
    props;
  const heightFt = isUndefinedOrNull(height) ? '100%' : height;

  const [rootNodekey, setRootNodekey] = useState(Date.now());

  const editorRef = useRef<TAny>();

  const valueNew = useMemo(() => {
    if (isObject(value)) {
      return JSON.stringify(value, null, 2);
    }
    return value as string | undefined;
  }, [value]);

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

  return (
    <div
      key={rootNodekey}
      className={classNames('ace-editor-groovy', props.className)}
      style={{ height: heightFt, ...props.style }}
    >
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
          // theme={'github'}
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
          mode="groovy"
          onLoad={onLoadHandle}
          onChange={onChange}
          value={valueNew}
        />
      </ErrorBoundaryWrapper>
    </div>
  );
};
