import { Fragment } from 'react';
import { isArray } from '@dimjs/lang';
import { toArray } from '@hyperse/utils';
import { FormItemHidden } from '../../form-item-hidden';
import { FormItemAdapter } from '../form-item';
import { TextFormItem } from '../form-item/text';
import { FieldSingleConfig, FormListConfig } from '../type';
import { FormList } from './form-list';

export type FormListItemProps = {
  name: Array<number | string>;
  fieldConfig?: FieldSingleConfig | FormListConfig;
  tableRowIndex: number;
  completeName: (string | number)[];
  hiddenFieldList?: { dataIndex: string }[];
};

export const FormListItem = (props: FormListItemProps) => {
  if (props.fieldConfig) {
    if (isArray(props.fieldConfig['editableConfigList'])) {
      const formListConfig = props.fieldConfig as FormListConfig;
      return (
        <FormList
          name={props.name}
          completeName={props.completeName}
          formListConfig={formListConfig}
          tableRowIndex={props.tableRowIndex}
        />
      );
    } else {
      return (
        <Fragment>
          <FormItemAdapter
            name={props.name}
            fieldConfig={props.fieldConfig as FieldSingleConfig}
            tableRowIndex={props.tableRowIndex}
            completeName={props.completeName}
          />
          {props.hiddenFieldList?.map((item, index) => {
            return (
              <FormItemHidden
                key={index}
                name={[props.tableRowIndex, ...toArray(item.dataIndex)]}
              />
            );
          })}
        </Fragment>
      );
    }
  }
  return <TextFormItem name={props.name} />;
};
