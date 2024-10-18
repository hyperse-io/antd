import {
  isValidElement,
  ReactElement,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { Form, FormListOperation, message, Table, TableProps } from 'antd';
import { FormListFieldData, FormListProps } from 'antd/es/form';
import { ColumnsType } from 'antd/es/table';
import { PlusOutlined } from '@ant-design/icons';
import { classNames } from '@dimjs/utils';
import { isUndefinedOrNull, TAny, toArray, TPlainObject } from '@hyperse/utils';
import { ButtonWrapper } from '../button-wrapper/button-wrapper.js';
import { TextSymbolWrapper } from '../text-symbol-wrapper/symbol.js';
import { TipsWrapper, TipsWrapperProps } from '../tips-wrapper/tips-wrapper.js';
import { FormListItem } from './form-list-item/index.js';
import {
  EditableTableName,
  EditableTableRecordType,
  FieldSingleConfig,
  FormListConfig,
} from './type.js';
import './style.less';

type fieldConfigFunctionParams = {
  tableRowIndex: number;
  name: EditableTableName;
  tableRowName: EditableTableName;
  getTableRowData: () => TPlainObject;
};
/**
 * antd 默认render功能此处不能使用
 */
export type EditableTableColumn = Omit<ColumnsType['0'], 'render'> & {
  /**
   * @description 请使用 tipsWrapperProps 属性配置
   * ```
   * 会在 title 之后展示一个 icon，hover 之后提示一些信息
   * 1. title为string类型、ReactElement有效
   * 2. hoverArea 默认值：icon
   * ```
   */
  // tooltip?: string | { content: string; icon?: ReactElement; hoverArea?: 'icon' | 'all' };
  /**
   * 会在 title 之后展示一个 icon
   * ```
   * 1. title为string类型有效
   * 2. 可为icon添加提示效果
   * 3. 可为icon添加点击事件
   * ```
   */
  tipsWrapperProps?: string | TipsWrapperProps;
  dataIndex?: string;
  fieldConfig?:
    | FieldSingleConfig
    | FormListConfig
    | ((data: fieldConfigFunctionParams) => FieldSingleConfig | FormListConfig);
  /** 隐藏域字段 */
  hiddenField?:
    | {
        dataIndex: string;
      }
    | {
        dataIndex: string;
      }[];
  /**
   * 渲染中间件，如果renderMiddleware返回值为ReactElement格式，则会终止后续逻辑，fieldConfig配置将失效
   * ```
   * 1. tableRowIndex: 当前row的索引值
   * 2. name: 当前table单元格的form.item的name值
   * 3. operation Form.List的操作函数
   * 4. 对 table children column渲染无效
   * ```
   */
  renderMiddleware?: (item: {
    tableRowIndex: number;
    name: EditableTableName;
    tableRowName: EditableTableName;
    operation: FormListOperation;
    index: number;
  }) => ReactElement | null;
  /** table datasource children column 自定义渲染  */
  tableChildrenColumnRender?: (
    value: TAny,
    record: TPlainObject,
    index: number
  ) => ReactElement | null;
  /** 为表格header中的字段添加必填标识，无验证拦截功能 */
  required?: boolean;
};

export type EditableTableProps = {
  /** FormList name属性 */
  name: EditableTableName;

  /**
   * 当前Edittable处在formList内部时（必填），完整formItem的name
   * ```
   * 例如 处在formList内部
   * 1. name=[0,dataList]
   * 2. prevCompleteName=[array, 0, dataList]
   * ```
   */
  completeName?: Array<string | number>;
  /**
   * 表格行数据，唯一值字段Key
   * ```
   * 1. 如果数据中没有可前端添加key
   * 2. 有问题可咨询 xg15472
   * ```
   */
  uidFieldKey: string;
  /**
   * ```
   * antd table属性
   * 1. 新增cellVerticalAlign，单元格竖直方向对齐方式，设置table column onCell属性后失效
   * ```
   */
  tableProps?: Omit<
    TableProps<EditableTableRecordType>,
    'dataSource' | 'columns' | 'rowKey'
  > & {
    cellVerticalAlign?: 'baseline' | 'middle' | 'top' | 'bottom';
  };
  columns: EditableTableColumn[];
  onTableBeforeRender?: (
    formListOperation: FormListOperation,
    nextRowIndex: number
  ) => ReactElement | null;
  /**
   * 设置后，将覆盖底部`新增`按钮
   */
  onTableAfterRender?: (
    formListOperation: FormListOperation,
    nextRowIndex: number
  ) => ReactElement | null;

  /** 新增行默认值，自定义onTableAfterRender后失效 */
  getAddRowDefaultValues?: () => TPlainObject;

  /** 隐藏底部`新增`按钮，设置 onTableAfterRender后 失效 */
  hiddenFooterBtn?: boolean;
  /**
   * Form.List rules
   * ```
   rules={[
      {
        validator: async (_, names) => {
          if (!names || names.length < 2) {
            return Promise.reject(new Error('At least 2 passengers'));
          }
        },
      },
    ]}
   * ```
   */
  rules?: FormListProps['rules'];
  /** 空效果显示尺寸，默认值：small */
  emptyShowSize?: 'small' | 'large';
};

/**
 * 可编辑表格（通过FormList实现）
 * demo：https://fex.qa.tcshuke.com/docs/admin/main/table/row-editable1
 * ```
 * 1. 表格数据必须要有唯一值字段，通过属性uidFieldKey设置
 * 2. 通过 tableProps 设置Table属性，table size默认：small
 * 3. Table children column 不可编辑
 * 4. 当存在折叠children数据时，组件会在children中内置_isChildrenItem字段
 * 5. 可通过tableChildrenColumnRender自定义渲染 table children column 显示
 * 6. 4.5.0版本移除 ref.getTableItemDataByFormListItemKey 功能，可选择表格参考（https://fex.qa.tcshuke.com/docs/admin/main/table/row-editable2）
 * ```
 */
export const EditableTable = (props: EditableTableProps) => {
  const form = Form.useFormInstance();

  const formListFieldsRef = useRef<FormListFieldData[]>([]);

  const columnsIncludeUidKey = useMemo(() => {
    const hasUid = props.columns.find(
      (item) => item['dataIndex'] === props.uidFieldKey
    );
    return !!hasUid;
  }, [props.columns, props.uidFieldKey]);

  const columns = useMemo(() => {
    if (!props.columns) return [];
    return props.columns.map((columnItem) => {
      const {
        fieldConfig,
        renderMiddleware,
        tableChildrenColumnRender,
        // tooltip,
        title,
        tipsWrapperProps,
        required,
        align,
        ...otherColumnItem
      } = columnItem;
      const support = isValidElement(title) || typeof title === 'string';
      let titleRender: ReactElement | string;
      if (tipsWrapperProps && support) {
        if (typeof tipsWrapperProps === 'string') {
          titleRender = (
            <TipsWrapper
              tipType="popover"
              popoverProps={{ content: tipsWrapperProps }}
            >
              {title}
            </TipsWrapper>
          );
        } else {
          titleRender = (
            <TipsWrapper {...tipsWrapperProps}>{title}</TipsWrapper>
          );
        }
      }
      // else if (tooltip) {
      //   titleRender = <TableTitleTooltip title={title as string} tooltip={tooltip} />;
      // }
      else {
        titleRender = title as string;
      }
      return {
        title: required ? (
          <TextSymbolWrapper
            style={{ marginLeft: align === 'center' ? undefined : 10 }}
            text={titleRender}
            position="before"
            symbolType="required"
          />
        ) : (
          titleRender
        ),
        onCell: () => {
          return {
            valign: props.tableProps?.cellVerticalAlign || 'middle',
          };
        },
        ...otherColumnItem,
        render: (_value, record, index) => {
          if (record['_isChildrenItem']) {
            if (tableChildrenColumnRender) {
              return tableChildrenColumnRender(_value, record, index);
            }
            return _value;
          }
          const tableRowName = [
            ...toArray<string | number>(props.name as TAny),
            record.name,
          ];
          const completeName = columnItem.dataIndex
            ? [...tableRowName, columnItem.dataIndex]
            : tableRowName;
          const customRender = renderMiddleware?.({
            name: completeName,
            tableRowIndex: record.name,
            operation: record.operation,
            tableRowName,
            index,
          });
          if (customRender) {
            return customRender;
          }

          const fieldConfigActual =
            typeof fieldConfig === 'function'
              ? fieldConfig({
                  name: completeName,
                  tableRowIndex: record.name,
                  tableRowName,
                  getTableRowData: () => {
                    return form.getFieldValue(tableRowName);
                  },
                })
              : fieldConfig;
          let hiddenFieldList = toArray<{ dataIndex: string }>(
            columnItem.hiddenField
          );
          if (!columnsIncludeUidKey && index === 0) {
            hiddenFieldList = hiddenFieldList.concat([
              { dataIndex: props.uidFieldKey },
            ]);
          }
          return (
            <FormListItem
              name={
                columnItem.dataIndex
                  ? [record.name, columnItem.dataIndex]
                  : [record.name]
              }
              completeName={completeName}
              fieldConfig={fieldConfigActual}
              tableRowIndex={record.name}
              hiddenFieldList={hiddenFieldList}
            />
          );
        },
      };
    }) as ColumnsType<EditableTableRecordType>;
  }, [
    props.columns,
    props.tableProps?.cellVerticalAlign,
    props.name,
    props.uidFieldKey,
    columnsIncludeUidKey,
    form,
  ]);

  const formListDataSource = Form.useWatch(props.name, form);

  useEffect(() => {
    const names = toArray<string>(props.name);
    if (names[0] === undefined || /^\d+$/.test(`${names[0]}`)) {
      void message.error(
        '当前Editable处在FormList内部，必须赋值completeName参数'
      );
    }
  }, [props.name]);

  return (
    <div
      className={classNames('editable-table', {
        'et-empty-show-large': props.emptyShowSize === 'large',
      })}
    >
      <Form.List name={props.name} rules={props.rules}>
        {(fields, formListOperation, { errors }) => {
          formListFieldsRef.current = fields;
          return (
            <div
              style={{
                borderRadius: '6px',
                border: errors?.length
                  ? '1px solid #ff4d4f'
                  : '1px solid transparent',
              }}
            >
              {props.onTableBeforeRender
                ? props.onTableBeforeRender(formListOperation, fields.length)
                : null}
              <Table
                scroll={{ x: 'max-content' }}
                pagination={false}
                size="small"
                {...props.tableProps}
                rowKey={(record) => {
                  const completeName = props.completeName || [];
                  const names = toArray(props.name);
                  const target = completeName.length
                    ? form.getFieldValue([...completeName, record['_index']])
                    : form.getFieldValue([...names, record['_index']]);
                  const key = target?.[props.uidFieldKey];
                  if (isUndefinedOrNull(key)) {
                    console.warn(
                      `EditableTable 通过入参uidFieldKey：${props.uidFieldKey}，未获取到表格行唯一值数据`
                    );
                  }
                  return key;
                }}
                dataSource={fields.map((item, index) => {
                  const children = formListDataSource?.[item.name]?.children as
                    | TPlainObject[]
                    | undefined;
                  if (children) {
                    children.forEach((item) => {
                      item['_isChildrenItem'] = true;
                    });
                  }
                  return {
                    ...item,
                    _index: index,
                    operation: formListOperation,
                    children,
                  };
                })}
                columns={columns}
              />
              {props.onTableAfterRender ? (
                props.onTableAfterRender(formListOperation, fields.length)
              ) : (
                <ButtonWrapper
                  type="dashed"
                  hidden={props.hiddenFooterBtn}
                  onClick={() =>
                    formListOperation.add(props.getAddRowDefaultValues?.())
                  }
                  block
                  icon={<PlusOutlined />}
                  style={{ marginTop: 15 }}
                >
                  新增
                </ButtonWrapper>
              )}
              <Form.ErrorList
                errors={
                  errors.length
                    ? [
                        <div
                          style={{
                            color: '#ff4d4f',
                            padding: '5px',
                          }}
                          key="0"
                        >
                          {errors}
                        </div>,
                      ]
                    : undefined
                }
              />
            </div>
          );
        }}
      </Form.List>
    </div>
  );
};
