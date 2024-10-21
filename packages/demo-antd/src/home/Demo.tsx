import { ButtonWrapper } from '@hyperse/antd';
import { toArray } from '@hyperse/utils';

export const Demo = () => {
  console.log(toArray(undefined));
  return (
    <div>
      <ButtonWrapper>xxx</ButtonWrapper>
    </div>
  );
};
