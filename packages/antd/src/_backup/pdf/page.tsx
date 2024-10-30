import { type CSSProperties, type ReactNode, useState } from 'react';
import { Spin } from 'antd';
import { classNames } from '@dimjs/utils';
import { hooks } from '@wove/react';
import { fbaHooks } from '../../fba-hooks/index.js';
import { getCtx } from './context.js';
import './style.less';

type PdfProps = {
  onRenderSuccess?: (pageInstance: any, pdfInstance: any) => void;
  onRenderError?: (error: any, pdfInstance: any) => void;
  /** pdf page宽度，高度根据比例适配 */
  width?: number;
  /** 缩放比例，默认值：1，配置此参数后 width 属性失效，例如：1、0.6、0.8 */
  scale?: number;
  /** pdf页面上下之间的间隙，默认值10 */
  gap?: number;
  /** 页码 */
  pageNumber: number;
  children?: ReactNode;
  onClick?: (e) => void;
  className?: string;
  style?: CSSProperties;
};

export const PdfPage = (props: PdfProps) => {
  const ctx = getCtx();
  const pdfInstance = ctx.getPdfInstance();
  const id = hooks.useId(undefined, `v-pdf-page-${props.pageNumber}`);
  const [spinning, setSpinning] = useState(true);

  const numPages = pdfInstance.numPages as number;

  fbaHooks.useEffectCustom(() => {
    pdfInstance.getPage(props.pageNumber).then(function (page) {
      const scale = props.scale || 1;
      let viewport = page.getViewport({ scale: scale });
      const customWidth = props.width;

      const canvas = document.getElementById(id) as any;
      const context = canvas.getContext('2d');

      if (customWidth && !props.scale) {
        const ratio = customWidth / viewport.width;
        viewport = page.getViewport({ scale: ratio });
      }
      let cssUnits = window.devicePixelRatio;
      cssUnits = cssUnits <= 1 ? 96 / 72 : cssUnits;
      canvas.width = Math.floor(viewport.width * cssUnits);
      canvas.height = Math.floor(viewport.height * cssUnits);

      canvas.style.width = viewport.width + 'px';
      canvas.style.height = viewport.height + 'px';

      const renderContext = {
        transform: [cssUnits, 0, 0, cssUnits, 0, 0],
        canvasContext: context,
        viewport: viewport,
      };
      const renderTask = page.render(renderContext);
      renderTask.promise
        .then(function () {
          props.onRenderSuccess?.(
            {
              width: viewport.width,
              height: viewport.height,
              scale: scale,
              pageNumber: props.pageNumber,
              page,
            },
            pdfInstance
          );
          setSpinning(false);
        })
        .catch((error: any) => {
          console.error(error?.message);
          props.onRenderError?.(error, pdfInstance);
          setSpinning(false);
        });
    });
  }, [pdfInstance, props.scale, props.pageNumber]);

  const gap = typeof props.gap === 'undefined' ? 10 : props.gap;

  const style = numPages !== props.pageNumber ? { marginBottom: gap } : {};

  return (
    <div
      className={classNames('v-pdf-page', props.className)}
      style={{
        ...style,
        ...props.style,
      }}
      onClick={props.onClick}
    >
      <Spin spinning={spinning}>
        <canvas id={id}></canvas>
      </Spin>
      {props.children}
    </div>
  );
};
