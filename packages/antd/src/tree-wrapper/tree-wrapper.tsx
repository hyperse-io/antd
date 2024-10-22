import {
  type CSSProperties,
  type DependencyList,
  forwardRef,
  Fragment,
  isValidElement,
  type ReactElement,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Button, message, Spin, Tree, type TreeProps } from 'antd';
import { CaretDownFilled } from '@ant-design/icons';
import { isArray } from '@dimjs/lang';
import { cloneState } from '@dimjs/model';
import { classNames, extend, get } from '@dimjs/utils';
import {
  isUndefinedOrNull,
  type TAny,
  type TPlainObject,
  treeFilter,
} from '@hyperse/utils';
import { hooks } from '@wove/react';
import {
  ButtonOperate,
  type ButtonOperateProps,
} from '../button-operate/index.js';
import { fbaHooks } from '../fba-hooks/index.js';
import { InputSearchWrapper } from '../input-search-wrapper/index.js';
import {
  RequestStatus,
  type TRequestStatusProps,
} from '../request-status/index.js';
import { treeWrapperModel } from './model.js';
import {
  getDefaultExpandAllKeys,
  getExpandedKeys,
  getVauleList,
  onTreeDrop,
} from './utils.js';
import './style.less';

type TreeWrapperValue =
  | string
  | number
  | Array<string | number>
  | TPlainObject<string | number>
  | Array<TPlainObject<string | number>>;

type TreeServiceConfig = {
  params?: TPlainObject;
  requiredParamsKeys?: string[];
  onRequest?: (params?: TAny) => TAny;
  /**
   * 响应数据适配器
   */
  onRequestResultAdapter?: (respData: TAny) => TPlainObject[];
};
type TreeLoadDataServiceConfig = {
  getParams?: (dataItem: TPlainObject) => TPlainObject;
  onRequest: (params: TPlainObject) => TAny;
  /**
   * 响应数据适配器
   */
  onRequestResultAdapter?: (respData: TAny) => TPlainObject[];
};

export type TreeWrapperMenuItem = {
  title: string;
  onClick: (dataItem: TPlainObject, event) => void;
  icon?: ReactElement;
};

export type TreeWrapperProps = Omit<
  TreeProps,
  | 'treeData'
  | 'onExpand'
  | 'selectedKeys'
  | 'checkedKeys'
  | 'onCheck'
  | 'onSelect'
  | 'fieldNames'
  | 'multiple'
  | 'loadData'
  | 'icon'
  | 'defaultCheckedKeys'
  | 'defaultExpandParent'
  | 'defaultSelectedKeys'
> & {
  /** 唯一值，用于缓存数据 */
  modelKey: string;
  /**
   * 字段映射
   * ```
   * 默认值：
   * label = 'label'
   * value = 'value'
   * children = 'children'
   *
   * 如果未设置list，则说明接口返回数据为数组
   * 如果返回数据存在多级，可通过设置 list='a.b.list'
   * ```
   */
  fieldNames?: {
    label?: string;
    value?: string;
    children?: string;
    list?: string;
  };
  /**
   * useEffect依赖项数组，用于重新发起获取接口数据
   */
  effectDependencyList?: DependencyList;
  /**
   * 请求服务需求的数据，当设置`selectorTreeList`后无效果
   */
  serviceConfig?: TreeServiceConfig;
  /**
   * 是否开启异步加载
   */
  loadDataFlag?: boolean;
  /**
   * 异步加载数据配置
   * ```
   * 1. 会通过fieldNames配置label、value、children进行转义
   * 2. fieldNames.list 配置在此处无效
   * ```
   */
  loadDataServiceConfig?: TreeLoadDataServiceConfig;
  /**
   * 当设置selectorTreeList后，serviceConfig将失效
   * ```
   * 1. 不支持异步数据，异步使用serviceConfig方式
   * ```
   */
  selectorTreeList?: TPlainObject[];
  /**
   * 通过服务获取数据后回调，当设置`selectorList`后无效果
   * ```
   * 相同modelKey，同时发起多个渲染时，只有第一个会执行 onSelectorTreeListChange 回调
   * ```
   */
  onSelectorTreeListChange?: (dataList: TPlainObject[]) => void;
  /** 接口响应数据变更 */
  onRequestResponseChange?: (data: TAny) => void;
  onChange?: (
    selectedKey?: TreeWrapperValue,
    operateNodeData?: TPlainObject[] | TPlainObject,
    operateAllNodeDataList?: TPlainObject[],
    extraData?: TPlainObject
  ) => void;

  /**
   * 搜索关键字，打开tree折叠过滤关键字
   */
  searchValue?: string;
  /**
   * checkable模式下，onChange是否返回父节点，默认值true
   * 1. checkStrictly = true，模式下失效
   */
  checkableResponseParentNode?: boolean;
  /**
   * 菜单触发类型，默认：click
   * ```
   * 自定义设置 titleRender 后失效
   * ```
   */
  menuTriggerType?: 'click' | 'hover';
  menus?: (dataItem) => ButtonOperateProps;

  showSearch?: boolean;
  onSearchValueChange?: (searchValue?: string) => void;
  searchPlaceholder?: string;
  searchStyle?: CSSProperties;
  icon?: (data: {
    isParent: boolean;
    isLeaf: boolean;
    [key: string]: TAny;
  }) => ReactElement;
  // /**
  //  * 是否必选，最后一个不能取消
  //  */
  // required?: boolean;
  /**
   * 状态文案配置
   */
  requestMessageConfig?: TRequestStatusProps['messageConfig'];
  /**
   * value格式
   *```
   * 1. string 、number
   * 2. Array<string | number>
   * 3. lableInValue = true，{label:'', value:''}
   * 4. lableInValue = true，Array<labelInValueFieldNames配置>
   * ```
   */
  value?: TreeWrapperValue;
  /**
   * 选择的节点数据，是否包含label信息
   * ```
   * 默认选择的节点只有value数据
   * ```
   */
  labelInValue?: boolean;
  /**
   * 禁用状态是否可选，默认值true
   * 当dateItem中包含 disabled 则数据为禁用状态
   */
  disabledCanUse?: boolean;

  /** treeItem数据适配器 */
  treeItemDataAdapter?: (dataItem: TPlainObject) => TPlainObject;
  /** 搜索位置额外元素 */
  searchExtraElement?: ReactElement;
  /** 有唯一跟节点时，初始化是否展开，默认值：false */
  initRootExpand?: boolean;
  /** 搜素过滤方式，高亮 | 过滤；默认：filter */
  searchResultType?: 'highlight' | 'filter';
  /**
   * 拖拽节点处理，自定义onDrop事件后，失效
   * ```
   * 参数
   * 1. parentId 拖拽结束位置父节点ID
   * 2. id 当前拖拽节点ID
   * 3. index 拖拽结束位置所在数组下标
   * ```
   */
  onDropNodeHandle?: (result: {
    parentId?: string | number;
    id: string | number;
    index: number;
  }) => void;
  /**
   * 拖拽排序前判断，如果返回 true，可排序，其他不可排序
   * ```
   * 可用于需要权限控制判断
   * ```
   */
  onDropPrev?: (info) => boolean;
  /**
   * 标签渲染
   * ```
   * 1. 自定义设置 titleRender 后失效
   * 2. 与titleRender的区别
   *    a. 设置 labelRender 后，menuLayout有效
   *    b. 设置 titleRender 后，menuLayout失效
   * ```
   */
  labelRender?: (nodeData: TPlainObject) => ReactElement;
  /**
   * 自定义搜索规则
   */
  customSearchRule?: (nodeData: TPlainObject, searchValue?: string) => boolean;
};

export type TreeWrapperRefApi = {
  onClearSelectorList: () => void;
  getTreeDataList: () => TreeProps['treeData'];
  onChangeExpandedKeys: (expandedKeys: Array<string | number>) => void;
  /** 选择所有 */
  onSelectAll: () => void;
  /** 取消选择所有 */
  onCancelSelectAll: () => void;
  /** 展开所有 */
  onExpandedAll: () => void;
  /** 取消展开所有 */
  onCancelExpandedAll: () => void;
};

/**
 * Tree包装组件，默认返回父节点，可配置不返回
 * @param props
 * @returns
 * ```
 * 1. treeNode内置字段说明（如需要相关功能，可在接口中添加固定字段）
 *    a. disabled 禁掉响应
 *    b. isLeaf  设置为叶子节点 (设置了 loadData 时有效)。为 false 时会强制将其作为父节点
 *    c. disableCheckbox  checkable模式下，treeNode复选框是否可选
 * 2. 当设置selectorTreeList属性后，serviceConfig将失效
 * 3. checkable=true，为多选模式
 * 4. 设置value后，组件显示受控
 * 5. 设置loadDataFlag=true，会动态获取children，当treeNode中包含isLeaf=true字段，表示为叶子节点，没有children了
 * 6. 内置 onDrop 事件已处理数组排序，通过 onDropNodeHandle 事件可获取操作节点排序数据；自定义onDrop后，内置onDrop失效
 * ```
 */
export const TreeWrapper = forwardRef<TreeWrapperRefApi, TreeWrapperProps>(
  (props, ref) => {
    const {
      style,
      serviceConfig,
      effectDependencyList,
      selectorTreeList,
      value,
      onChange,
      modelKey,
      checkableResponseParentNode = true,
      checkable,
      onSelectorTreeListChange,
      onRequestResponseChange,
      treeItemDataAdapter,
      searchValue,
      showSearch,
      searchPlaceholder,
      requestMessageConfig,
      labelInValue,
      disabledCanUse,
      // menuLayoutType,
      menuTriggerType,
      initRootExpand,
      searchResultType,
      onDropNodeHandle,
      onDropPrev,
      labelRender,
      searchStyle,
      className,
      defaultExpandAll,
      menus,
      customSearchRule,
      ...otherProps
    } = props;
    // eslint-disable-next-line no-prototype-builtins
    const hasSelectorTreeList = props.hasOwnProperty('selectorTreeList');
    const newServiceConfig = serviceConfig || {};
    const newEffectDependencyList = effectDependencyList || [];
    const [treeExpandedKeys, setTreeExpandedKeys] = useState<
      Array<string | number>
    >([]);
    const [state, actions] = treeWrapperModel(modelKey).useStore();
    const [loading, setLoading] = fbaHooks.useSafeState(false);
    const requestPreKey = `request-progress-${props.modelKey}`;
    const fieldNames = useMemo(() => {
      return {
        label: 'label',
        value: 'value',
        children: 'children',
        ...props.fieldNames,
      };
    }, [props.fieldNames]);
    // const menuLayoutTypeNew = menuLayoutType === undefined ? 'fold' : menuLayoutType;
    const menuTriggerTypeNew =
      menuTriggerType === undefined ? 'click' : menuTriggerType;
    const responseFirstRef = useRef(true);

    const labelInValueFieldNamesMerge = useMemo(() => {
      return { label: 'label', value: 'value' };
    }, []);
    // tree 搜索值
    const [treeSearchValue, setTreeSearchValue] = useState<
      string | undefined
    >();

    const innerOperateValueRef = useRef<
      Array<string | number> | string | number
    >();

    const valueList = useMemo(() => {
      return getVauleList(value, labelInValueFieldNamesMerge);
    }, [labelInValueFieldNamesMerge, value]);

    fbaHooks.useEffectCustom(() => {
      if (state.treeList.length > 0) {
        if (responseFirstRef.current) {
          responseFirstRef.current = false;
          if (defaultExpandAll) {
            setTreeExpandedKeys(
              getDefaultExpandAllKeys(state.treeList, fieldNames)
            );
            return;
          } else if (initRootExpand && state.treeList.length) {
            setTreeExpandedKeys([state.treeList[0][fieldNames.value]]);
            return;
          }
        }
        if (!isUndefinedOrNull(value)) {
          const expandedKeys = getTreeExpandedKeys(valueList, true);
          setTreeExpandedKeys(
            Array.from(new Set(treeExpandedKeys?.concat(expandedKeys)))
          );
        }
      }
    }, [value, state.treeList, valueList]);

    const valueIsEmpty = (data: string | number) => {
      return data === '' || isUndefinedOrNull(data);
    };

    const serviceResponseHandle = (respData) => {
      if (newServiceConfig.onRequestResultAdapter) {
        return newServiceConfig.onRequestResultAdapter(
          respData as unknown as TPlainObject
        );
      }
      if (fieldNames.list) {
        return get(respData, fieldNames.list, []) || [];
      }
      if (!isArray(respData)) {
        console.warn(
          '接口返回数据为非数组结构，确认是否需要配置fieldNames.list进行解析'
        );
        return [];
      }
      return respData;
    };

    fbaHooks.useEffectCustom(() => {
      setTreeSearchValue(searchValue);
    }, [searchValue]);

    const startDataSourceRequest = hooks.useCallbackRef(async () => {
      try {
        if (!newServiceConfig.onRequest) {
          throw new Error('onRequest 调用接口服务不能为空');
        }
        const requiredParamsKeys = newServiceConfig.requiredParamsKeys;
        const params = extend({}, newServiceConfig.params);
        if (requiredParamsKeys) {
          const isEmpty = requiredParamsKeys.find((key) => {
            return valueIsEmpty(params[key] as string | number);
          });
          if (isEmpty) {
            void actions.changeRequestStatus({
              status: 'no-dependencies-params',
            });
            console.warn(
              `TreeWrapper组件：参数：${requiredParamsKeys.join('、')}不能为空`
            );
            return;
          }
        }
        try {
          setLoading(true);
          await actions.changeRequestStatus({
            status: 'request-progress',
          });
          window[requestPreKey] = true;
          const _respData = await newServiceConfig.onRequest?.(params);
          onRequestResponseChange?.(_respData);
          const respData = serviceResponseHandle(
            _respData
          ) as TreeProps['treeData'];
          const respDataListNew = respData || [];
          if (respDataListNew.length === 0) {
            responseFirstRef.current = false;
          }
          onChangeSelectorList(respDataListNew);
          setLoading(false);

          window[requestPreKey] = false;
        } catch (error: TAny) {
          window[requestPreKey] = false;
          setLoading(false);
          void actions.changeRequestStatus({
            status: 'request-error',
            errorMessage: error.message,
          });
        }
      } catch (error: TAny) {
        responseFirstRef.current = false;
        setLoading(false);
        void message.error((error.message as string) || '数据查询异常...');
      }
    });

    fbaHooks.useEffectCustom(() => {
      if (hasSelectorTreeList) return;
      // 当无依赖项时，如果存在缓存数据，就不在调用接口
      if (newEffectDependencyList.length) {
        void startDataSourceRequest();
        return;
      }
      const allState = treeWrapperModel(modelKey).getState();
      if (allState.requestStatus === 'request-success') {
        onSelectorTreeListChange?.(allState.treeList);
        return;
      }
      // 判断相同的modelKey是否已经在请求数据中，避免重复请求
      if (!window[requestPreKey]) {
        void startDataSourceRequest();
      } else {
        onSelectorTreeListChange?.(allState.treeList);
      }
    }, newEffectDependencyList);

    fbaHooks.useEffectCustom(() => {
      if (hasSelectorTreeList) {
        onChangeSelectorList(selectorTreeList || []);
      }
    }, [selectorTreeList]);

    const onChangeSelectorList = hooks.useCallbackRef((dataList: TAny[]) => {
      if (dataList?.length === 0 && state.treeList.length === 0) {
        void actions.changeRequestStatus({ status: 'request-success' });
        return;
      }
      void actions.setTreeList({
        treeList: dataList || [],
        childrenName: fieldNames.children,
      });
      onSelectorTreeListChange?.(dataList);
    });

    const getTreeExpandedKeys = (
      valueList: Array<string | number>,
      refresh?: boolean
    ) => {
      let newTreeExpandedKeys = [] as Array<string | number>;
      valueList.forEach((value) => {
        if (!refresh && treeExpandedKeys?.includes(value)) return;
        const targetKeys = getExpandedKeys(value, state.treeList, fieldNames);
        newTreeExpandedKeys = newTreeExpandedKeys.concat(targetKeys);
      });
      return newTreeExpandedKeys;
    };

    hooks.useUpdateEffect(() => {
      if (treeSearchValue) {
        const targetList = state.treeTiledArray.filter((item) => {
          const labelValue = (item[fieldNames.label] || '') as string;
          if (customSearchRule) {
            return customSearchRule(item, treeSearchValue);
          }
          return String(labelValue)
            .toLowerCase()
            .includes(treeSearchValue.toLowerCase());
        });
        const treeExpandedKeysNew = getTreeExpandedKeys(
          targetList.map((item) => item[fieldNames.value]),
          true
        );
        setTreeExpandedKeys(Array.from(new Set(treeExpandedKeysNew)));
      } else {
        setTreeExpandedKeys([]);
      }
    }, [treeSearchValue]);
    useImperativeHandle(ref, () => {
      return {
        onClearSelectorList: () => {
          void actions.resetTreeList();
        },
        getTreeDataList: () => {
          return state.treeList;
        },
        onChangeExpandedKeys: (dataList) => {
          setTreeExpandedKeys(dataList);
        },
        onSelectAll: () => {
          const targetList = state.treeTiledArray.map(
            (temp) => temp[fieldNames.value]
          );
          setTreeExpandedKeys(targetList);
          onChange?.(targetList, undefined, state.treeList, undefined);
        },
        onCancelSelectAll: () => {
          setTreeExpandedKeys([]);
          onChange?.(undefined);
        },
        onExpandedAll: () => {
          const targetList = state.treeTiledArray.map(
            (temp) => temp[fieldNames.value]
          );
          setTreeExpandedKeys(targetList);
        },
        onCancelExpandedAll: () => {
          setTreeExpandedKeys([]);
        },
      };
    });

    const onExpand = hooks.useCallbackRef((expandedKeys) => {
      setTreeExpandedKeys(expandedKeys as string[]);
    });

    const onRespChange = hooks.useCallbackRef(
      (selectedKey, selectInfo?, selectAllList?, operateInfo?) => {
        innerOperateValueRef.current = selectedKey;
        const selectList = isUndefinedOrNull(selectInfo)
          ? []
          : isArray(selectInfo)
            ? selectInfo
            : [selectInfo];
        if (isUndefinedOrNull(selectedKey)) {
          onChange?.(selectedKey, selectInfo, selectAllList);
          return;
        }
        if (labelInValue) {
          const lvLabel = labelInValueFieldNamesMerge.label;
          const lvValue = labelInValueFieldNamesMerge.value;
          const labelInValueList = selectList.map((item) => {
            return {
              [lvLabel]: item[fieldNames.label],
              [lvValue]: item[fieldNames.value],
            };
          });
          if (isArray(selectedKey)) {
            onChange?.(
              labelInValueList,
              selectList,
              selectAllList,
              operateInfo
            );
          } else {
            onChange?.(
              labelInValueList[0],
              selectList[0],
              selectAllList,
              operateInfo
            );
          }
        } else {
          if (isArray(selectedKey)) {
            onChange?.(selectedKey, selectList, selectAllList, operateInfo);
          } else {
            onChange?.(selectedKey, selectList[0], selectAllList, operateInfo);
          }
        }
      }
    );

    const onTreeChangeHandle = hooks.useCallbackRef(
      (checkedData, operateInfo) => {
        let checkedValueList = isUndefinedOrNull(checkedData)
          ? []
          : checkedData;
        checkedValueList = props.checkStrictly
          ? checkedData.checked
          : checkedData;

        checkedValueList = isArray(checkedValueList)
          ? checkedValueList
          : [checkedValueList];

        const selectedLeafList = [] as TPlainObject[];
        const selectedLeafValueList = [] as Array<string | number>;
        const selectedAllList = [] as TPlainObject[];
        const selectedAllValueList = [] as Array<string | number>;
        checkedValueList.forEach((item) => {
          const target = state.treeTiledArray.find(
            (temp) => temp[fieldNames.value] === item
          );
          if (!target) return;
          const children = target?.[fieldNames.children];
          if (!isArray(children) || children.length === 0) {
            selectedLeafList.push(target);
            selectedLeafValueList.push(target[fieldNames.value]);
          }
          selectedAllList.push(target);
          selectedAllValueList.push(target[fieldNames.value]);
        });

        if (checkable) {
          setTreeExpandedKeys((prev) => {
            const mergeList = getTreeExpandedKeys(selectedLeafValueList).concat(
              prev || []
            );
            return Array.from(new Set(mergeList));
          });
          if (!checkableResponseParentNode && !props.checkStrictly) {
            onRespChange(
              selectedLeafValueList,
              selectedLeafList,
              selectedAllList,
              operateInfo
            );
          } else {
            onRespChange(
              selectedAllValueList,
              selectedAllList,
              selectedAllList,
              operateInfo
            );
          }
        } else {
          if (checkedValueList[0]) {
            const currentNode = selectedAllList.find(
              (item) => item[fieldNames.value] === checkedValueList[0]
            );
            onRespChange(
              checkedValueList[0],
              currentNode,
              [currentNode],
              operateInfo
            );
          } else {
            const nodeValue = operateInfo.node[fieldNames.value];
            const target = state.treeTiledArray.find(
              (temp) => temp[fieldNames.value] === nodeValue
            );
            onRespChange(undefined, target, [target], operateInfo);
          }
        }
      }
    );

    const treeItemDataAdapterHandle = hooks.useCallbackRef((dataItem) => {
      return treeItemDataAdapter?.(dataItem);
    });

    const originalDataList = useMemo(() => {
      const list = cloneState(state.treeList || []);
      if (treeSearchValue && searchResultType !== 'highlight') {
        return treeFilter(
          cloneState(state.treeList || []),
          (node) => {
            if (customSearchRule) {
              return customSearchRule(node, treeSearchValue);
            }
            const value = node[fieldNames.label]?.toLowerCase();
            return value.indexOf(treeSearchValue.toLowerCase()) >= 0;
          },
          { childrenName: fieldNames.children }
        );
      }
      return list;
    }, [
      fieldNames.children,
      fieldNames.label,
      searchResultType,
      state.treeList,
      treeSearchValue,
    ]);

    const treeData = useMemo(() => {
      const loop = (data: TAny[]): TAny[] =>
        data?.map((item) => {
          const adapterItem = treeItemDataAdapterHandle?.(item) || item;
          const disabled = disabledCanUse ? undefined : adapterItem.disabled;
          const strTitle = adapterItem[fieldNames.label] as string;
          let titleDom;
          if (treeSearchValue) {
            const strTitleNew = strTitle?.toLowerCase();
            const index = strTitleNew.indexOf(treeSearchValue.toLowerCase());
            const beforeStr = strTitleNew.substring(0, index);
            const afterStr = strTitleNew.slice(index + treeSearchValue.length);
            const centerStr = strTitleNew.slice(
              index,
              index + treeSearchValue.length
            );
            titleDom =
              index > -1 ? (
                <span
                  className={classNames({
                    'v-tree-item-disabled': adapterItem.disabled,
                  })}
                >
                  {beforeStr}
                  <span className="site-tree-search-value">{centerStr}</span>
                  {afterStr}
                </span>
              ) : null;
          }
          if (!titleDom && adapterItem.disabled) {
            titleDom = (
              <span
                className={classNames({
                  'v-tree-item-disabled': adapterItem.disabled,
                })}
              >
                {strTitle}
              </span>
            );
          }
          const children = adapterItem[fieldNames.children];
          return {
            ...adapterItem,
            disabled,
            [fieldNames.label]: titleDom || strTitle,
            _treeItemName: strTitle,
            _disabled: adapterItem.disabled,
            [fieldNames.children]:
              isArray(children) && children.length > 0
                ? loop(children)
                : undefined,
          };
        });
      return loop(originalDataList);
    }, [
      originalDataList,
      treeItemDataAdapterHandle,
      disabledCanUse,
      fieldNames.label,
      fieldNames.children,
      treeSearchValue,
    ]);
    const loadData = hooks.useCallbackRef((dataItem: TPlainObject) => {
      // eslint-disable-next-line no-async-promise-executor
      return new Promise<void>(async (resolve, reject) => {
        if (dataItem[fieldNames.children]) {
          resolve();
          return;
        }
        try {
          const respData = await props.loadDataServiceConfig?.onRequest?.(
            props.loadDataServiceConfig?.getParams?.(dataItem) || {}
          );
          const respDataList = (
            props.loadDataServiceConfig?.onRequestResultAdapter
              ? props.loadDataServiceConfig.onRequestResultAdapter(
                  respData as unknown as TPlainObject
                )
              : respData
          ) as TPlainObject[];

          void actions
            .treeListAppendChildren({
              value: dataItem[fieldNames.value],
              appendList: respDataList,
              childrenName: fieldNames.children,
              valueName: fieldNames.value,
            })
            .then((allState) => {
              onChangeSelectorList(allState.treeList as TPlainObject[]);
              resolve();
            });
        } catch (error: TAny) {
          void message.error(error.message || '数据加载异常...');
          // 此处失败后，会重试“loadData”请求多次
          reject();
        }
      });
    });

    const isLeafNode = hooks.useCallbackRef((nodeData) => {
      const children = nodeData?.[fieldNames.children];
      // 当loadDataFlag=true，考虑叶子节点显示问题
      const loadDataFlag = props.loadDataFlag;
      const loadHasChildren = loadDataFlag ? !nodeData.isLeaf : false;
      const hasChildren = (children && children.length > 0) || loadHasChildren;
      return !hasChildren;
    });

    const titleRender = hooks.useCallbackRef((nodeData) => {
      const stringLabel = nodeData._treeItemName || nodeData[fieldNames.label];
      const buttonOperateConfig = menus?.({
        ...nodeData,
        [fieldNames.label]: stringLabel,
      });
      if (buttonOperateConfig?.operateList.length) {
        return (
          <Fragment>
            <span className="tree-item-title">
              {labelRender?.(nodeData) || nodeData?.[fieldNames.label]}
            </span>
            <ButtonOperate
              gap={5}
              {...buttonOperateConfig}
              dropdownMenuProps={{
                placement: 'bottomRight',
                isFixed: true,
                ...buttonOperateConfig?.dropdownMenuProps,
              }}
              className={classNames(
                'tree-item-title-operate',
                buttonOperateConfig.className
              )}
            />
          </Fragment>
        );
      }

      // if (menuLayoutTypeNew === 'fold') {
      //   let menuOptions: TAny[] = [];
      //   if (props.menuOptions?.fold) {
      //     menuOptions =
      //       props.menuOptions?.[menuLayoutTypeNew]?.({
      //         ...nodeData,
      //         [fieldNames.label]: stringLabel,
      //       }) || [];
      //   } else {
      //     menuOptions =
      //       props.getMenuOptions?.({
      //         ...nodeData,
      //         [fieldNames.label]: stringLabel,
      //       }) || [];
      //   }
      //   return (
      //     <Fragment>
      //       <span className="tree-item-title">{labelRender?.(nodeData) || nodeData?.[fieldNames.label]}</span>
      //       {menuOptions.length > 0 && (
      //         <DropdownMenuWrapper menuList={menuOptions} placement="bottomRight">
      //           <MoreOutlined />
      //         </DropdownMenuWrapper>
      //       )}
      //     </Fragment>
      //   );
      // }
      // const menuOptions = props.menuOptions?.tile?.({
      //   ...nodeData,
      //   [fieldNames.label]: stringLabel,
      // });

      return (
        <span className="tree-item-title">
          {labelRender?.(nodeData) || nodeData?.[fieldNames.label]}
        </span>
      );
    });

    const onChangeDebounce = hooks.useDebounceCallback((value: string) => {
      setTreeSearchValue(value);
      props.onSearchValueChange?.(value);
    }, 300);

    const onSearchChange = hooks.useCallbackRef(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onChangeDebounce(e.target.value);
      }
    );

    const iconHandle = hooks.useCallbackRef((treeData) => {
      if (!props.icon) return null;
      if (isValidElement(props.icon)) return props.icon;
      const isLeafFlag = isLeafNode(treeData.data);
      return props.icon({
        ...treeData,
        isParent: !isLeafFlag,
        isLeaf: isLeafFlag,
      });
    });

    const treeFieldNames = useMemo(() => {
      return {
        title: fieldNames.label,
        key: fieldNames.value,
        children: fieldNames.children,
      };
    }, [fieldNames]);
    const showTree =
      treeData.length > 0 && state.requestStatus !== 'request-error';
    const commonProps = {
      showLine: { showLeafIcon: false },
      titleRender,
      blockNode: true,
      switcherIcon: <CaretDownFilled />,
      onDrop: (info) => {
        if (onDropPrev) {
          const boo = onDropPrev(info);
          if (!boo) return;
        }
        const { dataList, dragNodeData } = onTreeDrop(
          originalDataList as TPlainObject[],
          fieldNames,
          info
        );
        onDropNodeHandle?.(dragNodeData);
        onChangeSelectorList(dataList);
      },
      expandedKeys: treeExpandedKeys,
      ...otherProps,
      fieldNames: treeFieldNames,
      treeData,
      onExpand,
      loadData: props.loadDataFlag ? loadData : undefined,
      style: { width: '100%' },
      icon: iconHandle,
    };

    const checkedProps = {
      onCheck: onTreeChangeHandle,
      checkable,
      checkedKeys: valueList,
    };

    const selectedProps = {
      onSelect: onTreeChangeHandle,
      multiple: false,
      selectedKeys: valueList,
    };
    const sceneProps = checkable ? checkedProps : selectedProps;
    const cName = classNames(
      'v-tree-wrapper',
      `v-tree-wrapper-menu-${menuTriggerTypeNew}`,
      className
    );
    const isSearchEmpty =
      state.treeList.length > 0 && !showTree && treeSearchValue;
    return (
      <div className={cName} style={style}>
        {!!showSearch && (
          <div className="v-tree-wrapper-search-area" style={searchStyle}>
            <InputSearchWrapper
              className="v-tree-wrapper-search"
              placeholder={
                isUndefinedOrNull(searchPlaceholder)
                  ? '搜索'
                  : searchPlaceholder
              }
              onChange={onSearchChange}
              value={searchValue}
              allowClear
            />
            {!!props.searchExtraElement && (
              <span className="v-tree-wrapper-search-extra">
                {props.searchExtraElement}
              </span>
            )}
          </div>
        )}

        {showTree ? (
          <div className="v-tree-wrapper-tree-wrapper">
            <Spin spinning={state.requestStatus === 'request-progress'} />
            <Tree
              {...sceneProps}
              {...commonProps}
              className="v-tree-wrapper-tree"
            ></Tree>
          </div>
        ) : (
          <RequestStatus
            status={state.requestStatus}
            loading={loading}
            messageConfig={{
              'request-success': isSearchEmpty ? '搜索结果为空' : '暂无数据',
              'request-error': state.requestErrorMessage,
              ...requestMessageConfig,
            }}
            errorButton={
              <Button type="primary" onClick={startDataSourceRequest}>
                重新获取数据
              </Button>
            }
          />
        )}
      </div>
    );
  }
);

TreeWrapper.defaultProps = {
  disabledCanUse: true,
};
