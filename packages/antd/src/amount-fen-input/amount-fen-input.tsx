import { InputNumber, type InputNumberProps } from 'antd';
import { flatbizPrice, isUndefinedOrNull } from '@hyperse/utils';

export type AmountFenInputProps = Omit<InputNumberProps, 'defaultValue'> & {
  value?: number;
  onChange?: (value?: number) => void;
};

export const AmountFenInput = (props: AmountFenInputProps) => {
  const value = isUndefinedOrNull(props.value)
    ? undefined
    : flatbizPrice.fen2yuan(props.value);
  return (
    <InputNumber
      {...props}
      style={{ width: '100%', ...props.style }}
      value={value}
      onChange={(value) => {
        props.onChange?.(
          isUndefinedOrNull(value)
            ? undefined
            : Number(flatbizPrice.yuan2fen(value as number))
        );
      }}
    />
  );
};
