import { type CSSProperties, Fragment, type ReactElement } from 'react';
import { classNames } from '@dimjs/utils';
import { isWindowsEnv } from '@hyperse/utils';
// import { LeaveMenuDefault } from '../components/leave-menu';
// import { useLayoutCtx } from '../context/layout-ctx';
// import { layoutModels } from '../models';
import './style.less';

export const LayoutPage = (props: {
  style?: CSSProperties;
  children?: ReactElement;
  hideHeader?: boolean;
  elementId?: string;
  className?: string;
}) => {
  // const LeaveMenuCompt = layoutCtx.LeaveMenu || LeaveMenuDefault;
  const isWindows = isWindowsEnv();
  const className = classNames(
    'layout-page-wrapper',
    {
      'layout-page-noheader': props.hideHeader,
      'layout-page-windows': isWindows,
    },
    props.className
  );

  return (
    <Fragment>
      {/* {state.leavebar.items?.length > 0 ? (
        <LeaveMenuCompt leaveMenus={state.leavebar.items} selectedKeys={state.leavebar.selectedKeys} />
      ) : null} */}
      <div className={className} id={props.elementId}>
        <div className="layout-page">{props.children}</div>
      </div>
    </Fragment>
  );
};
