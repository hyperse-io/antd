import { Button, Form, Space } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { classNames } from '@dimjs/utils';
import { FormItemAdapter } from '../form-item/index.jsx';
import { type FormListConfig } from '../type.js';
import { getEditable } from '../utils.js';

export type FormListProps = {
  name: Array<number | string>;
  formListConfig: FormListConfig;
  tableRowIndex: number;
  completeName: (string | number)[];
};

export const FormList = (props: FormListProps) => {
  const from = Form.useFormInstance();
  const {
    onFormListBeforeRender,
    editableConfigList,
    onFormListAfterRender,
    onFormListItemBeforeRender,
    onFormListItemAfterRender,
    deleteOperateRender,
  } = props.formListConfig;
  return (
    <Form.List name={props.name}>
      {(fields, { add, remove }) => (
        <>
          {onFormListBeforeRender
            ? onFormListBeforeRender({
                tableRowIndex: props.tableRowIndex,
                add,
                get value() {
                  return from.getFieldValue(props.completeName);
                },
              })
            : null}
          {fields.map((fieldChild, index) => {
            const hasEditable = editableConfigList.find((item) =>
              getEditable(item.editable, props.tableRowIndex)
            );
            const className = classNames(
              'editable-inner-formlist-item',
              `editable-inner-formlist-item-${props.name[1]}`,
              { 'editable-inner-formlist-item_preview': !hasEditable }
            );
            return (
              <div key={index} className={className}>
                {onFormListItemBeforeRender?.({
                  add,
                  remove: () => {
                    remove(index);
                  },
                  formListItemIndex: index,
                  tableRowIndex: props.tableRowIndex,
                  get value() {
                    return from.getFieldValue([
                      ...props.completeName,
                      fieldChild.name,
                    ]);
                  },
                })}
                <Space>
                  {editableConfigList.map((fieldItem, index) => {
                    return (
                      <FormItemAdapter
                        name={[fieldChild.name, fieldItem.fieldName]}
                        fieldConfig={fieldItem}
                        key={index}
                        tableRowIndex={props.tableRowIndex}
                        completeName={[...props.completeName, fieldChild.name]}
                      />
                    );
                  })}
                  {hasEditable ? (
                    <DeleteFormListItem
                      deleteOperateRender={deleteOperateRender}
                      remove={() => {
                        remove(index);
                      }}
                      index={index}
                    />
                  ) : undefined}
                </Space>
                {onFormListItemAfterRender?.({
                  add,
                  formListItemIndex: index,
                  tableRowIndex: props.tableRowIndex,
                  remove: () => {
                    remove(index);
                  },
                  get value() {
                    return from.getFieldValue([
                      ...props.completeName,
                      fieldChild.name,
                    ]);
                  },
                })}
              </div>
            );
          })}
          {onFormListAfterRender
            ? onFormListAfterRender({
                tableRowIndex: props.tableRowIndex,
                add,
                get value() {
                  return from.getFieldValue(props.completeName);
                },
              })
            : null}
        </>
      )}
    </Form.List>
  );
};

const DeleteFormListItem = (props: {
  deleteOperateRender: FormListConfig['deleteOperateRender'];
  remove: () => void;
  index: number;
}) => {
  return (
    <Form.Item>
      {props.deleteOperateRender ? (
        props.deleteOperateRender({
          remove: props.remove,
          formListItemIndex: props.index,
        })
      ) : (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={props.remove}
        >
          删除
        </Button>
      )}
    </Form.Item>
  );
};
