import {
  Children,
  type CSSProperties,
  type ReactElement,
  useContext,
  useMemo,
  useState,
} from 'react';
import { isFragment } from 'react-is';
import { type FormInstance } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { isUndefined } from '@dimjs/lang';
import { classNames } from '@dimjs/utils';
import { type TAny } from '@hyperse/utils';
import { hooks } from '@wove/react';
import { BlockLayout } from '../block-layout/index.js';
import { ButtonWrapper, ButtonWrapperProps } from '../button-wrapper/index.js';
import { EasyForm, EasyFormProps } from '../easy-form/index.js';
import { fbaHooks } from '../fba-hooks/index.js';
import { type FormOperateColProps } from '../form-grid/form-operate-col.jsx';
import { type FormRowProps } from '../form-grid/form-row.js';
import { FormGrid } from '../form-grid/index.js';
import { EasyTableContext } from './context.js';
import { easyTableModel } from './model.js';

export type EasyTableFilterProps = {
  children:
    | ReactElement
    | ReactElement[]
    | ((form: FormInstance) => ReactElement);
  /** isPure = true时无效 */
  filterOperate?: (form: FormInstance) => FormOperateColProps;
  /** 是否为纯净模式（查询条件布局是否自定义）， */
  isPure?: boolean;
  /** 查询按钮配置 */
  queryButtonProps?: Omit<ButtonWrapperProps, 'onClick'> & { text?: string };
  /** 重置按钮配置 */
  resetButtonProps?: Omit<ButtonWrapperProps, 'onClick'> & { text?: string };
  /**
   * 网格布局设置
   * default = { xs: 24, sm: 12, md: 12, lg: 8, xl: 8, xxl: 6 };
   * small = { xs: 24, sm: 8, md: 8, lg: 6, xl: 6, xxl: 6 };
   */
  formGridSize?: FormRowProps['gridSize'];
  /** filter Form 外层 BlockLayout style */
  filterWrapperStyle?: CSSProperties;
  /** filter Form 外层 BlockLayout className  */
  filterWrapperClassName?: string;
  /**
   * 自定义 filterOperate.rightList 后 默认【查询、重置】按钮处理逻辑
   * 1. cover：覆盖内部查询重置按钮（默认值）
   * 2. beforeAppend：添加到【查询重置】按钮前面
   * 3. afterAppend：添加到【查询重置】按钮后面
   *
   * 如果想隐藏【查询、重置】按钮中的某一个，可设置 queryButtonProps.hidden、resetButtonProps.hidden
   */
  rightOperateAreaAppendType?: 'cover' | 'beforeAppend' | 'afterAppend';
  /** 默认重启按钮触发请求，默认值：true */
  defaultResetButtonTriggerRequest?: boolean;
  easyFormProps?: Omit<
    EasyFormProps,
    'isPure' | 'column' | 'forceColumn' | 'width' | 'gridGutter' | 'children'
  >;
};

/**
 * 过滤条件
 *```
 * 1. 用法1
 *  -- 默认网格布局 规则：{ xs: 24, sm: 12, md: 12, lg: 8, xl: 8, xxl: 6 }
 *  <EasyTableFilter>
 *   <FormItemWrapper name="field1" label="条件1">xxx</FormItemWrapper>
 *  </EasyTableFilter>
 *
 *  -- 自定义网格布局 使用 FormGrid.Col 组件包装 FormItemWrapper
 *  <EasyTableFilter>
 *    <FormGrid.Col span={12}><FormItemWrapper name="field1" label="条件1">xxx</FormItemWrapper></FormGrid.Col>
 *  </EasyTableFilter>
 *
 *  -- children 可为 function
 *  <EasyTableFilter>
 *   {(form) => {
 *     return <FormItemWrapper name="field1" label="条件1">xxx</FormItemWrapper>
 *   }}
 * </EasyTableFilter>
 *
 * 2. 用户2（自定义布局）
 *    EasyTableFilter设置 isPure = true，FormItem无布局规则
 * 3. EasyTableFilter中内置了 Form 标签，当children为函数时，可获取form实例
 * 4. 默认布局下，可通过设置 filterOperate 设置操作按钮
 * 5. Filter 子节点包含 hidden = true 会被忽略
 * 6. 如果想隐藏【查询、重置】按钮中的某一个，可设置 queryButtonProps.hidden、resetButtonProps.hidden
 * 7. 通过设置 defaultResetButtonTriggerRequest，默认重启按钮触发请求，默认值：true
 * 8. EasyTableFilter 子节点可使用 FormItemWrapper，FormItemWrapper中可配置label宽度等
 *```
 */
export const EasyTableFilter = (props: EasyTableFilterProps) => {
  const screenType = fbaHooks.useResponsivePoint() || 'md';
  const ctx = useContext(EasyTableContext);
  const {
    queryButtonProps,
    resetButtonProps,
    filterOperate,
    defaultResetButtonTriggerRequest,
    filterWrapperStyle,
    filterWrapperClassName,
    rightOperateAreaAppendType,
    easyFormProps,
  } = props;
  const {
    modelKey,
    foldKeys,
    fieldNames,
    onRequest,
    pageSize,
    getPaginationStatus,
    initialValues,
    form,
    onFormFinish,
  } = ctx;
  const children =
    typeof props.children === 'function'
      ? props.children(form)
      : props.children;

  const rightOperateAreaAppendTypeFt = rightOperateAreaAppendType || 'cover';
  const childrens = useMemo(() => {
    if (isFragment(children)) {
      return Children.toArray(
        (children as ReactElement).props.children
      ) as ReactElement[];
    } else {
      return Children.toArray(children) as ReactElement[];
    }
  }, [children]);

  const [openFold, setOpenFold] = useState(false);

  const [state, actions] = easyTableModel(modelKey).useStore();

  const onReset = hooks.useCallbackRef(async () => {
    await actions.resetFilterCondition();
    form.resetFields();
    if (
      isUndefined(defaultResetButtonTriggerRequest) ||
      defaultResetButtonTriggerRequest
    ) {
      await form.validateFields();
      if (getPaginationStatus()) {
        onRequest({
          [fieldNames.pageNo]: 1,
          [fieldNames.pageSize]: pageSize,
          ...initialValues,
        });
      } else {
        onRequest(initialValues);
      }
    }
  });

  const formRowChildren = useMemo(() => {
    const defaultRightList = [
      !queryButtonProps?.hidden ? (
        <ButtonWrapper
          key="1"
          type="primary"
          htmlType="submit"
          {...queryButtonProps}
        >
          {queryButtonProps?.text || '查询'}
        </ButtonWrapper>
      ) : null,
      !resetButtonProps?.hidden ? (
        <ButtonWrapper key="2" onClick={onReset} {...resetButtonProps}>
          {resetButtonProps?.text || '重置'}
        </ButtonWrapper>
      ) : null,
    ].filter(Boolean);
    const customFormOperateCol = filterOperate?.(form);
    const customRightList = customFormOperateCol?.rightList;
    const leftList: TAny[] = customFormOperateCol?.leftList || [];

    let rightList: TAny[] = defaultRightList;
    if (customRightList) {
      if (rightOperateAreaAppendTypeFt === 'afterAppend') {
        rightList = [...defaultRightList, ...customRightList];
      } else if (rightOperateAreaAppendTypeFt === 'beforeAppend') {
        rightList = [...customRightList, ...defaultRightList];
      } else {
        rightList = customRightList;
      }
    }
    if (foldKeys.length > 0) {
      const changeFolditem = (
        <ButtonWrapper
          type="link"
          key="fold-trigger"
          style={{ padding: '0' }}
          onClick={() => {
            setOpenFold(!openFold);
          }}
        >
          {openFold ? (
            <span>
              收起
              <UpOutlined style={{ marginLeft: 3, fontSize: 12 }} />
            </span>
          ) : (
            <span>
              展开
              <DownOutlined style={{ marginLeft: 3, fontSize: 12 }} />
            </span>
          )}
        </ButtonWrapper>
      );

      if (rightList.length > 0 || leftList.length === 0) {
        rightList.push(changeFolditem);
      } else if (leftList?.length > 0) {
        leftList.push(changeFolditem);
      }
    }

    return childrens
      .map((item, index) => {
        if (
          !openFold &&
          foldKeys.find((keyItem) => `.$${keyItem}` === item.key)
        )
          return null;
        if (item.props['hidden']) return null;
        if (item.type['domTypeName'] === 'FormCol') return item;
        return <FormGrid.Col key={index}>{item}</FormGrid.Col>;
      })
      .filter(Boolean)
      .concat(
        <FormGrid.OperateCol
          key={999}
          {...customFormOperateCol}
          leftList={leftList}
          rightList={rightList}
        />
      );
  }, [
    childrens,
    filterOperate,
    foldKeys,
    form,
    onReset,
    openFold,
    queryButtonProps,
    resetButtonProps,
    rightOperateAreaAppendTypeFt,
  ]);

  const labelAlign =
    screenType === 'xs' ? 'left' : easyFormProps?.labelAlign || 'right';

  return (
    <BlockLayout
      className={classNames('easy-table-filter', filterWrapperClassName)}
      style={filterWrapperStyle}
    >
      <EasyForm
        form={form}
        autoComplete="off"
        onFinish={onFormFinish}
        initialValues={{
          ...initialValues,
          ...state.queryCondition,
        }}
        isPure={true}
        labelWidth="80"
        formItemGap="15"
        {...easyFormProps}
        labelAlign={labelAlign}
      >
        {props.isPure ? (
          children
        ) : (
          <FormGrid.Row gutter={[15, 0]} gridSize={props.formGridSize}>
            {formRowChildren}
          </FormGrid.Row>
        )}
      </EasyForm>
    </BlockLayout>
  );
};
