import { bootstrap } from '@hyperse/pro-layout';
import { Demo } from './Demo';
import './index.less';

// createRoot(document.getElementById('app')!).render(<Demo />);

bootstrap({
  layoutMode: 'no-layout',
  routeList: [{ path: '/', element: <Demo /> }],
});
