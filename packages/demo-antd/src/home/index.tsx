import { bootstrap } from '@hyperse/pro-layout';
import { Demo } from './Demo';
bootstrap({
  layoutMode: 'no-layout',
  routeList: [
    {
      path: '/',
      element: <Demo />,
      breadConfig: 'demo1列表',
    },
  ],
});
