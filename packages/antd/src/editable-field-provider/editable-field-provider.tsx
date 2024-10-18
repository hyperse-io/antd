import { ReactElement } from 'react';
import { EditableFieldContext } from './context.js';

export interface EditableFieldProviderProps {
  children: ReactElement;
  /** 是否只读 */
  readonly?: boolean;
  /** 是否编辑状态 */
  showEditable?: boolean;
  /** 是否显示编辑操作按钮 */
  showEditableIcon?: boolean;
}

/**
 * EditableFieldProvider 控制内部使有的 EditableField 状态
 * @param props
 * @returns
 */
export const EditableFieldProvider = (props: EditableFieldProviderProps) => {
  const readonly = props.readonly;

  const showEditable = props === undefined ? true : props.showEditable;

  return (
    <EditableFieldContext.Provider
      value={{
        readonly,
        isCtx: true,
        showEditableIcon: props.showEditableIcon,
        showEditable,
      }}
    >
      {props.children}
    </EditableFieldContext.Provider>
  );
};
