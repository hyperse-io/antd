import {
  type CSSProperties,
  Fragment,
  type ReactElement,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Table, type TableProps } from 'antd';
import { classNames } from '@dimjs/utils';
import {
  getUuid,
  isMacEnv,
  isUndefinedOrNull,
  type TAny,
  type TPlainObject,
} from '@hyperse/utils';
import { hooks } from '@wove/react';
import { BlockLayout } from '../block-layout/layout.js';
import { fbaHooks } from '../fba-hooks/index.js';
import { TableScrollbar } from '../table-scrollbar/table-scrollbar.js';
import { EasyTableContext } from './context.js';
import { FoldOperate } from './fold-operate.js';
import {
  useColumnByAsyncColumnRequest,
  useColumnsAppendInnerColumn,
  useColumnsAppendTips,
  useColumnsToHidden,
} from './hooks/columns.js';
import { easyTableModel } from './model.js';
import { type TEasyTableTableColumn } from './type.js';

export type EasyTableTableProps<T> = Omit<
  TableProps<TAny>,
  'dataSource' | 'loading' | 'rowKey' | 'columns'
> & {
  children?: ReactElement | ReactElement[];
  /**
   * 表格行 key 的取值，
   * ```
   * 如果 rowKey 为string类型
   * 1. 组件会判断表格列表数据第一条是否存在当前rowKey对象的数据，如果没有组件内部会动态添加唯一值
   * 2. 基于上一条的逻辑，如果表格数据没有唯一值，可指定 rowKey 值为table数据中不存在的字段名，例如：rowKey="_uid"
   * 3. 如果触发上述逻辑，表格数据中会多出rowKey对应的键值对数据
   * ```
   */
  rowKey: TableProps<TAny>['rowKey'];
  /** table Form 外层 className  */
  tableWrapperStyle?: CSSProperties;
  /** table Form 外层 className  */
  tableWrapperClassName?: string;
  /**
   * ```
   * 1. 当配置了 EasyTable.serviceConfig.dynamicColumsAdapter 后，columns配置只在初始化有效，再次修改无效
   * 2. 可通过 EasyTableRef.onChangeTableColumns 实现 columns 的指定修改
   * ```
   */
  columns: TEasyTableTableColumn<T>[];
  /**
   * 数据加载与表格初始化渲染 是否同步
   * @version 4.4.6
   * ```
   * 1. true：获取数据后再初始化渲染表格（可用于实现表格中defaultXxxx相关功能的使用）
   * ```
   */
  isSync?: boolean;
  /**
   * 空效果显示尺寸，默认值：small
   * @version 4.4.6
   */
  emptyShowSize?: 'small' | 'large';
};

/**
 * 表格渲染
 * @param props
 * ```
 * 1. 继承了 TableProps 可设置antd table功能
 * 2. 分页功能已内置处理，不调用 onChange
 * ```
 */
export const EasyTableTable = <T extends TPlainObject>(
  props: EasyTableTableProps<T>
) => {
  const ctx = useContext(EasyTableContext);
  const { children, rowKey, pagination, isSync, ...otherProps } = props;

  const asyncColumnRequestResultRef = useRef<{
    [dataIndex: string]: {
      respData?: TAny;
      loading?: boolean;
    };
  }>({});
  const [asyncColumnRequestResult, setAsyncColumnRequestResult] = useState<{
    [dataIndex: string]: {
      respData?: TAny;
      loading?: boolean;
    };
  }>({});

  const {
    columnFoldConfig,
    onCloseColumnFoldModal,
    columnFoldOpen,
    onOpenColumnFoldModal,
    asyncColumnRequest,
    showFoldKeyList,
    onChangeShowFoldKeyList,
  } = ctx.dynamicColumnsConfig;

  const {
    modelKey,
    fieldNames,
    onRequest,
    tableDataSource,
    pageSize,
    tableTotal,
    loading,
    paginationFixed,
    onSetPaginationStatus,
  } = ctx;
  const [state] = easyTableModel(modelKey).useStore();

  fbaHooks.useEffectCustom(() => {
    /** 获取初始化 columns 数据 */
    ctx.onSetBaseColumns(
      (props.columns || []) as TEasyTableTableColumn<TPlainObject>[]
    );
  }, []);

  useEffect(() => {
    if (asyncColumnRequest?.length) {
      for (let index = 0; index < asyncColumnRequest.length; index++) {
        const element = asyncColumnRequest[index];
        asyncColumnRequestResultRef.current = {
          ...asyncColumnRequestResultRef.current,
          [element.dataIndex]: { loading: true },
        };
        setAsyncColumnRequestResult(asyncColumnRequestResultRef.current);
        element
          .onRequest()
          .then((respData) => {
            asyncColumnRequestResultRef.current = {
              ...asyncColumnRequestResultRef.current,
              [element.dataIndex]: { loading: false, respData },
            };
            setAsyncColumnRequestResult(asyncColumnRequestResultRef.current);
          })
          .catch((error) => {
            console.error(error?.message);
            asyncColumnRequestResultRef.current = {
              ...asyncColumnRequestResultRef.current,
              [element.dataIndex]: { loading: false },
            };
            setAsyncColumnRequestResult(asyncColumnRequestResultRef.current);
          });
      }
    }
  }, [asyncColumnRequest]);

  const columnsOriginal = useMemo(() => {
    if (ctx.columns) {
      ctx.onSetColumns(ctx.columns);
      return ctx.columns as TEasyTableTableColumn<T>[];
    } else {
      ctx.onSetColumns(props.columns as TEasyTableTableColumn<TPlainObject>[]);
      return props.columns;
    }
  }, [ctx.columns, props.columns]);

  let columnsNew = useColumnsAppendTips({
    columns: [...columnsOriginal],
  });

  const foldColumnList = columnsOriginal.filter((item: TAny) => {
    return !item.hidden && item.isFold && item.dataIndex;
  });

  columnsNew = useColumnsAppendInnerColumn({
    columns: columnsNew,
    foldColumnList,
    showFoldKeyList,
    columnFoldConfig,
    onOpenColumnFoldModal,
    onChangeFoldColumnList: onChangeShowFoldKeyList,
  });

  columnsNew = useColumnsToHidden({
    columns: columnsNew,
    showFoldKeyList,
  });

  columnsNew = useColumnByAsyncColumnRequest({
    columns: columnsNew,
    asyncColumnRequestResult,
  });

  fbaHooks.useEffectCustom(() => {
    onSetPaginationStatus(pagination !== false);
  }, [pagination]);

  // 分页参数发生变更
  hooks.useUpdateEffect(() => {
    if (!paginationFixed) {
      if (pagination !== false) {
        onRequest({
          [fieldNames.pageSize]:
            state.queryCondition[fieldNames.pageSize] || pageSize,
          [fieldNames.pageNo]: 1,
        });
      } else {
        onRequest({
          [fieldNames.pageSize]: undefined,
          [fieldNames.pageNo]: undefined,
        });
      }
    }
  }, [pagination]);

  const tablePaginationData = useMemo(() => {
    if (paginationFixed || pagination === false) return false;
    return {
      showSizeChanger: true,
      current: state.queryCondition[fieldNames.pageNo] || 1,
      pageSize: state.queryCondition[fieldNames.pageSize] || pageSize,
      total: tableTotal,
      showTotal: (total) => `共 ${total} 条记录`,
      ...props.pagination,
      // selectComponentClass: SmallSelect,
    };
  }, [
    fieldNames.pageNo,
    fieldNames.pageSize,
    pageSize,
    pagination,
    paginationFixed,
    props.pagination,
    state.queryCondition,
    tableTotal,
  ]);

  const onChangePage: TableProps<TAny>['onChange'] = (
    pagination,
    filters,
    sorter,
    extra
  ) => {
    if (extra.action === 'paginate' && tablePaginationData) {
      onRequest({
        [fieldNames.pageSize]: pagination.pageSize,
        [fieldNames.pageNo]: pagination.current,
      });
    } else {
      props.onChange?.(pagination, filters, sorter, extra);
    }
  };

  const dataSource = useMemo(() => {
    if (!tableDataSource) return undefined;
    if (tableDataSource.length === 0) {
      return [];
    }
    if (
      typeof rowKey === 'string' &&
      isUndefinedOrNull(tableDataSource[0][rowKey])
    ) {
      return tableDataSource.map((item) => {
        item[rowKey] = getUuid();
        return item;
      });
    }
    return tableDataSource;
  }, [tableDataSource, rowKey]);

  const tableRender = () => {
    if (isSync && !dataSource) {
      return (
        <Fragment>
          {children}
          <Table
            key="1"
            size="small"
            scroll={{ x: 'max-content' }}
            bordered
            rowKey={rowKey as TAny}
            columns={columnsNew}
            loading={loading}
          />
        </Fragment>
      );
    }
    if (isMacEnv()) {
      return (
        <Fragment>
          {children}
          <Table
            key="2"
            size="small"
            scroll={{ x: 'max-content' }}
            bordered
            {...otherProps}
            columns={columnsNew}
            pagination={tablePaginationData}
            rowKey={rowKey}
            onChange={onChangePage}
            loading={loading}
            dataSource={dataSource}
          />
        </Fragment>
      );
    }
    return (
      <Fragment>
        {children}
        <TableScrollbar>
          <Table
            key="3"
            size="small"
            scroll={{ x: 'max-content' }}
            bordered
            {...otherProps}
            columns={columnsNew}
            pagination={tablePaginationData}
            rowKey={rowKey}
            onChange={onChangePage}
            loading={loading}
            dataSource={dataSource}
          />
        </TableScrollbar>
      </Fragment>
    );
  };

  return (
    <BlockLayout
      className={classNames(
        'easy-table-table',
        { 'ett-empty-show-small': props.emptyShowSize === 'small' },
        props.tableWrapperClassName
      )}
      style={props.tableWrapperStyle}
    >
      {tableRender()}

      <FoldOperate
        dataList={foldColumnList as TAny[]}
        onClose={onCloseColumnFoldModal}
        open={columnFoldOpen}
        onChange={onChangeShowFoldKeyList}
        cacheKey={columnFoldConfig?.cacheKey}
        initSelectedRowKeys={showFoldKeyList}
      />
    </BlockLayout>
  );
};
