import { createContext } from 'react';
import { type FormInstance } from 'antd';
import { noop, type TPlainObject } from '@hyperse/utils';
import {
  type EasyTableProps,
  type EasyTableRefApi,
  type TEasyTableTableColumn,
} from './type.js';

export type EditableFieldContextContextApi = {
  modelKey: string;
  onRequest: (params?: TPlainObject) => void;
  tableDataSource?: TPlainObject[];
  tableTotal: number;
  loading?: boolean;
  fieldNames: TPlainObject;
  pageSize: number;
  initialValues?: TPlainObject;
  onSetPaginationStatus: (status: boolean) => void;
  getPaginationStatus: () => boolean;
  onFormFinish?: (values?: TPlainObject) => void;
  form: FormInstance;
  getEasyTableRef: () => EasyTableRefApi;
  paginationFixed: boolean;
  foldKeys: string[];
  onSetBaseColumns: (
    baseColumns?: TEasyTableTableColumn<TPlainObject>[]
  ) => void;
  onSetColumns: (columns?: TEasyTableTableColumn<TPlainObject>[]) => void;
  columns?: TEasyTableTableColumn<TPlainObject>[];
  dynamicColumnsConfig: {
    showFoldKeyList: string[];
    onChangeShowFoldKeyList: (keys: string[]) => void;
    columnFoldOpen: boolean;
    columnFoldConfig?: EasyTableProps['columnFoldConfig'];
    onOpenColumnFoldModal: () => void;
    onCloseColumnFoldModal: () => void;
    asyncColumnRequest?: EasyTableProps['asyncColumnRequest'];
  };
};

export const EasyTableContext = createContext<EditableFieldContextContextApi>({
  onRequest: noop,
  tableList: [],
  getEasyTableRef: () => {
    //
  },
} as unknown as EditableFieldContextContextApi);
