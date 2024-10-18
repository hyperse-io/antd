import { PdfDocument } from './document.js';
import { PdfPage } from './page.js';

/**
 * pdf预览
 * ```
 * 使用方式：在cdn.ts中引入 '//file.40017.cn/tcsk/react/pdf@3.2.146/pdf.min.js'
 * Git: https://github.com/mozilla/pdfjs-dist/tree/master
 * Demo: https://fex.qa.tcshuke.com/docs/admin/main/file/pdf
 * Demo: https://fex.qa.tcshuke.com/docs/admin/main/file/pdf-seal
 * ```
 */
export const Pdf = {
  Document: PdfDocument,
  Page: PdfPage,
};
