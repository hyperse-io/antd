import { Fragment, type ReactElement, useRef } from 'react';
import { Empty, Form, type FormListFieldData } from 'antd';
import { classNames } from '@dimjs/utils';
import { getUuid, toArray } from '@hyperse/utils';
import { ButtonWrapper } from '../button-wrapper/index.js';
import { FormItemGroup } from '../form-item-group/index.js';
import { TextSymbolWrapper } from '../text-symbol-wrapper/index.js';
import { type FormListWrapperProps } from './types.js';
import './style.less';

type FormListChildrenWrapperProps = {
  wrapper?: FormListWrapperProps['formListChildrenWrapper'];
  children: ReactElement;
};
const FormListChildrenWrapper = (props: FormListChildrenWrapperProps) => {
  if (props.wrapper) return props.wrapper({ children: props.children });
  return props.children;
};

const FormListTitleRender = (props: {
  formListItemTitleList: FormListWrapperProps['formListItemTitleList'];
  formListItemTitleHProps?: FormListWrapperProps['formListItemTitleHorizontalUnionProps'];
}) => {
  return (
    <FormItemGroup.HorizontalUnion
      {...props.formListItemTitleHProps}
      style={{ marginBottom: 10, ...props.formListItemTitleHProps?.style }}
      groupConfigList={
        props.formListItemTitleList?.map((item) => {
          if (item.required) {
            return {
              width: item.width,
              mainItem: (
                <div style={{ textAlign: 'center' }}>
                  <TextSymbolWrapper text={item.title} symbolType="required" />
                </div>
              ),
            };
          }
          return {
            width: item.width,
            mainItem: <div style={{ textAlign: 'center' }}>{item.title}</div>,
          };
        }) || []
      }
    />
  );
};

/**
 * Form.List 包装组件，使用更简单
 * ```
 * Demo: https://fex.qa.tcshuke.com/docs/admin/main/form/list
 * 1. FormList数组中必须要有唯一值字段，默认值字段名称uid，可通过uidFieldName自定义设置
 * 2. 通过 itemGap 设置FormList Item 之间间隙
 * ```
 */
export const FormListWrapper = (props: FormListWrapperProps) => {
  const stageCompleteName = [
    ...props.prevCompleteName,
    ...toArray(props.name),
  ] as Array<string | number>;
  const form = Form.useFormInstance();
  const formListOperationRef = useRef<FormListFieldData[]>([]);
  const uidFieldName = props.uidFieldName || 'uid';
  const formListValue = Form.useWatch(stageCompleteName, form);

  const gapHalf = props.itemGap ? props.itemGap / 2 : 8;

  return (
    <div
      className={classNames('form-list-wrapper', props.className)}
      style={props.style}
    >
      <Form.List name={props.name} rules={props.rules}>
        {(fields, operation, { errors }) => {
          formListOperationRef.current = fields;
          return (
            <div
              style={{
                borderRadius: '6px',
                border: errors?.length
                  ? '1px solid #ff4d4f'
                  : '1px solid transparent',
              }}
            >
              {props.formListItemTitleList?.length ? (
                <FormListTitleRender
                  formListItemTitleList={props.formListItemTitleList}
                  formListItemTitleHProps={
                    props.formListItemTitleHorizontalUnionProps
                  }
                />
              ) : null}
              {!props.hiddenEmptyRender && !formListValue?.length ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  style={{ margin: '15px 0' }}
                />
              ) : null}
              <Fragment>
                <FormListChildrenWrapper
                  wrapper={props.formListChildrenWrapper}
                >
                  <Fragment>
                    {fields.map((field, index) => {
                      const formStageCompleteName = [
                        ...stageCompleteName,
                        field.name,
                      ];
                      return (
                        <div
                          key={field.key}
                          className="form-list-item-content"
                          style={{ padding: `${gapHalf}px 0 ${gapHalf}px 0` }}
                        >
                          {props.children({
                            formListFieldData: field,
                            operation: operation,
                            formStageCompleteName,
                            prevCompleteName: stageCompleteName,
                            index,
                            getInsideFormItemName: (key) => {
                              const keys = toArray<string>(key);
                              return [field.name, ...keys];
                            },
                            getInsideFormItemData: () => {
                              return form.getFieldValue(formStageCompleteName);
                            },
                            uidKey: uidFieldName,
                          })}
                        </div>
                      );
                    })}
                  </Fragment>
                </FormListChildrenWrapper>
                {props.onCustomAddRowButton ? (
                  props.onCustomAddRowButton(operation)
                ) : (
                  <ButtonWrapper
                    hidden={props.hiddenAddRowButton}
                    type="dashed"
                    block
                    onClick={() =>
                      operation.add({
                        [uidFieldName]: getUuid(),
                        ...props.getAddRowDefaultValues?.(),
                      })
                    }
                  >
                    添加
                  </ButtonWrapper>
                )}

                <Form.ErrorList
                  errors={
                    errors?.length
                      ? [
                          <div
                            key="0"
                            style={{
                              color: '#ff4d4f',
                              padding: '5px',
                            }}
                          >
                            {errors}
                          </div>,
                        ]
                      : undefined
                  }
                />
              </Fragment>
            </div>
          );
        }}
      </Form.List>
    </div>
  );
};
