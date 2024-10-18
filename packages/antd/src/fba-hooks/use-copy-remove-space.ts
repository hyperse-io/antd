import { TAny, trim } from '@hyperse/utils';
import { useEffectCustom } from './use-effect-custom.js';

const innerIgnoreClass = [
  'ace_editor',
  'tox-tinymce',
  'cancel-flatbiz-antd-copy',
];

export type CopyRemoveSpaceProps = {
  /** 设置监听复制范围，如果不设置则监听全局 */
  target?: () => Element;
  /**
   * 忽略的class配置（不参与copy逻辑处理的class），例如：['ace_editor']
   * ```
   * 1. 某些控件（例如：ace编辑器、富文本等）内部自定义处理copy逻辑，此处不能进行拦截，通过配置class属性来忽略
   * 2. ignoreClass可配置操作目标class、以及层层父节点class，通过目标节点以及层层父节点的class与ignoreClass匹配成功后，取消后续copy文案处理逻辑
   * ```
   */
  ignoreClass?: string[];
};
/**
 * 移除复制文本中前后空格
 * ```
 * 1. target 设置监听复制范围，如果不设置则监听全局，例如
 *    export const Demo = () => {
 *      const ref = useRef<any>();
 *      useCopyRemoveSpace({
 *        target: () => ref.current,
 *      });
 *      return (
 *        <div ref={ref}>
 *          <QueryTable />
 *        </div>
 *      );
 *    };
 * 2. 某些控件（例如：ace编辑器、富文本等）内部自定义处理copy逻辑，此处不能进行拦截，通过配置class属性来忽略
 * 3. ignoreClass包括操作目标class、以及层层父节点class，通过目标节点层层父节点的class匹配成功后，取消后续copy文案处理逻辑
 * 3. ignoreClass 内置有 ['ace_editor', 'tox-tinymce', 'cancel-flatbiz-antd-copy']
 * ```
 */
export const useCopyRemoveSpace = (props?: CopyRemoveSpaceProps) => {
  const ignoreClass = innerIgnoreClass.concat(props?.ignoreClass || []);
  const target = props?.target?.() || window.document;

  useEffectCustom(() => {
    const handle = (oEvent) => {
      try {
        let parentNode = oEvent.target as HTMLElement;
        let isIgnore = false;
        while (parentNode != null) {
          const target = ignoreClass.find((item) =>
            parentNode.classList?.contains(item)
          );
          if (target) {
            isIgnore = true;
            break;
          }
          parentNode = parentNode.parentNode as HTMLElement;
        }
        if (isIgnore) return;
        let copyInfo = '';
        // 获取复制信息
        const _window = window as TAny;
        try {
          copyInfo = window['document']['selection'].createRange().text;
        } catch (_error) {
          copyInfo = _window.getSelection().toString();
        }
        let clipboardData = _window.clipboardData; // for IE
        if (!clipboardData) {
          clipboardData = oEvent['clipboardData'];
        }
        const nextValue = trim(copyInfo, true);
        // 修改剪贴板中的内容
        clipboardData.setData('Text', nextValue);
        // 必须禁用原copy方法才能生效
        oEvent.preventDefault();
        if (nextValue !== copyInfo) {
          console.log('useCopyRemoveSpace 已操作移除复制文本中前后空格');
        }
      } catch (error: TAny) {
        console.warn(error?.message);
      }
    };
    target.addEventListener('copy', handle);
    return () => {
      target.removeEventListener('copy', handle);
    };
  }, [JSON.stringify(ignoreClass)]);
};
