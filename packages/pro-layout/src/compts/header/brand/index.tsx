import { Fragment } from 'react';
import { hooks } from '@wove/react';
import { useLayoutCtx } from '../../../context/layout-ctx.js';
import { type TGlobalData } from '../../../types/index.js';
import './style.less';

export const HeaderBrand = () => {
  const { defaultPage } = hooks.useGlobal<TGlobalData>();
  const layoutCtx = useLayoutCtx();
  const toDefaultPage = hooks.useCallbackRef(() => {
    if (defaultPage) {
      window.location.href = defaultPage;
    }
  });

  const sidebarWidth = layoutCtx.sidebarWidth;
  const headerHeight = layoutCtx.headerHeight;

  return (
    <div
      className="layout-brand"
      onClick={toDefaultPage}
      style={{
        width: sidebarWidth,
        height: headerHeight,
        lineHeight: `${headerHeight}px`,
      }}
    >
      {layoutCtx.HeaderBrand ? (
        layoutCtx.HeaderBrand()
      ) : (
        <Fragment>
          {layoutCtx.logoPath ? (
            <div
              className="brand-logo"
              style={{ backgroundImage: `url(${layoutCtx.logoPath})` }}
            ></div>
          ) : null}
          <div className="brand-name">{layoutCtx.brandName}</div>
        </Fragment>
      )}
    </div>
  );
};
