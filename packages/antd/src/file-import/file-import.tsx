import { isValidElement, type ReactElement, useState } from 'react';
import { Button, message, Upload, type UploadProps } from 'antd';
import { type TAny } from '@hyperse/utils';
import { hooks } from '@wove/react';

export type FileImportProps = {
  /** 上传文件接口返回处理 */
  onImportFinish: (data?: TAny) => void;
  buttonName?: string | ReactElement;
  children?:
    | React.ReactNode
    | ((data: { loading: boolean }) => React.ReactNode);
} & Omit<
  UploadProps,
  | 'fileList'
  | 'showUploadList'
  | 'itemRender'
  | 'listType'
  | 'multiple'
  | 'previewFile'
  | 'progress'
  | 'onChange'
  | 'onDownload'
  | 'onRemove'
  | 'onPreview'
  | 'directory'
  | 'customRequest'
  | 'defaultFileList'
  | 'iconRender'
>;

/**
 * 文件导入
 * ```
 * demo：https://fex.qa.tcshuke.com/docs/admin/main/widget?key=file-export
 * 1. accept默认值 '.xlsx,.xls',
 * 2. formData 上传key默认值 file
 * 
 * 例如：
   <FileImport
     action={'https://xxx/xxx/xx'}
     onImportFinish={(data) => {
       console.log('上传接口响应数据', data);
     }}
   >
     <Button>文件上传</Button>
   </FileImport>
 * ```
 */
export const FileImport = (props: FileImportProps) => {
  const { onImportFinish, buttonName, ...otherProps } = props;

  const [loading, setLoading] = useState(false);

  const onChange = hooks.useCallbackRef((info) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
    } else if (info.file.status === 'done') {
      setLoading(false);
      const respData = info.file.response;
      if (respData.code === '0000') {
        onImportFinish(respData.data);
      } else {
        void message.error((respData.message as string) || '文件导入异常...');
      }
    }
  });

  return (
    <Upload
      showUploadList={false}
      maxCount={1}
      {...otherProps}
      onChange={onChange}
    >
      {typeof props.children === 'function' ? (
        props.children?.({ loading })
      ) : isValidElement(props.children) ? (
        props.children
      ) : (
        <Button type="primary" ghost loading={loading}>
          {buttonName || '选择文件'}
        </Button>
      )}
    </Upload>
  );
};

FileImport.defaultProps = {
  name: 'file',
  accept: '.xlsx,.xls',
};
