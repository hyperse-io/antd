import { PdfDocument } from './document.jsx';
import { PdfPage } from './page.jsx';

/**
 * pdf预览
 * ```
 * 使用方式：在cdn.ts中引入 '//xx.com/react/pdf@3.2.146/pdf.min.js'
 * Git: https://github.com/mozilla/pdfjs-dist/tree/master
 * Demo: https://xx.xx.com/docs/admin/main/file/pdf
 * Demo: https://xx.xx.com/docs/admin/main/file/pdf-seal
 * ```
 */
export const Pdf = {
  Document: PdfDocument,
  Page: PdfPage,
};
