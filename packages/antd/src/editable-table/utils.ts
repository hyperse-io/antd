import { FieldSingleConfig } from './type.js';

export const getEditable = (
  editable: FieldSingleConfig['editable'],
  tableRowIndex: number
) => {
  return typeof editable === 'boolean'
    ? editable
    : editable?.({ tableRowIndex });
};
