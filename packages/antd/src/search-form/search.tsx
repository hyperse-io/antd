import {
  Children,
  type CSSProperties,
  forwardRef,
  type ReactElement,
  useImperativeHandle,
  useMemo,
} from 'react';
import { isFragment } from 'react-is';
import { Form, type FormInstance } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { classNames } from '@dimjs/utils';
import { type TAny, type TPlainObject } from '@hyperse/utils';
import { hooks } from '@wove/react';
import {
  ButtonWrapper,
  type ButtonWrapperProps,
} from '../button-wrapper/index.js';
import { fbaHooks } from '../fba-hooks/index.js';
import { type FormOperateColProps } from '../form-grid/form-operate-col.jsx';
import { type FormRowProps } from '../form-grid/form-row.jsx';
import { FormGrid } from '../form-grid/index.js';
import { FormWrapper, type FormWrapperProps } from '../form-wrapper/index.js';
import { searchFormModel } from './model.js';
import './style.less';

export type SearchFormProps = {
  children:
    | ReactElement
    | ReactElement[]
    | ((form: FormInstance) => ReactElement);
  /** isPure = true时无效 */
  searchOperate?: (form: FormInstance) => FormOperateColProps;
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
  formClassName?: string;
  formStyle?: CSSProperties;
  /** form 初始值 */
  formInitialValues?: TPlainObject;
  /** label宽度，Form内部所有FormItem label都生效 */
  formLabelWidth?: FormWrapperProps['labelWidth'];
  /** labelItem 竖直布局 */
  formLabelItemVertical?: FormWrapperProps['labelItemVertical'];
  /** label 对齐方式 */
  formLabelAlign?: FormWrapperProps['labelAlign'];
  /** formItem之间竖直间距，默认值：24 */
  formFormItemGap?: FormWrapperProps['formItemGap'];
  /**
   * 自定义 searchOperate.rightList 后 默认【查询、重置】按钮处理逻辑
   * 1. cover：覆盖内部查询重置按钮（默认值）
   * 2. beforeAppend：添加到【查询重置】按钮前面
   * 3. afterAppend：添加到【查询重置】按钮后面
   *
   * 如果想隐藏【查询、重置】按钮中的某一个，可设置 queryButtonProps.hidden、resetButtonProps.hidden
   */
  rightOperateAreaAppendType?: 'cover' | 'beforeAppend' | 'afterAppend';
  /** 默认重启按钮触发请求，默认值：true */
  defaultResetButtonTriggerRequest?: boolean;
  /**
   * 展开、收起key值列表（内容当前组件子组件key值）
   */
  foldKeys?: string[];
  /**
   * 按钮提交事件
   * 如果需要自定义回车提交事件，需要自定义提交按钮
   */
  onFormFinish?: (values?: TPlainObject) => void;
  /** 重置按钮 */
  onReset?: () => void;
  /** 查询按钮 */
  onQuery?: (values: TPlainObject) => void;
  /**
   * 是否缓存查询数据，默认值：true
   * ```
   * 1. 一般首页可缓存，二级、三级等页面不能缓存
   * ```
   */
  cacheSwitch?: boolean;
  /** 初始化是否请求，默认值：true */
  initRequest?: boolean;
  form?: FormInstance;
};

export type SearchFormRefApi = {
  onQuery: (values?: TPlainObject) => void;
  form: FormInstance;
};

/**
 * 搜索表单
 *
 *```
 * 1. 用法1
 *  -- 默认网格布局 规则：{ xs: 24, sm: 12, md: 12, lg: 8, xl: 8, xxl: 6 }
 *  <SearchForm>
 *   <Form.Item name="field1" label="条件1">xxx</Form.Item>
 *  </SearchForm>
 *
 *  -- 自定义网格布局 使用 FormCol组件包装 Form.Item
 *  <SearchForm>
 *    <FormCol span={12}><Form.Item name="field1" label="条件1">xxx</Form.Item></FormCol>
 *  </SearchForm>
 *
 *  -- children 可为 function
 *  <SearchForm>
 *   {(form) => {
 *     return <Form.Item name="field1" label="条件1">xxx</Form.Item>
 *   }}
 * </SearchForm>
 *
 * 2. 用户2（自定义布局）
 *    SearchForm设置 isPure = true，FormItem无布局规则
 * 3. SearchForm中内置了 Form 标签，当children为函数时，可获取form实例
 * 4. 默认布局下，可通过设置 searchOperate 设置操作按钮
 * 5. SearchForm 子节点包含 hidden = true 会被忽略
 * 6. 如果想隐藏【查询、重置】按钮中的某一个，可设置 queryButtonProps.hidden、resetButtonProps.hidden
 * 7. 通过设置 defaultResetButtonTriggerRequest，可在右侧按钮区域新增自定义按钮
 * 8. 可设置 cacheSwitch 来控制是否缓存查询数据（一般一级页面可缓存，二级、三级等不能缓存），
 *    缓存数据存储在内存中，react路由跳转可正常读取缓存，浏览器刷新后缓存丢失
 *```
 */
export const SearchForm = forwardRef<SearchFormRefApi, SearchFormProps>(
  (props, ref) => {
    const searchFormId = hooks.useId(undefined, 'search-form-key');

    const modelKey = useMemo(() => {
      return props.cacheSwitch === false ? searchFormId : location.pathname;
    }, [searchFormId, props.cacheSwitch]);

    const [state, actions] = searchFormModel(modelKey).useStore();
    const [form] = Form.useForm(props.form);
    const {
      queryButtonProps,
      resetButtonProps,
      searchOperate,
      formClassName,
      rightOperateAreaAppendType,
      onQuery,
      onReset,
      initRequest,
      onFormFinish,
      defaultResetButtonTriggerRequest,
    } = props;
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

    const onInnerQuery = (values) => {
      Object.keys(values).forEach((key) => {
        if (key.startsWith('__#invalid_date_')) {
          delete values[key];
        }
      });
      void actions.updateFilterCondition(values);
      void onQuery?.(values || {});
    };

    const onInnerReset = hooks.useCallbackRef(async () => {
      await actions.resetFilterCondition();
      setTimeout(() => {
        form.resetFields();
      }, 200);
      onReset?.();
      if (defaultResetButtonTriggerRequest === false) {
        return;
      }
      void onInnerQuery({});
    });

    const onInnerFormFinish = (values) => {
      if (onFormFinish) {
        onFormFinish(values);
        return;
      }
      void onInnerQuery(values);
    };

    const formRowChildren = useMemo(() => {
      const defaultRightList = [
        !queryButtonProps?.hidden ? (
          <ButtonWrapper
            key="1"
            type="primary"
            htmlType={'submit'}
            loadingPosition="center"
            {...queryButtonProps}
          >
            {queryButtonProps?.text || '查询'}
          </ButtonWrapper>
        ) : null,
        !resetButtonProps?.hidden ? (
          <ButtonWrapper key="2" onClick={onInnerReset} {...resetButtonProps}>
            {resetButtonProps?.text || '重置'}
          </ButtonWrapper>
        ) : null,
      ].filter(Boolean);
      const customFormOperateCol = searchOperate?.(form);
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

      if (props.foldKeys?.length) {
        const changeFolditem = (
          <ButtonWrapper
            type="link"
            key="fold-trigger"
            style={{ padding: '0' }}
            onClick={() => {
              void actions.onChangeOpenFold(!state.openFold);
            }}
          >
            {state.openFold ? (
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
            !state.openFold &&
            props.foldKeys?.find((keyItem) => `.$${keyItem}` === item.key)
          ) {
            return null;
          }
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
      queryButtonProps,
      resetButtonProps,
      onInnerReset,
      searchOperate,
      form,
      props.foldKeys,
      childrens,
      rightOperateAreaAppendTypeFt,
      state.openFold,
      actions,
    ]);

    fbaHooks.useEffectCustom(() => {
      if ((initRequest === false && !state.isInit) || initRequest !== false) {
        void onQuery?.({
          ...props.formInitialValues,
          ...state.queryCondition,
        });
      }
      void actions.updateInitStatus();
    }, []);

    useImperativeHandle(ref, () => {
      return {
        onQuery: onInnerQuery,
        form,
      };
    });

    return (
      <FormWrapper
        form={form}
        autoComplete="off"
        onFinish={onInnerFormFinish}
        initialValues={{
          ...props.formInitialValues,
          ...state.queryCondition,
        }}
        className={classNames('search-form', formClassName)}
        style={props.formStyle}
        labelWidth={props.formLabelWidth}
        labelAlign={props.formLabelAlign}
        formItemGap={props.formFormItemGap}
        labelItemVertical={props.formLabelItemVertical}
      >
        {props.isPure ? (
          children
        ) : (
          <FormGrid.Row gutter={[15, 0]} gridSize={props.formGridSize}>
            {formRowChildren}
          </FormGrid.Row>
        )}
      </FormWrapper>
    );
  }
);
