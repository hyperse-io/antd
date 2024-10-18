import { Result } from 'antd';

export type Page404Props = {
  message?: string;
};

export const Page404 = (props: Page404Props) => {
  return <Result status="404" title="404" subTitle={props.message} />;
};
