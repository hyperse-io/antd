import { type DependencyList, useMemo, useRef, useState } from 'react';
import { usePrevious } from 'ahooks';
import { Button, TreeSelect, type TreeSelectProps } from 'antd';
import { dequal } from 'dequal';
import { CaretDownFilled, RedoOutlined } from '@ant-design/icons';
import { isArray } from '@dimjs/lang';
import { classNames, extend } from '@dimjs/utils';
import {
  arrayFind,
  getValueOrDefault,
  isUndefinedOrNull,
  type TAny,
  type TPlainObject,
  treeToArray,
  valueIsEqual,
} from '@hyperse/utils';
import { hooks } from '@wove/react';
import { fbaHooks } from '../fba-hooks/index.js';
import {
  RequestStatus,
  type TRequestStatusProps,
} from '../request-status/index.js';
import { treeSelectorWrapperModel } from './model.js';
import { getExpandedKeys, getVauleList } from './utils.js';
import './style.less';

type TreeSelectorWrapperValue =
  | string
  | number
  | Array<string | number>
  | TPlainObject<string | number>
  | Array<TPlainObject<string | number>>;

type TreeSelectorServiceConfig = {
  params?: TPlainObject;
  requiredParamsKeys?: string[];
  onRequest?: (params?: TAny) => TAny;
  /**
   * 响应数据适配器
   */
  onRequestResultAdapter?: (respData: TAny) => TPlainObject[];
};

export type TreeSelectorWrapperProps = Omit<
  TreeSelectProps,
  | 'treeExpandedKeys'
  | 'treeData'
  | 'loading'
  | 'onTreeExpand'
  | 'onChange'
  | 'value'
  | 'fieldNames'
  | 'defaultValue'
  | 'treeDataSimpleMode'
> & {
  modelKey: string;
  fieldNames?: {
    label?: string;
    value?: string;
    children?: string;
    disabled?: string;
  };
  /**
   * useEffect依赖项数组，用于重新发起获取接口数据
   */
  effectDependencyList?: DependencyList;
  /**
   * 请求服务需求的数据，当设置`treeSelectorList`后无效果
   */
  serviceConfig?: TreeSelectorServiceConfig;
  /**
   * 当设置treeSelectorList后，serviceConfig 将失效
   */
  treeSelectorList?: TreeSelectProps['treeData'];
  /**
   * treeSelectorList发生变更时触发
   */
  onTreeSelectorListChange?: (
    treeSelectorList?: TreeSelectProps['treeData']
  ) => void;
  /**
   * 通过服务获取数据异常回调，当设置`treeSelectorList`后无效果
   */
  onTreeSelectorRequestError?: (error: Error) => void;
  /**
   * 添加全部选项
   * ```
   * 1. showAllOption = true，添加默认全部选项（value值为空字符串）
   * 2. 可自定义全部选项，例如：{ label: '全部', value: 'all' }
   * 3. 自定义字段会通过fieldNames转换后使用
   * 4. 多选操作时，最好不要设置全部选项
   * ```
   */
  showAllOption?: true | TPlainObject<string | number>;
  /**
   * 1. 当 treeCheckable = true && treeCheckStrictly = true，如果选择的数据中含有父节点，selectedValue、selectedList返回数据包含父节点
   * 2. 当 treeCheckable = true && treeCheckStrictly = false，selectedValue、selectedList返回的数据不包含父节点
   * 3. 当 treeCheckable = false，节点选择没有级联关系，selectedValue、selectedList返回的数据就是实际选择
   * 4. selectAllDataList 返回的数据都包含父节点
   * 5. 使用 onTreeItemAdapter 拼接label数据后，选中回填数据也是拼接后的
   * 6. triggerInfo 当前操作节点数据
   */
  onChange?: (
    selectedValue?: TreeSelectorWrapperValue,
    selectedData?: TPlainObject[] | TPlainObject,
    triggerInfo?: TPlainObject
  ) => void;
  /**
   * tree item 数据适配器，返回的数据会通过fieldNames配置取数据
   * ```
   * 1. 可用于设置disabled状态
   * onTreeItemDataAdapter: (dataItem) => {
   *   if(dataItem.xx === xx){
   *     dataItem['disabled] = true;
   *   }
   *   return dataItem;
   * }
   * 2. 可设置label数据显示
   * ```
   */
  onTreeItemDataAdapter?: (dataItem: TPlainObject) => TPlainObject;
  // icon 无法实现、treeIcon不起作用4.20.0
  // showIcon?: boolean;
  // icon?: (data: TPlainObject) => ReactElement;
  /** 自定义异常提示文案 */
  requestMessageConfig?: TRequestStatusProps['messageConfig'];
  /**
   * value格式
   *```
   * 1. string 、number
   * 2. Array<string | number>
   * 3. lableInValue = true，根据labelInValueFieldNames配置格式
   * 4. lableInValue = true，Array<labelInValueFieldNames配置>
   * ```
   */
  value?: TreeSelectorWrapperValue;

  /**
   * treeCheckStrictly 	checkable 状态下节点选择完全受控（父子节点选中状态不再关联），
   * 会使得 labelInValue 强制为 true
   */
  labelInValue?: boolean;
  /**
   * ```
   * lableInValue = true，onChange输出数据字段名称，默认：{ label: string; value: string|number }
   * ```
   */
  labelInValueFieldNames?: { label: string; value: string };
  /**
   * treeCheckStrictly = true模式下有效，点击父节点是否选中所有子节点，默认值：true
   */
  selectedParentCheckedAllChildrenList?: boolean;
  /** 有唯一跟节点时，初始化是否展开，默认值：false */
  initRootExpand?: boolean;
};

// type TreeSelectorWrapperPropsInner = TreeSelectorWrapperProps & {
//   onChange?: (selectedValue?: TreeSelectorWrapperValue) => void;
// };

/**
 * 树选择器包装组件，由于过度封装，部分antd TreeSelect原始功能不支持，不满足情况的请使用antd TreeSelect实现
 * @param props
 * @returns
 * ```
 * 1. 当设置treeSelectorList属性后，serviceConfig、onTreeSelectorListChange将失效
 * 2. 父节点默认不返回，需要返回请设置showCheckedStrategy
 * ```
 */
export const TreeSelectorWrapper = (props: TreeSelectorWrapperProps) => {
  const {
    serviceConfig,
    effectDependencyList,
    onTreeSelectorListChange,
    onTreeSelectorRequestError,
    treeSelectorList,
    requestMessageConfig,
    modelKey,
    value,
    labelInValue: _labelInValue,
    labelInValueFieldNames,
    onTreeItemDataAdapter,
    selectedParentCheckedAllChildrenList = true,
    fieldNames,
    onChange,
    treeDefaultExpandAll,
    showAllOption,
    initRootExpand,
    treeDefaultExpandedKeys,
    ...otherProps
  } = props;
  /**
   * 不能使用key、defaultValue模式
   * 1. 勾选的和回填选中不相同情况，勾选后会渲染defaultValue模式后，弹框被关闭，操作体验存在问题
   */
  const hasTreeSelectorList = Object.prototype.hasOwnProperty.call(
    props,
    'treeSelectorList'
  );
  const newServiceConfig = serviceConfig || {};
  const newEffectDependencyList = effectDependencyList || [];
  const [loading, setLoading] = fbaHooks.useSafeState(false);
  const [treeExpandedKeys, setTreeExpandedKeys] = useState<React.Key[]>();
  const [state, actions] = treeSelectorWrapperModel(modelKey).useStore();
  const requestPreKey = `request-progress-${modelKey}`;
  const isMultiple = otherProps.treeCheckable;
  const responseFirstRef = useRef(true);
  /**
   * treeCheckStrictly 	checkable 状态下节点选择完全受控（父子节点选中状态不再关联），
   * 会使得 labelInValue 强制为 true
   */
  const labelInValue = useMemo(() => {
    if (otherProps.treeCheckStrictly) return true;
    return _labelInValue;
  }, [_labelInValue, otherProps.treeCheckStrictly]);

  const fieldNamesMerge = useMemo(() => {
    return {
      label: 'label',
      value: 'value',
      children: 'children',
      disabled: 'disabled',
      ...fieldNames,
    };
  }, [fieldNames]);

  const labelInValueFieldNamesMerge = useMemo(() => {
    return { label: 'label', value: 'value', ...labelInValueFieldNames };
  }, [labelInValueFieldNames]);

  const allOptionConfig = useMemo(() => {
    if (showAllOption) {
      const isTrue = showAllOption === true;
      return {
        label: isTrue ? '全部' : showAllOption.label,
        value: isTrue ? '' : showAllOption.value,
      };
    }
    return null;
  }, [showAllOption]);

  const isFirstUseValueRef = useRef(true);

  const prevValue = usePrevious(value);

  fbaHooks.useEffectCustom(() => {
    if (state.treeSelectorList.length > 0) {
      if (responseFirstRef.current && isUndefinedOrNull(value)) {
        responseFirstRef.current = false;
        if (treeDefaultExpandedKeys) {
          setTreeExpandedKeys(treeDefaultExpandedKeys);
        } else if (treeDefaultExpandAll) {
          const allValues = treeToArray(
            state.treeSelectorList,
            fieldNamesMerge.children
          ).map((item) => {
            return item[fieldNamesMerge.value];
          });
          setTreeExpandedKeys(allValues);
          return;
        } else if (initRootExpand && state.treeSelectorList.length) {
          setTreeExpandedKeys([
            state.treeSelectorList[0][fieldNamesMerge.value],
          ]);
          return;
        }
      }
      if (isUndefinedOrNull(value) && isFirstUseValueRef.current) return;
      isFirstUseValueRef.current = false;
      if (value !== prevValue) {
        const valueList = getVauleList(value, labelInValueFieldNamesMerge);
        const expandedKeys = getTreeExpandedKeys(valueList, true);
        setTreeExpandedKeys(Array.from(new Set(expandedKeys)));
      }
    }
  }, [value, state.treeSelectorList]);

  const valueIsEmpty = (value: string | number) => {
    return value === '' || isUndefinedOrNull(value);
  };

  const serviceResponseHandle = (respData) => {
    const respDataList = newServiceConfig.onRequestResultAdapter
      ? newServiceConfig.onRequestResultAdapter(
          respData as unknown as TPlainObject
        )
      : respData;
    return respDataList as TPlainObject[];
  };

  const startDataSourceRequest = hooks.useCallbackRef(async () => {
    if (!newServiceConfig.onRequest) {
      throw new Error('onRequest 调用接口服务不能为空');
    }
    const requiredParamsKeys = newServiceConfig.requiredParamsKeys || [];
    const params = extend({}, newServiceConfig.params);
    const isEmpty = requiredParamsKeys.find((key) => {
      return valueIsEmpty(params[key] as string | number);
    });
    if (isEmpty) {
      void actions.changeRequestStatus('no-dependencies-params');
      console.warn(
        `TreeSelectorWrapper组件：参数：${requiredParamsKeys.join('、')}不能为空`
      );
      return;
    }
    try {
      setLoading(true);
      window[requestPreKey] = true;
      void actions.changeRequestStatus('request-progress');
      const _respData = await newServiceConfig.onRequest?.(params);
      const respData = serviceResponseHandle(
        _respData
      ) as TreeSelectProps['treeData'];
      setLoading(false);
      window[requestPreKey] = false;
      onChangeSelectorList(respData || []);
    } catch (error: TAny) {
      setLoading(false);
      window[requestPreKey] = false;
      void actions.changeRequestStatus('request-error');
      onTreeSelectorRequestError?.(error);
    }
  });

  hooks.useCustomCompareEffect(
    () => {
      if (hasTreeSelectorList) return;
      // 当无依赖项时，如果存在缓存数据，就不在调用接口
      if (newEffectDependencyList.length) {
        // 内部主动清楚数据，被依赖的数据发生变更时，依赖组件数据清空
        onChangeSelectorList([]);
        void startDataSourceRequest();
        return;
      }
      const allState = treeSelectorWrapperModel(modelKey).getState();
      if (allState.requestStatus === 'request-success') {
        return;
      }
      // 判断相同的modelKey是否已经在请求数据中，避免重复请求
      if (!window[requestPreKey]) {
        void startDataSourceRequest();
        return;
      }
    },
    newEffectDependencyList,
    dequal
  );

  const onChangeSelectorList = hooks.useCallbackRef((dataList: TAny[]) => {
    if (dataList?.length === 0 && state.treeSelectorList.length === 0) {
      void actions.setSelectBoxList({
        treeSelectorList: [],
        treeSelectorTiledArray: [],
      });
      onTreeSelectorListChange?.([]);
      return;
    }
    // 全部选项
    const tempItem = allOptionConfig
      ? {
          [fieldNamesMerge.label]: allOptionConfig.label,
          [fieldNamesMerge.value]: allOptionConfig.value,
        }
      : undefined;
    const newdataList = showAllOption ? [tempItem, ...dataList] : dataList;
    void actions.setSelectBoxList({
      treeSelectorList: newdataList,
      treeSelectorTiledArray: treeToArray(
        newdataList || [],
        fieldNamesMerge.children
      ),
    });
    onTreeSelectorListChange?.(dataList);
  });

  fbaHooks.useEffectCustom(() => {
    if (hasTreeSelectorList) {
      onChangeSelectorList(treeSelectorList || []);
    }
  }, [treeSelectorList]);

  const onTreeExpand = hooks.useCallbackRef((expandedKeys) => {
    setTreeExpandedKeys(expandedKeys as string[]);
  });

  const onAgainRequest = hooks.useCallbackRef(() => {
    void startDataSourceRequest();
  });

  const getTreeExpandedKeys = (
    valueList: Array<string | number>,
    refresh?: boolean
  ) => {
    let newTreeExpandedKeys = [] as Array<string | number>;
    valueList.forEach((value) => {
      if (!refresh && treeExpandedKeys?.includes(value)) return;
      const targetList = getExpandedKeys(
        value,
        state.treeSelectorList,
        fieldNamesMerge
      );
      newTreeExpandedKeys = newTreeExpandedKeys.concat(
        targetList.map((item) => item.value)
      );
    });
    return newTreeExpandedKeys;
  };

  /**
   * 数据源Item解析
   */
  const parseDataSourceItem = hooks.useCallbackRef(
    (item?: TPlainObject | null) => {
      if (!item) return undefined;
      return {
        label: item?.[fieldNamesMerge.label],
        value: item?.[fieldNamesMerge.value],
        children: item?.[fieldNamesMerge.children],
        disabled: item?.['disabled'],
      };
    }
  );
  /**
   * labelInValue模式入参value item解析
   */
  // const parseLabelInValueItem = hooks.useCallbackRef((item?: TPlainObject | null) => {
  //   if (!item) return undefined;
  //   return {
  //     label: item?.[labelInValueFieldNamesMerge.label],
  //     value: item?.[labelInValueFieldNamesMerge.value],
  //     disabled: item?.['disabled'],
  //   };
  // });

  const getResponseTreeNodeList = hooks.useCallbackRef(
    (changeValue: TAny, triggerInfo: TPlainObject) => {
      const valueList = getVauleList(changeValue, {
        value: 'value',
        label: 'label',
      });
      let selectedTreeNodeList = [] as TPlainObject[];
      valueList.forEach((item) => {
        const target = arrayFind(
          state.treeSelectorTiledArray,
          item,
          fieldNamesMerge.value
        ) as TPlainObject;
        if (!target) return;
        selectedTreeNodeList.push(target);
      });
      if (
        otherProps.treeCheckStrictly &&
        selectedParentCheckedAllChildrenList
      ) {
        const triggerNode = parseDataSourceItem(
          triggerInfo.checked
            ? arrayFind(
                state.treeSelectorTiledArray,
                triggerInfo.triggerValue,
                fieldNamesMerge.value
              )
            : null
        );
        if (
          triggerNode &&
          isArray(triggerNode.children) &&
          triggerNode.children.length > 0
        ) {
          // 判断为父节点
          const allChildrenList = treeToArray(
            triggerNode.children,
            fieldNamesMerge.children
          );
          const selectedChildrenList = allChildrenList.filter((item) => {
            const parseItem = parseDataSourceItem(item);
            if (parseItem?.disabled) return false;
            // 去重
            if (
              arrayFind(
                selectedTreeNodeList,
                parseItem?.value,
                fieldNamesMerge.value
              )
            )
              return false;
            return true;
          });
          selectedTreeNodeList =
            selectedTreeNodeList.concat(selectedChildrenList);
        }
      }
      let realTreeNodeList = [] as TPlainObject[];
      if (otherProps.treeCheckable) {
        if (
          otherProps.treeCheckStrictly === true ||
          valueIsEqual(otherProps.showCheckedStrategy, [
            'SHOW_ALL',
            'SHOW_PARENT',
          ])
        ) {
          // 返回包含父节点
          realTreeNodeList = selectedTreeNodeList;
        } else {
          // 返回不包含父节点
          realTreeNodeList = selectedTreeNodeList.filter((item) => {
            const children = item[fieldNamesMerge.children];
            return !(isArray(children) && children.length > 0);
          });
        }
      } else {
        realTreeNodeList = selectedTreeNodeList;
      }
      return {
        realTreeNodeList,
        realTreeNodeValueList: getVauleList(realTreeNodeList, fieldNamesMerge),
      };
    }
  );

  const onRespChange = hooks.useCallbackRef(
    (values, selectedValues, triggerInfo) => {
      // setInnerOperateValue(values);
      onChange?.(values, selectedValues, triggerInfo);
      // onChangeHandle?.(values, selectedValues, triggerInfo);
    }
  );

  /**
   * 根据treeCheckable、treeCheckStrictly、showCheckedStrategy等设置情况，判断返回数据是否包含父节点
   * 1. 当 treeCheckable = true，changeValue 数据格式为 { label,value }[]
   */
  const onInnerChange = hooks.useCallbackRef(
    (changeValue: TAny, _data, triggerInfo: TPlainObject) => {
      const { realTreeNodeList, realTreeNodeValueList } =
        getResponseTreeNodeList(changeValue, triggerInfo);
      if (otherProps.treeCheckable) {
        setTreeExpandedKeys((prev) => {
          const mergeList = getTreeExpandedKeys(realTreeNodeValueList).concat(
            (prev || []) as string[]
          );
          return Array.from(new Set(mergeList));
        });
      }

      if (labelInValue) {
        const labelInValueList = realTreeNodeList.map((item) => {
          const parseItem = parseDataSourceItem(item);
          return {
            [labelInValueFieldNamesMerge.label]: parseItem?.label,
            [labelInValueFieldNamesMerge.value]: parseItem?.value,
            rawData: item,
          };
        });

        if (isMultiple) {
          onRespChange?.(labelInValueList, realTreeNodeList, triggerInfo);
        } else {
          onRespChange?.(labelInValueList[0], realTreeNodeList[0], triggerInfo);
        }
      } else {
        if (isMultiple) {
          onRespChange?.(realTreeNodeValueList, realTreeNodeList, triggerInfo);
        } else {
          onRespChange?.(
            realTreeNodeValueList[0],
            realTreeNodeList[0],
            triggerInfo
          );
        }
      }
    }
  );

  const mapTree = hooks.useCallbackRef((data) => {
    if (!data) return null;
    return data.map((item) => {
      const itemAdapterData = onTreeItemDataAdapter?.({ ...item }) || item;
      const children = itemAdapterData[fieldNamesMerge.children];
      const value = itemAdapterData[fieldNamesMerge.value];
      const label = itemAdapterData[fieldNamesMerge.label];
      const disabled = itemAdapterData[fieldNamesMerge.disabled]
        ? itemAdapterData[fieldNamesMerge.disabled]
        : itemAdapterData.disabled;
      return (
        <TreeSelect.TreeNode
          {...itemAdapterData}
          disabled={disabled}
          value={value}
          title={label}
          key={`${value}`}
        >
          {children && children.length > 0 && mapTree(children)}
        </TreeSelect.TreeNode>
      );
    });
  });

  /**
   * 1. 当 treeCheckable = true，value 数据格式为 labelInValueFieldNames[]
   * 2. 其他情况 value 数据格式为 value[]
   */
  const renderValueList = useMemo(() => {
    const valueList = labelInValue
      ? getVauleList(value, labelInValueFieldNamesMerge)
      : getVauleList(value, fieldNamesMerge);
    if (valueList.length == 0) return [];
    if (otherProps.treeCheckStrictly) {
      if (state.treeSelectorTiledArray.length === 0) {
        return valueList.map((item) => ({ label: item, value: item }));
      }
      return valueList.map((value) => {
        const target = arrayFind(
          state.treeSelectorTiledArray,
          value as string,
          fieldNamesMerge.value
        );
        const targetParseItem = parseDataSourceItem(target) as TPlainObject;
        return {
          label: getValueOrDefault(targetParseItem?.label, value),
          value: getValueOrDefault(targetParseItem?.value, value),
        };
      });
    }
    return valueList;
  }, [
    labelInValue,
    value,
    labelInValueFieldNamesMerge,
    fieldNamesMerge,
    otherProps.treeCheckStrictly,
    state.treeSelectorTiledArray,
    parseDataSourceItem,
  ]);

  const treeSelectValue = useMemo(() => {
    if (isArray(renderValueList) && renderValueList.length === 0) {
      return undefined;
    }
    return isMultiple ? renderValueList : renderValueList[0];
  }, [isMultiple, renderValueList]);

  /**
   *  1. 使用 TreeNode 渲染节点，不能重写 fieldNames 配置
   *  2. 使用 TreeNode 是为了实现 TreeNode ICON
   */
  return (
    <TreeSelect
      dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
      showSearch={true}
      treeLine={{ showLeafIcon: false }}
      treeNodeFilterProp="title"
      switcherIcon={<CaretDownFilled />}
      showArrow
      {...otherProps}
      className={classNames('v-tree-select-wrapper', otherProps.className)}
      popupClassName={classNames(
        'v-tree-select-wrapper-dropdown',
        otherProps.popupClassName
      )}
      onChange={onInnerChange}
      treeExpandedKeys={treeExpandedKeys}
      value={treeSelectValue}
      loading={loading}
      dropdownMatchSelectWidth={false}
      onTreeExpand={onTreeExpand}
      style={{ width: '100%', ...otherProps.style }}
      suffixIcon={
        state.requestStatus === 'request-error' ? (
          <RedoOutlined spin={loading} onClick={onAgainRequest} />
        ) : undefined
      }
      notFoundContent={
        <RequestStatus
          status={state.requestStatus}
          messageConfig={requestMessageConfig}
          loading={loading}
          errorButton={
            <Button type="primary" onClick={onAgainRequest}>
              重新获取数据
            </Button>
          }
        />
      }
    >
      {mapTree(state.treeSelectorList)}
    </TreeSelect>
  );
};
