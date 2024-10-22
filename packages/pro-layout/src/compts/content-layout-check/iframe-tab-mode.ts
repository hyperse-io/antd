import { guessIframeMainLink } from '../../utils/utils.js';

export const currentIsIframe = () => {
  return self != top;
};

/**
 * Iframe Tab 模块使用
 * ```
 * 当Iframe Tab独立访问时，触发逻辑跳转正常访问页面（包含菜单）
 * ```
 */
export const IframeTabMode = (props) => {
  if (!currentIsIframe()) {
    window.location.href = guessIframeMainLink(location.href);
    return null;
  }
  return props.children;
};
