import { Fragment, isValidElement, type ReactElement } from 'react';
import { message } from 'antd';

export type FileExportProps = {
  /** 触发节点 */
  action:
    | (ReactElement & { onClick?: (e) => void })
    | ((data: { onClick: (e) => void }) => ReactElement);
  /**
   * 获取文件流数据
   * ```
   * 1. fileName 文件名称
   * 2. data 文件流
   * ```
   */
  onRequest: () => Promise<{ fileName: string; data: Blob }>;
  /** 导出操作前 */
  onExportPre?: () => void;
  /** 导出操作后 */
  onExportNext?: () => void;
  /** 导出操作失败，隐藏默认失败效果 */
  onExportError?: (error?: any) => void;
};

/**
 * 文件导出
 * ```
 * demo：https://xx.xx.com/docs/admin/main/widget?key=file-export
 * 例如：
   <FileExport
     action={<Button>下载</Button>}
     onRequest={() => {
       return serviceHandle.fileExport('/export/file', {});
     }}
     onExportNext={() => {
       message.success('导出成功...');
     }}
   />
 * ```
 */
export const FileExport = (props: FileExportProps) => {
  const Action = props.action;

  const handleOnClick = async () => {
    try {
      props.onExportPre?.();
      const respData = await props.onRequest();
      const link = document.createElement('a');
      const url = window.URL.createObjectURL(respData.data);
      link.style.display = 'none';
      link.href = url;
      link.setAttribute('download', respData.fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      props.onExportNext?.();
    } catch (error: any) {
      if (props.onExportError) {
        props.onExportError(error);
      } else {
        message.error(error?.message || '文件导出失败...');
      }
    }
  };

  return (
    <Fragment>
      {isValidElement(Action) ? (
        <Action.type {...Action.props} onClick={handleOnClick} />
      ) : (
        Action?.({ onClick: handleOnClick })
      )}
    </Fragment>
  );
};
