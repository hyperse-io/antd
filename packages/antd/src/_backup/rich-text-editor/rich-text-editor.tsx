import { useRef, useState } from 'react';
import { useKeyPress } from 'ahooks';
import { message } from 'antd';
import { type Editor as TinyMCEEditor } from 'tinymce';
import { classNames } from '@dimjs/utils';
import { getStrByteLen, type TAny } from '@hyperse/utils';
import { Editor, type IAllProps } from '@tinymce/tinymce-react';
import { hooks } from '@wove/react';
import { Preview } from './preview/preview.jsx';
import './style.less';

export interface RichTextEditorProps
  extends Omit<IAllProps, 'onChange' | 'init'> {
  /** 设置高度，默认：500 */
  height?: number;
  onChange?: (data?: string) => void;
  /** 上传图片服务 */
  onUploadImage?: (file: File) => Promise<string>;
  /** 图片点击预览 */
  imgPreview?: boolean;
  init?: IAllProps['init'] & {
    /**
     * 通过粘贴图片创建的img标签，显示压缩比例，此处min、max是和指图片宽度
     * ```
     * 1. 默认值：[{ min: 0, max: 1000, ratio: 0.5 }, { min: 1000, ratio: 0.3 }]
     * ```
     */
    img_ratio?: { min: number; max?: number; ratio: number }[];
    /**
     *  粘贴文本大小限制
     * ```
     * 1. limit 限制大小，单位KB，例如限制2M，值为2*1024
     * 2. 限制提示文案
     * ```
     */
    paste_text_limit?: {
      limit: number;
      message: string;
    };
    /** 插件添加；自定义plugins后失效 */
    plugins_append?: string;
    /** 工具栏添加；自定义toolbar后失效  */
    toolbar_append?: string;
  };
  /** 点击全屏按钮回调 */
  onFullScreenChange?: (state?: boolean) => void;
  className?: string;
}

/**
 * 富文本编辑器，配置参考tinymce https://www.tiny.cloud/docs/tinymce/6
 * @param props
 * @returns
 * ```
 * 1. 如果需要粘贴上传图片服务，需要提供 onUploadImage 上传图片接口
 * 2. 获取富文本实例，通过onInit(_, editor)函数获取
 * 3. 预览富文本数据，使用 RichTextViewer 组件
 * 4. 添加其他插件使用方式，配置 init.plugins_append、init.toolbar_append
 *    <RichTextEditor init={{ plugins_append: 'codesample', toolbar_append: 'codesample' }} />
 * 5. 可通过设置 init.plugins、init.toolbar 完全自定义插件、工具栏
 * 6. 其他插件
 *    emoticons 表情插件
 * 7. 可通过设置 init.img_ratio 设置通过粘贴上传的图片压缩显示比例
 *    默认比例：[{ min: 0, max: 1000, ratio: 0.5 }, { min: 1000, ratio: 0.3 }]
 * ```
 */
export const RichTextEditor = (props: RichTextEditorProps) => {
  const { onUploadImage, onChange, height, className, ...otherProps } = props;

  const editorRef = useRef<TAny>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const imgRatio = props.init?.img_ratio || [
    { min: 0, max: 1000, ratio: 0.5 },
    { min: 1000, ratio: 0.3 },
  ];

  // const varStyleString = useMemo(() => {
  //   const merge = { ...defaultVarStyle, ...props.varStyle };
  //   let varStyleString = '';
  //   Object.keys(merge).map((key) => {
  //     varStyleString += `${key}:${merge[key]};`;
  //   });
  //   return varStyleString;
  // }, [props.varStyle]);

  useKeyPress(
    () => true,
    (event) => {
      try {
        if (event.type === 'keyup' && event.key === 'Escape') {
          const isFull =
            editorRef.current?.editorContainer.classList.contains(
              'tox-fullscreen'
            );
          if (isFull) {
            editorRef.current?.editorCommands.execCommand('mceFullScreen');
          }
        }
      } catch (_error) {
        // 异常不处理
      }
    },
    {
      events: ['keydown', 'keyup'],
    }
  );

  const onKeyDown = hooks.useCallbackRef((event, editor: TinyMCEEditor) => {
    try {
      if (event.keyCode == 27) {
        const isFull =
          editorRef.current?.editorContainer.classList.contains(
            'tox-fullscreen'
          );
        if (isFull) {
          editorRef.current?.editorCommands.execCommand('mceFullScreen');
        }
      }
    } catch (_error) {
      // 异常不处理
    }
    props.onKeyDown?.(event, editor);
  });

  const onInit = hooks.useCallbackRef((_, editor: TinyMCEEditor) => {
    editorRef.current = editor;
    editor.on('FullscreenStateChanged', (e) => {
      props.onFullScreenChange?.(e.state);
    });
    try {
      editor.iframeElement?.contentDocument?.addEventListener(
        'click',
        (event) => {
          if (props.imgPreview && event.target?.['tagName'] === 'IMG') {
            setPreviewUrl(event.target['src']);
          }
        },
        true
      );
    } catch (_error) {
      //
    }
    otherProps.onInit?.(_, editor);
  });

  const onEditorChange = hooks.useCallbackRef(
    (a: string, editor: TinyMCEEditor) => {
      editorRef.current = editor;
      otherProps.onEditorChange?.(a, editor);
      onChange?.(a);
    }
  );

  const tinymceBaseUrl = 'https://xx.com/tcsk/tinymce@6.4.1';

  const getImgRatio = (width: number) => {
    if (imgRatio.length === 0) return 1;
    for (let index = 0; index < imgRatio.length; index++) {
      const element = imgRatio[index];
      if (element.max) {
        if (width >= element.min && width <= element.max) return element.ratio;
      } else {
        if (width >= element.min) return element.ratio;
      }
    }
    return 1;
  };

  const paste_postprocess = hooks.useCallbackRef((editor, args) => {
    try {
      const nodes = (args.node.children || []) as unknown as HTMLElement[];
      if (nodes.length === 1 && nodes[0].nodeName === 'IMG') {
        nodes[0].setAttribute('style', `display:none`);
        const img = document.createElement('img');
        img.src = nodes[0].getAttribute('src') as string;
        img.onload = () => {
          const ratio = getImgRatio(img.width);
          editor.execCommand(
            'mceInsertContent',
            true,
            `<img src="${img.src}" width="${img.width * ratio}" height="${img.height * ratio}" />`
          );
        };
      }
    } catch (_error) {
      //
    }
  });

  const paste_preprocess = hooks.useCallbackRef((_plugin, args) => {
    const paste_text_limit = props.init?.paste_text_limit;
    if (paste_text_limit) {
      const byteLen = getStrByteLen(args.content);
      if (byteLen > 1024 * paste_text_limit.limit) {
        void message.error(paste_text_limit.message);
        args.content = '';
      }
    }
  });

  return (
    <div className={classNames('v-editor-wrapper', className)}>
      <Editor
        tinymceScriptSrc={`${tinymceBaseUrl}/tinymce.min.js`}
        {...otherProps}
        onInit={onInit}
        onKeyDown={onKeyDown}
        onEditorChange={onEditorChange}
        init={{
          promotion: false,
          language: 'zh-Hans',
          height: height,
          paste_data_images: onUploadImage ? true : false,
          paste_postprocess,
          paste_preprocess,
          autosave_ask_before_unload: false,
          base_url: tinymceBaseUrl,
          autoresize_bottom_margin: 0,
          images_upload_handler: async (blobInfo) => {
            try {
              const blob = blobInfo.blob();
              const file = new File([blob], blob['name'], { type: blob.type });
              const respData = await onUploadImage?.(file);
              return Promise.resolve(respData as string);
            } catch (error: any) {
              return Promise.reject(error?.message || '图片上传异常');
            }
          },
          plugins:
            'lists link image advlist charmap preview fullscreen code table help codesample ' +
            (props.init?.plugins_append || ''),
          toolbar:
            'undo redo fullscreen preview | bold italic underline strikethrough |' +
            'fontsize blocks |' +
            'forecolor backcolor removeformat |' +
            'numlist bullist advlist |' +
            'alignleft aligncenter alignright alignjustify |' +
            'outdent indent |' +
            'hr image link code codesample |' +
            (props.init?.toolbar_append || ''),
          font_size_formats: '8px 10px 12px 14px 16px 18px 24px 36px 48px',
          ...props.init,
          content_style: `img {max-width:100%;} table{width:100%} ${props.init?.content_style}`,
          convert_urls: false,
        }}
      />
      <Preview
        visible={!!previewUrl}
        url={previewUrl}
        close={() => {
          setPreviewUrl('');
        }}
      />
    </div>
  );
};
