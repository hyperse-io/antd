import { type ReactElement, type ReactNode, useState } from 'react';
import { Result, Spin } from 'antd';
import { classNames } from '@dimjs/utils';
import { fbaHooks } from '../../fba-hooks/index.js';
import { CtxProvider } from './context.js';
import './style.less';

type PdfProps = {
  pdfUrl: string;
  onLoadError?: (error: any) => void;
  onLoadSuccess?: (pdfInstance: any) => void;
  children: ReactNode;
  error?: ReactElement | ((error) => ReactElement);
  className?: string;
};

export const PdfDocument = (props: PdfProps) => {
  const [pdfInstance, setPdfInstance] = useState<any>();
  const [errorInst, setErrorInst] = useState<any>();

  fbaHooks.useEffectCustomAsync(async () => {
    const { pdfjsLib } = globalThis as any;
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      '//xx.com/react/pdf@3.2.146/pdf.worker.min.js';
    try {
      const loadingTask = pdfjsLib.getDocument(props.pdfUrl);
      const pdfInstance = await loadingTask.promise;
      setPdfInstance(pdfInstance);
      props.onLoadSuccess?.(pdfInstance);
    } catch (error: any) {
      console.error(error);
      props.onLoadError?.(error);
      setErrorInst(error);
    }
  }, [props.pdfUrl]);

  const getPdfInstance = () => {
    return pdfInstance;
  };

  if (errorInst) {
    if (props.error) {
      return typeof props.error === 'function'
        ? props.error(errorInst)
        : props.error;
    }
    return (
      <Result
        status="error"
        title="PDF加载异常"
        subTitle={errorInst?.message}
      ></Result>
    );
  }

  if (pdfInstance) {
    return (
      <CtxProvider value={{ getPdfInstance }}>
        <div className={classNames('v-pdf-document', props.className)}>
          {props.children}
        </div>
      </CtxProvider>
    );
  }

  return (
    <div className="v-pdf-document-init-loading">
      <Spin />
    </div>
  );
};
