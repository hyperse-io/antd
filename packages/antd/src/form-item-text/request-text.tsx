import { classNames } from '@dimjs/utils';
import { FormItemWrapper } from '../form-item-wrapper/form-item-wrapper.js';
import { FormItemTextContent } from './content.js';
import { type FormItemTextProps } from './types.js';
import { useRequestFormItemText } from './use-request.js';

/**
 * FormItem 文本显示，默认不换行，超出省略（鼠标悬浮可显示）
 * @param props
 * @returns
 */
export const RequestText = (props: FormItemTextProps) => {
  const { wrap, render, placeholderValue, serviceConfig, ...otherProps } =
    props;
  const requestResult = useRequestFormItemText({
    serviceConfig,
    name: props.name,
  });
  return (
    <FormItemWrapper
      {...otherProps}
      name={undefined}
      className={classNames('form-item-text', props.className)}
    >
      <FormItemTextContent
        loading={requestResult?.loading}
        wrap={wrap}
        render={render}
        placeholderValue={placeholderValue}
        value={requestResult?.viewValue}
        status={requestResult?.status}
        onRequest={requestResult?.onRequest}
        errorMsg={requestResult?.errorMsg}
      />
    </FormItemWrapper>
  );
};
