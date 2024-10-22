import { Fragment, type ReactNode, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';
import { Button, message, Upload, type UploadProps } from 'antd';
import { type UploadChangeParam } from 'antd/lib/upload';
import {
  type UploadFile,
  type UploadListType,
} from 'antd/lib/upload/interface.js';
import { PlusOutlined } from '@ant-design/icons';
import { isPlainObject } from '@dimjs/lang';
import { classNames, extend } from '@dimjs/utils';
import {
  isUndefinedOrNull,
  type TAny,
  toArray,
  type TPlainObject,
} from '@hyperse/utils';
import { hooks } from '@wove/react';
import { fbaHooks } from '../fba-hooks/index.js';
import './style.less';

export type UploadWrapperFileItem = {
  uid: string;
  name: string;
  url?: string;
};

export type UploadWrapperProps<T extends TPlainObject = TPlainObject> = {
  value?: T[] | T;
  onChange?: (value?: T[]) => void;
  onUploadError?: (message?: string) => void;
  onUploadChange?: (info: UploadChangeParam<UploadFile>) => void;
  /**
   * 属性取值映射
   */
  fieldNames?: {
    uid: string;
    name?: string;
    url?: string;
  };
  /**
   * 接口响应数据适配器，如果配置了fieldNames，适配器返回值会再进过fieldNames转换
   */
  onRequestResultAdapter?: (respData: TAny) => TPlainObject;
  /** 操作触发显示文本 */
  triggerText?: string;
  /** 超过maxCount 隐藏上传入口  */
  limitHidden?: boolean;
  /**
   * 自动提交，默认：true
   * ```
   * 1. 自定义beforeUpload配置后 autoSubmit 失效
   * ```
   */
  autoSubmit?: boolean;
} & Omit<UploadProps, 'onChange' | 'fileList'>;

/**
 * 文件上传
 * ```
 * demo: https://fex.qa.tcshuke.com/docs/admin/main/file/upload
 * 1. 可通过配置children替换默认上传触发布局
 * 2. 接口返回结构：
 *    formData上传接口返回值
 *    {
 *     code: '0000',
 *     data: {
 *       uid: '唯一值，可使用fileKey值'
 *       name: '文件名称'
 *       url: '预览地址'
 *     }
 *    }
 * 3. 如果接口返回的不是上面的字段名称，可通过fieldNames配置接口返回字段名称映射
 *
 * 4. 最佳使用方式，与Form结合使用
 * <Form.Item name="attachmentList" label="附件">
 *   <UploadWrapper action={uploadUrl} />
 * </Form.Item>
 *
 * 5. 回填数据结构
 * [{
 *    uid: '唯一值',
 *    name（非必填）: 'image.png',
 *    url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
 *  }]
 * 其中 uid、name、url 可为其他命名，通过 fieldNames 进行映射即可
 * ```
 *
 */
export const UploadWrapper = (props: UploadWrapperProps) => {
  const {
    onChange,
    onUploadError,
    value,
    triggerText,
    limitHidden,
    autoSubmit,
    ...otherProps
  } = props;
  const valueList = isUndefinedOrNull(value)
    ? undefined
    : toArray<TPlainObject>(value);
  const [uploadList, setUploadList] = useState<UploadWrapperFileItem[]>();
  const fieldNames = extend(
    {
      uid: 'uid',
      name: 'name',
      url: 'url',
    },
    props.fieldNames
  ) as Required<UploadWrapperFileItem>;

  fbaHooks.useEffectCustom(() => {
    const errorList =
      uploadList?.filter((item) => item['status'] === 'error') || [];
    let newList = [] as TAny[];
    valueList?.forEach((item) => {
      // 判断item 为 File类型
      if (item['lastModified']) {
        newList.push(item);
      } else {
        newList.push({
          uid: item[fieldNames.uid],
          name: item[fieldNames.name],
          url: item[fieldNames.url],
          status: 'done',
          isOriginal: true,
          responseData: item['responseData'],
        });
      }
    });
    if (errorList.length > 0) {
      const newErrorList = errorList.map((item) => {
        return {
          uid: item.uid,
          name: item.name,
          status: 'error',
          isOriginal: true,
          response: item['response'],
        };
      }) as TAny[];
      newList = newList.concat(newErrorList);
    }
    setUploadList(newList as TAny[]);
  }, [fieldNames.name, fieldNames.uid, fieldNames.url, valueList]);

  const handleResponse = (fileList: UploadFile<TAny>[]) => {
    const newFileList: TAny[] = [];
    let hasError = false;
    fileList.forEach((item) => {
      if (item['isOriginal']) {
        if (item['status'] !== 'error') {
          newFileList.push({
            [fieldNames.uid]: item.uid,
            [fieldNames.name]: item.name,
            [fieldNames.url]: item.url,
          });
        }
      } else if (isPlainObject(item.response)) {
        if (item.response.code === '0000') {
          const respData = item.response.data;
          const result = (props.onRequestResultAdapter?.(respData) ||
            respData) as TPlainObject;
          newFileList.push({
            [fieldNames.uid]: result[fieldNames.uid] || item.uid,
            [fieldNames.name]: result[fieldNames.name] || item.name,
            [fieldNames.url]: result[fieldNames.url],
            responseData: respData,
          });
        } else {
          const errorMsg = item.response.message || '上传失败';
          hasError = true;
          item.status = 'error';
          item.response = item.response.message || '上传失败';
          if (onUploadError) {
            onUploadError?.(errorMsg);
          } else {
            void message.error('上传操作失败...');
          }
        }
      }
    });
    if (hasError) {
      setUploadList([...fileList] as UploadWrapperFileItem[]);
    }
    onChange?.(newFileList);
  };

  const onUploadChange = hooks.useCallbackRef((info) => {
    const fileList = info.fileList as TPlainObject[];
    if (info.file.status === 'done') {
      const newFileList = [...info.fileList];
      const donwList = newFileList.filter(
        (item) => item.status === 'done' || item['isOriginal']
      );

      const allDone = donwList.length === newFileList.length;
      if (allDone) {
        handleResponse(newFileList);
      }
      flushSync(() => setUploadList(newFileList));
      return;
    } else if (info.file.status === 'removed') {
      const uid = info.file.uid;
      const targetList = valueList !== undefined ? [...valueList] : [];
      const targetIndex = targetList.findIndex((item) => {
        const tempUid = item[fieldNames.uid] || item.uid;
        return tempUid === uid;
      });
      if (targetIndex >= 0) {
        targetList.splice(targetIndex, 1);
      }
      onChange?.(targetList);
    } else if (info.file.status === 'error') {
      if (onUploadError) {
        onUploadError();
      } else {
        void message.error('上传操作失败...');
      }
    }
    // https://github.com/ant-design/ant-design/issues/2423
    setUploadList([...fileList] as UploadWrapperFileItem[]);
    props.onUploadChange?.(info);
  });

  const hiddenEmtry = useMemo(() => {
    if (otherProps.maxCount === undefined || !limitHidden) return false;
    if (otherProps.maxCount === 0) return true;
    if (uploadList && uploadList.length >= otherProps.maxCount) return true;
    return false;
  }, [limitHidden, otherProps.maxCount, uploadList]);

  const beforeUpload = (_file, fileList) => {
    if (autoSubmit === false) {
      const maxCount = otherProps.maxCount;
      let mergeList = [...(valueList || []), ...fileList];
      let uploadListMerge = [...(uploadList || []), ...fileList];
      if (maxCount !== undefined && maxCount !== null) {
        if (mergeList.length > maxCount) {
          mergeList = mergeList.slice(mergeList.length - maxCount);
          uploadListMerge = uploadListMerge.slice(
            uploadListMerge.length - maxCount
          );
        }
      }
      setUploadList(uploadListMerge);
      props.onChange?.(mergeList);
      return false;
    }
    return true;
  };

  return (
    <Upload
      beforeUpload={beforeUpload}
      {...otherProps}
      onChange={onUploadChange}
      fileList={uploadList}
      className={classNames('v-upload-wrapper', otherProps.className)}
    >
      {otherProps.disabled || hiddenEmtry ? null : (
        <UploadTrigger triggerText={triggerText} listType={otherProps.listType}>
          {props.children}
        </UploadTrigger>
      )}
    </Upload>
  );
};

const UploadTrigger = (props: {
  listType?: UploadListType;
  children?: ReactNode | ReactNode[];
  triggerText?: string;
}) => {
  if (props.children) return <Fragment>{props.children}</Fragment>;
  if (props.listType === 'picture-card') {
    return (
      <div>
        <PlusOutlined />
        <div style={{ marginTop: 8 }}>{props.triggerText || '上传图片'}</div>
      </div>
    );
  }
  if (props.listType === 'picture') {
    return (
      <Button type="primary" ghost>
        {props.triggerText || '选择图片上传'}
      </Button>
    );
  }
  return (
    <Button type="primary" ghost>
      {props.triggerText || '选择文件上传'}
    </Button>
  );
};
