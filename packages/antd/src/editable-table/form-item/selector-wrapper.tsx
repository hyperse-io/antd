import { Fragment, useEffect, useState } from 'react';
import { Form, Tag } from 'antd';
import { isArray } from '@dimjs/lang';
import { classNames } from '@dimjs/utils';
import {
  arrayField2LabelValue,
  LabelValueItem,
  TAny,
  TPlainObject,
} from '@hyperse/utils';
import { hooks } from '@wove/react';
import { SelectorWrapper } from '../../selector-wrapper/index.js';
import { EditableFormItemProps, EditableSelectWrapperConfig } from '../type.js';

type FormItemContentProps = Omit<EditableFormItemProps, 'formItemProps'> & {
  value?: string | number | Array<string | number>;
  onChange?: (value: TAny) => void;
};

const FormItemContent = (props: FormItemContentProps) => {
  const { editableConfig, editable, render } = props.fieldConfig;
  const editableComptProps = (editableConfig as EditableSelectWrapperConfig)
    .editableComptProps;
  const [selectorList, setSelectorList] = useState<LabelValueItem[]>([]);
  const [viewLabelList, setviewLabelList] = useState<LabelValueItem[]>([]);

  useEffect(() => {
    if (!editable) {
      const value = (
        isArray(props.value)
          ? props.value
          : props.value === undefined
            ? []
            : [props.value]
      ) as string[];
      if (selectorList.length === 0) {
        setviewLabelList(value.map((item) => ({ label: item, value: item })));
      }
      const returnList = [] as LabelValueItem[];
      value.forEach((item) => {
        const target = selectorList.find((temp) => temp.value === item);
        returnList.push(target ? target : { label: String(item), value: item });
      });
      setviewLabelList(returnList);
    }
  }, [editable, editableComptProps.fieldNames, props.value, selectorList]);

  const onSelectorListAllChange = hooks.useCallbackRef(
    (dataList: TPlainObject[]) => {
      setSelectorList(
        arrayField2LabelValue(dataList || [], editableComptProps.fieldNames)
      );
    }
  );

  const onChange = hooks.useCallbackRef((value, selectList) => {
    props.onChange?.(value);
    editableComptProps.onChange?.(value, selectList);
  });

  if (editable) {
    return (
      <SelectorWrapper
        {...editableComptProps}
        value={props.value}
        onChange={onChange}
        onSelectorListAllChange={onSelectorListAllChange}
      />
    );
  }
  return (
    <Fragment>
      <div style={{ display: 'none' }}>
        <SelectorWrapper
          {...editableComptProps}
          onSelectorListAllChange={onSelectorListAllChange}
        />
      </div>
      <span className="editable-selector-view">
        {render
          ? render(props.value, selectorList)
          : viewLabelList.map((tag, index) => (
              <Tag key={index} color={'geekblue'}>
                {tag.label}
              </Tag>
            ))}
      </span>
    </Fragment>
  );
};

export const SelectorWrapperFormItem = (props: EditableFormItemProps) => {
  const { formItemProps } = props.fieldConfig;

  return (
    <Form.Item
      {...formItemProps}
      name={props.name}
      className={classNames(
        'editable-selector-wrapper-form-item',
        formItemProps?.className
      )}
    >
      <FormItemContent {...props} />
    </Form.Item>
  );
};
