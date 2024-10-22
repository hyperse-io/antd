import { extend } from '@dimjs/utils';
import { type TAny } from '../types/index.js';
import { base64ToFile } from './base64-to-file.js';
import { fileToBase64 } from './file-to-base64.js';

export type TImageCompressOptions = {
  /** 质量比例 0~1 */
  quality?: number;
  /** 图片宽高等比缩小 0~1 */
  ratio?: number;
  /**
   * 压缩阀值（单位 MB）
   * 小于阈值不压缩
   */
  threshold?: number;
  /** 压缩后图片格式后缀，如果不设置，则根据图片原格式后缀 */
  suffix?: 'jpg' | 'png';
};

/**
 * 图片压缩
 * ```
 * 只支持 jpg、jpeg、png
 * quality：默认值 0.5
 * ratio: 默认值 1
 * threshold: 默认值 1
 * ```
 */
export const imageCompressToBase64 = (
  imageFile: File,
  options?: TImageCompressOptions
) => {
  const optionsNew = extend({ quality: 0.5, ratio: 1, threshold: 1 }, options);

  return new Promise<{ base64: string; imageName: string; suffix: string }>(
    (resolve, reject) => {
      const suffix = imageFile.name.substring(
        imageFile.name.lastIndexOf('.') + 1,
        imageFile.name.length
      );
      const imageName = imageFile.name.substring(
        0,
        imageFile.name.lastIndexOf('.')
      );
      const imageSuffix = options?.suffix || suffix;
      const base64Suffix =
        imageSuffix.toLocaleLowerCase() === 'jpg' ? 'jpeg' : imageSuffix;
      const isLegal = ['png', 'jpg', 'jpeg'].includes(
        base64Suffix.toLocaleLowerCase()
      );
      void fileToBase64(imageFile)
        .then((imgBase64: string) => {
          let needCompress = true;
          if (!isLegal) {
            console.info(`${suffix} 文件格式不支持压缩`);
            needCompress = false;
          }
          const fileMb = imageFile.size / 1024 / 1024;
          if (fileMb < optionsNew.threshold) {
            needCompress = false;
          }
          if (!needCompress) {
            resolve({
              base64: imgBase64,
              imageName,
              suffix: base64Suffix,
            });
            return;
          }
          const imgage = new Image();
          imgage.src = imgBase64;
          imgage.onload = function () {
            const that = this as TAny;
            const width = that.width * optionsNew.ratio;
            const height = that.height * optionsNew.ratio;
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
            ctx.drawImage(that, 0, 0, width, height);
            const base64 = canvas.toDataURL(
              `image/${base64Suffix}`,
              optionsNew.quality
            );
            resolve({
              base64,
              imageName,
              suffix: base64Suffix,
            });
          };
        })
        .catch(reject);
    }
  );
};

/**
 * 图片压缩
 * ```
 * 只支持 jpg、jpeg、png
 * quality：默认值 0.5
 * ratio: 默认值 1
 * threshold: 默认值 1
 * ```
 */
export const imageCompressToFormData = (
  imageFile: File,
  formDataKey: string,
  options?: TImageCompressOptions
) => {
  return new Promise((resolve, reject) => {
    const suffix = imageFile.name.split('.').at(-1) || '';
    const isLegal = ['png', 'jpg', 'jpeg'].includes(suffix.toLocaleLowerCase());
    if (!isLegal) {
      console.info(`${suffix} 文件格式不支持压缩`);
      const formData = new FormData();
      formData.append(formDataKey, imageFile);
      resolve(formData);
      return;
    }
    void imageCompressToBase64(imageFile, options)
      .then((compressInfo) => {
        const { base64, imageName, suffix } = compressInfo;
        const array = [] as number[];
        const bytes = window.atob(base64.split(',')[1]);
        for (let i = 0; i < bytes.length; i++) {
          array.push(bytes.charCodeAt(i));
        }
        const blob = new Blob([new Uint8Array(array)], {
          type: `image/${suffix}`,
        });
        const formData = new FormData();
        formData.append(formDataKey, blob, `${imageName}.${suffix}`);
        resolve(formData);
      })
      .catch(reject);
  });
};

/**
 * 图片压缩
 * ```
 * 只支持 jpg、jpeg、png
 * quality：默认值 0.5
 * ratio: 默认值 1
 * threshold: 默认值 1
 * ```
 */
export const imageCompressToFile = (
  imageFile: File,
  options?: TImageCompressOptions
) => {
  const suffix = imageFile.name.split('.').at(-1) || '';
  const isLegal = ['png', 'jpg', 'jpeg'].includes(suffix.toLocaleLowerCase());
  if (!isLegal) {
    console.info(`${suffix} 文件格式不支持压缩`);
    return imageFile;
  }
  return new Promise<File>((resolve, reject) => {
    void imageCompressToBase64(imageFile, options)
      .then((compressInfo) => {
        const { base64, imageName, suffix } = compressInfo;
        const file = base64ToFile(base64, `${imageName}.${suffix}`);
        resolve(file);
      })
      .catch(reject);
  });
};
