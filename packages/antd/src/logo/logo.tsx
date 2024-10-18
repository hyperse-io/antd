import { FileAddFilled } from '@ant-design/icons';
import { isArray } from '@dimjs/lang';

export const Logo = () => {
  const result = isArray([1, 2, 3]);
  return (
    <div>
      <FileAddFilled />
      {result.toString()}
    </div>
  );
};
