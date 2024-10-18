import { Fragment } from 'react';
import { classNames } from '@dimjs/utils';
import { FormItemHidden } from '../form-item-hidden/form-item-hidden.js';
import { FormItemWrapper } from '../form-item-wrapper/form-item-wrapper.js';
import { FormItemTextContent } from './content.js';
import { RequestText } from './request-text.js';
import { type FormItemTextProps } from './types.js';
import './style.less';
/**
 * FormItem 文本显示，默认不换行，超出省略（鼠标悬浮可显示）
 * ```
 * 可通过配置 serviceConfig 通过接口获取数据，一般用于 Select 数据显示
 *
 * 例如：
 * 1. 基本数据渲染
 * <FormItemText name="xxx" label="xxx" />
 * 2. 对象数据渲染
 * <FormItemText
 *   name="xxx"
 *   label="xxx"
 *   render={(value) => {
 *     const target = [].find(
 *       (item) => item.value === value,
 *     );
 *     return target ? (
 *       <Tag color={target['color']}>{target.label}</Tag>
 *     ) : null;
 *   }}
 * />
 * 3. 接口数据渲染
 * <FormItemText
 *   name="xxx"
 *   label="xxx"
 *   serviceConfig={{
 *     onRequest: () => {
 *       return serviceHandle.request('/random/api9468', {}, 'post');
 *     },
 *     onResponseAdapter: (dataList: TPlainObject[], value) => {
 *       return dataList?.find((item) => item.value === value);
 *     },
 *   }}
 *   render={(dataItem) => {
 *     return dataItem ? (
 *       <Tag style={{ margin: 0 }} color={dataItem['color']}>
 *         {dataItem.label}
 *       </Tag>
 *     ) : null;
 *   }}
 * />
 * ```
 */
export const FormItemText = (props: FormItemTextProps) => {
  const { wrap, render, placeholderValue, ...otherProps } = props;

  if (props.serviceConfig) {
    return (
      <Fragment>
        <FormItemHidden name={props.name} />
        <RequestText {...props} />
      </Fragment>
    );
  }

  return (
    <FormItemWrapper
      {...otherProps}
      className={classNames('form-item-text', props.className)}
    >
      <FormItemTextContent
        wrap={wrap}
        render={render}
        placeholderValue={placeholderValue}
      />
    </FormItemWrapper>
  );
};

FormItemText['domTypeName'] = 'FormItemText';
