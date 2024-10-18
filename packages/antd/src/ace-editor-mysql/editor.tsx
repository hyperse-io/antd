import { CSSProperties, ReactElement, useRef, useState } from 'react';
import type { IAceEditorProps } from 'react-ace';
import Ace from 'react-ace';
import { format } from 'sql-formatter';
import { classNames } from '@dimjs/utils';
import { type TAny } from '@hyperse/utils';
import { hooks } from '@wove/react';
import { ButtonWrapper } from '../button-wrapper/button-wrapper.js';
import { ErrorBoundaryWrapper } from '../error-boundary-wrapper/error-boundary.js';
import 'ace-builds/src-noconflict/ext-language_tools.js';
import 'ace-builds/src-noconflict/mode-mysql';
import 'ace-builds/src-noconflict/snippets/mysql';

const formatSql = (sqlContent: string) => {
  return format(sqlContent, { language: 'sql' })
    .replace(/\$ /g, '$')
    .replace(/\{ /g, '{')
    .replace(/ \}/g, '}');
};

export type AceEditorMysqlProps = Omit<
  IAceEditorProps,
  'theme' | 'mode' | 'value' | 'onChange'
> & {
  /** 编辑器高度，默认值：100%，可输入值例如 300px、100% */
  height?: string;
  value?: string;
  onChange?: (value?: string) => void;
  /** 配置输入自动提示关键字 */
  autoCompleterList?: { name: string; desc?: string }[];
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

export const AceEditorMysql = (props: AceEditorMysqlProps) => {
  const [rootNodekey, setRootNodekey] = useState(Date.now());
  const {
    value,
    hiddenFormatterBtn,
    autoCompleterList,
    onChange,
    onLoad,
    ...otherProps
  } = props;

  const editorRef = useRef<TAny>();

  const handleChange = hooks.useCallbackRef((content: string) => {
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

  const footer = (
    <ButtonWrapper
      hidden={hiddenFormatterBtn === true}
      type="primary"
      ghost
      onClick={() => {
        const currentValue = editorRef.current?.getValue();
        onChange?.(formatSql(currentValue || ''));
      }}
    >
      美化
    </ButtonWrapper>
  );

  return (
    <div
      key={rootNodekey}
      className={classNames('ace-editor-mysql', props.className)}
      style={props.style}
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
          placeholder="输入SQL"
          height="250px"
          width="auto"
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
          mode="mysql"
          onLoad={onLoadHandle}
          onChange={handleChange}
          value={value}
        />
      </ErrorBoundaryWrapper>
      <div
        className="ace-editor-mysql-footer"
        style={{ marginTop: 10, ...props.footerStyle }}
      >
        {props.footerExtraRender ? props.footerExtraRender(footer) : footer}
      </div>
    </div>
  );
};
