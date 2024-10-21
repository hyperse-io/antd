import { createRoot } from 'react-dom/client';
import { Bootstrap } from './bootstrap.js';
import { type BootstrapOptions } from './types/layout.js';

/**
 * ```
 * 1. 外部针对出现 iframe tab标题为未知页面的配置、或者想修改二级页面tab标题的，在main模块中设置
 * window['_iframeTabConfig'] = {
 *  '/system-get/menu3/detail': {
 *    name: '详情',
 *  },
 * };
 * 2. 在后续版本中会废弃`全局拦截model异常处理功能`，废弃ErrorHandling、onSessionExpired、verifySessionExpired三个属性的使用
 * ```
 */
export const bootstrap = (options: BootstrapOptions) => {
  const root = createRoot(document.getElementById('app') as HTMLElement);
  root.render(<Bootstrap {...options} />);
};
