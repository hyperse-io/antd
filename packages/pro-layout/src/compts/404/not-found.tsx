import { Result } from 'antd';

export const NotFound = () => {
  return (
    <Result status="404" title="404" subTitle="Sorry, 您访问的地址不存在" />
  );
};
