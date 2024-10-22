import { type CSSProperties, type ReactElement, useRef, useState } from 'react';
import { useKeyPress } from 'ahooks';
import { Editor as TinyMCEEditor } from 'tinymce';
import { FullscreenOutlined } from '@ant-design/icons';
import { classNames } from '@dimjs/utils';
import { hooks } from '@wove/react';
import { fbaHooks } from '../fba-hooks/index.js';
import { IconWrapper } from '../icon-wrapper/index.js';
import { RichTextEditor } from '../rich-text-editor/rich-text-editor.jsx';
import './style.less';

type RichTextViewerProps = {
  value: string;
  className?: string;
  style?: CSSProperties;
  fullscreen?: boolean;
  onInit?: (editor: TinyMCEEditor) => void;
  children?: ReactElement;
  fullscreenIconTips?: string;
};

/**
 * 预览 RichTextEditor 生成的富文本数据
 * ```
 * 1. 通过 onInit 属性可获取实例：editor
 * 2. 如果高度发生变更，可执行 editor.execCommand('mceAutoResize');
 *
 * ```
 * @param props
 * @returns
 */
export const RichTextViewer = (props: RichTextViewerProps) => {
  const [isFixed, setIsFixed] = useState(false);
  const editorRef = useRef<TinyMCEEditor>();

  useKeyPress(
    () => true,
    (event) => {
      if (event.type === 'keyup' && event.key === 'Escape' && isFixed) {
        setIsFixed(false);
      }
    },
    { events: ['keydown', 'keyup'] }
  );

  const onChangeFixed = hooks.useCallbackRef(() => {
    setIsFixed(!isFixed);
  });
  const onInit = hooks.useCallbackRef((_, editor: TinyMCEEditor) => {
    editorRef.current = editor;
    props.onInit?.(editor);
  });

  fbaHooks.useEffectCustom(() => {
    editorRef.current?.editorCommands.execCommand('mceAutoResize');
  }, [props.value]);

  return (
    <div
      className={classNames(
        'fba-editor-viewer',
        { 'fba-editor-viewer-fixed': isFixed },
        props.className
      )}
      style={props.style}
    >
      {props.children}
      {props.fullscreen && props.value && (
        <div className="fba-editor-viewer-icon">
          <IconWrapper
            hoverTips={props.fullscreenIconTips}
            icon={<FullscreenOutlined />}
            onClick={onChangeFixed}
          />
        </div>
      )}
      <RichTextEditor
        value={props.value}
        onInit={onInit}
        imgPreview
        disabled
        init={{
          plugins: 'autoresize',
          menubar: false,
          toolbar: '',
          statusbar: false,
        }}
      />
    </div>
  );
};
