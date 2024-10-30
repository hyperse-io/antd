export type varStyles =
  | '--fa-color-primary'
  | '--fa-color-secondary'
  | '--fa-color-warning'
  | '--fa-color-danger'
  | '--fa-color-success'
  | '--editor-card-bgcolor';

export const defaultVarStyle: Record<varStyles, string> = {
  '--fa-color-primary': '#1677ff',
  '--fa-color-secondary': '#1677ff',
  '--fa-color-warning': '#ff8f1f',
  '--fa-color-danger': '#ff3141',
  '--fa-color-success': '#00b578',
  '--editor-card-bgcolor': '#f5f5f9',
};
