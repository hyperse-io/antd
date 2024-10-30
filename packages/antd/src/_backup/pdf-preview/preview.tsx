import { useMemo, useRef, useState } from 'react';
import { Result } from 'antd';
import { classNames } from '@dimjs/utils';
import { generateIntArray } from '@hyperse/utils';
import { hooks } from '@wove/react';
import { Pdf } from '../pdf/index.js';
import { Navigation } from './navigation.jsx';
import './style.less';

export type PdfPreviewProps = {
  pdfUrl: string;
  /** 缩放比例，默认值：1 */
  scale?: number;
  className?: string;
  /** 导航pdf，缩放比例，默认值：0.2 */
  navigationScale?: number;
  /** 隐藏导航栏 */
  hiddenNavigation?: boolean;
  /** 导航栏宽度，默认值：200 */
  navigationWidth?: number;
};

/**
 * pdf预览
 * ```
 * 使用方式：在cdn.ts中引入 '//xx.com/react/pdf@3.2.146/pdf.min.js'
 * Git: https://github.com/mozilla/pdfjs-dist/tree/master
 * Demo: https://xx.xx.com/docs/admin/main/file/pdf
 * Demo: https://xx.xx.com/docs/admin/main/file/pdf-seal
 * ```
 */
export const PdfPreview = (props: PdfPreviewProps) => {
  const [numPages, setNumPages] = useState(0);
  const dpfDoucmentRef = useRef<HTMLDivElement>(null);
  const [activePagination, setActivePagination] = useState(1);
  const [pdfPageHeight, setPdfPageHeight] = useState(0);

  const pageGap = 10;

  const onDocumentLoadSuccess = hooks.useCallbackRef((inst) => {
    setNumPages(inst.numPages);
  });

  /** 计算 page 在文档流中的高度范围，包含竖直方向间距 */
  const pdfPageListHeightScope = useMemo(() => {
    if (!numPages) return [];
    const pageHeightScopeList: number[][] = [];
    generateIntArray(0, numPages).forEach((item) => {
      if (item === 0) {
        pageHeightScopeList.push([0, pdfPageHeight]);
      } else {
        const x = pdfPageHeight * item + item * pageGap;
        pageHeightScopeList.push([x, x + pdfPageHeight]);
      }
    });
    return pageHeightScopeList;
  }, [numPages, pdfPageHeight]);

  const onDocumentCenterScroll = (event) => {
    const scrollTop = event.target.scrollTop;
    const scrollHeight = dpfDoucmentRef.current?.clientHeight as number;
    for (let index = 0; index < pdfPageListHeightScope.length; index++) {
      const element = pdfPageListHeightScope[index];
      if (element[1] - scrollTop >= scrollHeight / 2) {
        setActivePagination(index + 1);
        break;
      }
    }
  };

  const pdfContentNodeId = hooks.useId(undefined, 'pdf-content-node');

  return (
    <Pdf.Document
      pdfUrl={props.pdfUrl}
      onLoadSuccess={onDocumentLoadSuccess}
      error={
        <Result
          status="500"
          title="PDF加载异常"
          subTitle={`PDF地址：${props.pdfUrl}`}
        />
      }
      className={classNames('v-pdf-preview-document', props.className)}
    >
      {!props.hiddenNavigation ? (
        <div className="v-pdf-preview-navigation">
          <Navigation
            numPages={numPages}
            activeNumber={activePagination}
            onChangeActiveNumber={setActivePagination}
            scale={props.navigationScale}
            navigationWidth={props.navigationWidth}
            pdfPageListHeightScope={pdfPageListHeightScope}
            pdfContentNodeId={pdfContentNodeId}
          />
        </div>
      ) : null}

      <div
        className="v-pdf-preview-content"
        onScroll={onDocumentCenterScroll}
        ref={dpfDoucmentRef}
        id={pdfContentNodeId}
      >
        {numPages > 0
          ? generateIntArray(1, numPages + 1).map((item) => {
              return (
                <Pdf.Page
                  key={item}
                  pageNumber={item}
                  scale={props.scale}
                  gap={pageGap}
                  onRenderSuccess={(node) => {
                    const h = Math.floor(node.height);
                    setPdfPageHeight(h);
                  }}
                  style={{ display: 'flex', justifyContent: 'center' }}
                ></Pdf.Page>
              );
            })
          : null}
      </div>
    </Pdf.Document>
  );
};
