import { Form, FormItemProps, InputNumberProps } from 'antd';
import { classNames } from '@dimjs/utils';
import { AmountFenInput } from '../amount-fen-input/amount-fen-input.jsx';
import './style.less';

export type AmountFenInputFormItemProps = FormItemProps & {
  inputNumberProps?: Omit<
    InputNumberProps,
    'value' | 'onChange' | 'defaultValue'
  >;
};

/**
 * 分金额输入组件（集成了FormItem），入参为分，返回为分，显示为元
 * ```
 * 例如：
 *      <AmountFenInputFormItem
 *        inputNumberProps={{ placeholder: '请输入', style: { width: 'auto' } }}
 *        name="amount"
 *        label="金额"
 *      />
 * ```
 */
export const AmountFenInputFormItem = (props: AmountFenInputFormItemProps) => {
  const { inputNumberProps, ...otherProps } = props;
  return (
    <Form.Item
      {...otherProps}
      label={
        otherProps.label ? (
          <span className="afifi-color">{otherProps.label}</span>
        ) : undefined
      }
      className={classNames('amount-fen-input-form-item', otherProps.className)}
    >
      <AmountFenInput {...inputNumberProps} />
    </Form.Item>
  );
};
