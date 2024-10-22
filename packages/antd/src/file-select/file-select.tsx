import { type ReactElement, useState } from 'react';
import { Button, Upload } from 'antd';
import { type RcFile } from 'antd/es/upload';
import { classNames } from '@dimjs/utils';
import { isUndefinedOrNull } from '@hyperse/utils';
import { hooks } from '@wove/react';
import './style.less';

export type FileSelectProps = {
  buttonName?: string | ReactElement;
  children?: React.ReactNode;
  /** 上传按钮与文件排版 默认：horizontal */
  direction?: 'horizontal' | 'hertical';
  /** 可选择文件格式，默认：.xlsx,.xls */
  accept?: string;
  onChange?: (file?: RcFile) => void;
  className?: string;
};

/**
 * 文件选择，内部不调用服务上传
 * ```
 * 默认选择文件格式：.xlsx,.xls
 * ```
 */
export const FileSelect = (props: FileSelectProps) => {
  const { buttonName } = props;
  const [fileList, setFileList] = useState<RcFile[]>([]);
  const direction = isUndefinedOrNull(props.direction)
    ? 'horizontal'
    : props.direction;

  const beforeUpload = hooks.useCallbackRef((file) => {
    setFileList([file]);
    props.onChange?.(file);
    return false;
  });

  const onChange = hooks.useCallbackRef((info) => {
    if (info?.file?.status === 'removed') {
      setFileList([]);
      props.onChange?.();
    }
  });

  return (
    <Upload
      showUploadList={true}
      onChange={onChange}
      maxCount={1}
      beforeUpload={beforeUpload}
      fileList={fileList}
      accept={props.accept || '.xlsx,.xls'}
      className={classNames(
        'file-select',
        { 'file-select-horizontal': direction === 'horizontal' },
        props.className
      )}
    >
      {props.children ? (
        props.children
      ) : (
        <Button type="primary" ghost>
          {buttonName || '选择文件'}
        </Button>
      )}
    </Upload>
  );
};
