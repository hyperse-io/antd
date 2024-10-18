import {
  cloneElement,
  type CSSProperties,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Form, message } from 'antd';
import { isArray, isString, isUndefined } from '@dimjs/lang';
import { cloneState } from '@dimjs/model';
import { classNames, get } from '@dimjs/utils';
import {
  localStorageCache,
  type TAny,
  type TPlainObject,
} from '@hyperse/utils';
import { hooks } from '@wove/react';
import { fbaHooks } from '../fba-hooks/index.js';
import { PaginationWrapper } from '../pagination-wrapper/index.js';
import { EasyTableContext } from './context.js';
import { FoldOperateDropdown } from './fold-operate-dropdown.js';
import { easyTableModel } from './model.js';
import {
  type EasyTableProps,
  type EasyTableRefApi,
  type TEasyTableTableColumn,
} from './type.js';
import './style.less';

export const EasyTable = forwardRef<EasyTableRefApi, EasyTableProps>(
  (props, ref) => {
    const [dataSource, setDataSource] = useState<TPlainObject[]>();
    const [total, setTotal] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const easyTableId = hooks.useId(undefined, 'easy-table-key');
    const columnFoldConfig = props.columnFoldConfig;
    const asyncColumnRequest = props.asyncColumnRequest;

    const [columnFoldOpen, setColumnFoldOpen] = useState(false);

    const [showFoldKeyList, setShowFoldKeyList] = useState<string[]>(() => {
      if (columnFoldConfig?.cacheKey) {
        const cacheValue = localStorageCache.get(
          `easy_tab_${columnFoldConfig.cacheKey}`
        );
        const cacheKeyList = isArray(cacheValue?.keys)
          ? ((cacheValue?.keys as TPlainObject[])?.filter((item) =>
              isString(item)
            ) as string[])
          : [];
        return cacheKeyList.length > 0
          ? cacheKeyList
          : columnFoldConfig?.initSelectedKeys || [];
      } else {
        return columnFoldConfig?.initSelectedKeys || [];
      }
    });

    const modelKey = useMemo(() => {
      if (props.cacheSwitch === true) {
        return location.pathname;
      }
      if (typeof props.cacheSwitch === 'string') {
        return props.cacheSwitch;
      }
      return easyTableId;
    }, [easyTableId, props.cacheSwitch]);

    const [state, actions] = easyTableModel(modelKey).useStore();
    const pageSize = props.pageSize || 10;
    const initRequest =
      props.initRequest === undefined ? true : props.initRequest;
    const paginationStatusRef = useRef(false);
    const respOriginalDataRef = useRef<TAny>();
    const baseColumnsRef = useRef<TEasyTableTableColumn<TPlainObject>[]>([]);
    const [dynamicColumns, setDynamicColumns] =
      useState<TEasyTableTableColumn<TPlainObject>[]>();

    const columnsRef = useRef<TEasyTableTableColumn<TPlainObject>[]>([]);

    const fieldNames = {
      list: 'list',
      total: 'total',
      pageNo: 'pageNo',
      pageSize: 'pageSize',
      ...props.fieldNames,
    };

    const [form] = Form.useForm(props.form);

    const onInnerRequest = hooks.useCallbackRef(async (params) => {
      try {
        if (props.breforeRequest) {
          try {
            await props.breforeRequest(form);
          } catch (_error) {
            return;
          }
        }
        setLoading(true);
        const allState = await actions.updateFilterCondition(params);
        const queryCondition = cloneState(allState.queryCondition || {});
        const {
          requestParamsAdapter,
          onRequest,
          requestResultAdapter,
          dynamicColumsAdapter,
        } = props.serviceConfig;
        const paramsNew = requestParamsAdapter
          ? requestParamsAdapter(queryCondition)
          : queryCondition;
        const respData = (await onRequest(paramsNew)) || {};
        respOriginalDataRef.current = respData;
        props.onDataSourceChange?.(respData);
        let respDataNew: TPlainObject = respData;
        if (requestResultAdapter) {
          respDataNew = requestResultAdapter(respData);
        }
        if (dynamicColumsAdapter) {
          const dynamicColumns = dynamicColumsAdapter(
            respData,
            baseColumnsRef.current
          );
          /** 不要添加默认值  */
          setDynamicColumns(dynamicColumns);
        }
        const respList = get(respDataNew, fieldNames.list);
        setDataSource(isArray(respList) ? respList : []);
        setTotal(get(respDataNew, fieldNames.total));
        setLoading(false);
      } catch (error: any) {
        setLoading(false);
        if (props.onRequestErrorHandle) {
          props.onRequestErrorHandle(error);
        } else {
          void message.error(error.message);
        }
      }
    });

    fbaHooks.useEffectCustom(() => {
      const hasPagination = getPaginationStatus();
      if (initRequest !== false || !state.isInit) {
        if (hasPagination) {
          void onInnerRequest({
            [fieldNames.pageNo]: 1,
            [fieldNames.pageSize]: pageSize,
            ...props.initialValues,
            ...state.queryCondition,
          });
        } else {
          void onInnerRequest(props.initialValues);
        }
      } else {
        void actions.updateFilterCondition(props.initialValues);
      }
      void actions.updateInitStatus();
    }, []);

    const clearQueryCondition = hooks.useCallbackRef(
      async (values?: TPlainObject) => {
        await actions.resetFilterCondition();
        form.resetFields();
        if (values) {
          void actions.updateFilterCondition(values);
          form.setFieldsValue(values);
        }
      }
    );

    const updateQueryCondition = hooks.useCallbackRef(
      async (values: TPlainObject) => {
        await actions.updateFilterCondition(values);
        form.setFieldsValue(values);
      }
    );

    const getPaginationData = (pageNo: number, _pageSize: number) => {
      if (getPaginationStatus()) {
        return {
          [fieldNames.pageNo]: pageNo,
          [fieldNames.pageSize]: _pageSize || pageSize,
        };
      } else {
        return {
          [fieldNames.pageNo]: undefined,
          [fieldNames.pageSize]: undefined,
        };
      }
    };

    const onResetRequest = hooks.useCallbackRef(
      async (values?: TPlainObject) => {
        const params = {
          ...getPaginationData(1, state.queryCondition[fieldNames.pageSize]),
          ...props.initialValues,
          ...values,
        };
        await actions.resetFilterCondition(params);
        form.resetFields();
        if (values) {
          form.setFieldsValue(values);
        }
        void onInnerRequest(params);
      }
    );

    const getRequestParams = hooks.useCallbackRef(() => {
      return {
        ...state.queryCondition,
        ...form.getFieldsValue(),
      };
    });

    const onOpenColumnFoldModal = hooks.useCallbackRef(() => {
      setColumnFoldOpen(true);
    });

    const onCloseColumnFoldModal = hooks.useCallbackRef(() => {
      setColumnFoldOpen(false);
    });

    const getEasyTableRef = () => {
      return {
        /**
         * 参数
         * 1. 不用添加已存在的搜索条件
         * 2. 此处可重新
         */
        onRequest: onInnerRequest,
        clearQueryCondition,
        updateQueryCondition,
        getRequestParams,
        onResetRequest,
        form,
        dataSource: respOriginalDataRef.current,
        getDataSource: () => {
          return respOriginalDataRef.current;
        },
        onFilterDataSource: (filterDataSource) => {
          setDataSource(filterDataSource);
        },
        onClearDataSource: () => {
          setTotal(0);
          setDataSource([]);
        },
        onUpdateDataSource: (dataList) => {
          setDataSource(dataList);
          respOriginalDataRef.current = dataList;
          props.onDataSourceChange?.(dataList);
        },
        columnFoldTriggerRender: (children) => {
          if (props.columnFoldConfig?.triggerType === 'drawer') {
            return cloneElement(children, {
              onClick: onOpenColumnFoldModal,
            });
          }
          const foldColumnList = columnsRef.current.filter((item: TAny) => {
            return !item.hidden && item.isFold && item.dataIndex;
          });
          return (
            <FoldOperateDropdown
              dataList={foldColumnList as TAny[]}
              onChange={onChangeFoldColumnList}
              cacheKey={columnFoldConfig?.cacheKey}
              initSelectedRowKeys={showFoldKeyList}
            >
              {children}
            </FoldOperateDropdown>
          );
        },
        onChangeTableColumns: (columns) => {
          setDynamicColumns(columns);
        },
        getTableColumns: () => {
          return columnsRef.current;
        },
        loading,
      };
    };

    useImperativeHandle(ref, () => {
      return getEasyTableRef();
    });

    const onSetPaginationStatus = (status: boolean) => {
      paginationStatusRef.current = status;
    };

    const onSetBaseColumns = (base) => {
      baseColumnsRef.current = base;
    };

    const onSetColumns = (columns) => {
      columnsRef.current = columns;
    };

    const onFormFinish = () => {
      const values = form.getFieldsValue();
      if (props.onFormFinish) {
        props.onFormFinish({
          ...values,
          ...getPaginationData(1, state.queryCondition[fieldNames.pageSize]),
        });
      } else {
        void onInnerRequest({
          ...values,
          ...getPaginationData(1, state.queryCondition[fieldNames.pageSize]),
        });
      }
    };
    const isFull = isUndefined(props.isFull) ? true : props.isFull;
    const className = classNames(
      'fba-easy-table',
      {
        'fba-easy-table-full': isFull,
        'fba-easy-table-filter-fixed': props.filterFixed,
        'fba-easy-table-pagination-fixed': props.paginationFixed,
      },
      props.className
    );

    const paginationData = useMemo(() => {
      return {
        showSizeChanger: true,
        current: state.queryCondition[fieldNames.pageNo] || 1,
        pageSize: state.queryCondition[fieldNames.pageSize] || pageSize,
        total: total,
        showTotal: (total) => `共 ${total} 条记录`,
        ...props.pagination,
      };
    }, [
      fieldNames.pageNo,
      fieldNames.pageSize,
      pageSize,
      props.pagination,
      state.queryCondition,
      total,
    ]);

    const onChangeFoldColumnList = (keyList: string[]) => {
      setShowFoldKeyList(keyList);
      columnFoldConfig?.onChange?.(keyList);
    };

    const onChange = hooks.useCallbackRef((page: number, pageSize: number) => {
      void onInnerRequest({
        [fieldNames.pageSize]: pageSize,
        [fieldNames.pageNo]: page,
      });
      props.pagination?.onChange?.(page, pageSize);
    });

    const getPaginationStatus = () => {
      return props.paginationFixed || paginationStatusRef.current;
    };

    // 分页参数发生变更
    hooks.useUpdateEffect(() => {
      if (props.paginationFixed) {
        void onInnerRequest({
          [fieldNames.pageSize]:
            state.queryCondition[fieldNames.pageSize] || pageSize,
          [fieldNames.pageNo]: 1,
        });
      } else {
        void onInnerRequest({
          [fieldNames.pageSize]: undefined,
          [fieldNames.pageNo]: undefined,
        });
      }
    }, [props.paginationFixed]);

    const wrapperClassName = classNames(
      'fba-easy-table-wrapper',
      {
        'fba-easy-table-wrapper-inline': props.isInline,
      },
      props.className
    );

    const wrapperStyle: CSSProperties = {
      overflowY: props.filterFixed || props.paginationFixed ? 'hidden' : 'auto',
      ...props.style,
    };

    const children =
      typeof props.children === 'function'
        ? props.children(respOriginalDataRef.current)
        : props.children;

    return (
      <EasyTableContext.Provider
        value={{
          onSetBaseColumns,
          onSetColumns,
          getEasyTableRef,
          modelKey,
          onRequest: onInnerRequest,
          tableDataSource: dataSource,
          tableTotal: total,
          loading,
          fieldNames,
          pageSize,
          onSetPaginationStatus,
          getPaginationStatus,
          onFormFinish,
          form,
          paginationFixed: props.paginationFixed || false,
          foldKeys: props.foldKeys || [],
          columns: dynamicColumns,
          initialValues: props.initialValues,
          dynamicColumnsConfig: {
            showFoldKeyList,
            onChangeShowFoldKeyList: onChangeFoldColumnList,
            columnFoldConfig,
            onOpenColumnFoldModal,
            onCloseColumnFoldModal,
            columnFoldOpen,
            asyncColumnRequest,
          },
        }}
      >
        {props.paginationFixed ? (
          <div className={wrapperClassName} style={wrapperStyle}>
            <div className={className}>{children}</div>
            {total > 0 && (
              <div className="fba-easy-table-pagination">
                <PaginationWrapper
                  size="small"
                  {...paginationData}
                  onChange={onChange}
                />
              </div>
            )}
          </div>
        ) : (
          <div className={wrapperClassName} style={props.style}>
            {children}
          </div>
        )}
      </EasyTableContext.Provider>
    );
  }
);
