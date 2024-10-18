import { createContext } from 'react';

export type EditableFieldContextContextApi = {
  readonly?: boolean;
  showEditable?: boolean;
  showEditableIcon?: boolean;
  isCtx: boolean;
};

export const EditableFieldContext =
  createContext<EditableFieldContextContextApi>({
    readonly: false,
    showEditable: true,
    showEditableIcon: true,
    isCtx: false,
  });
