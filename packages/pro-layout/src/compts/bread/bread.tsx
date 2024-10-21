import { Fragment, type ReactElement, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb } from 'antd';
import { classNames } from '@dimjs/utils';
import { getGlobalData, toLinkPath } from '@hyperse/utils';
import { bootstrapCtx } from '../../context/layout-ctx.js';
import { useBread } from '../../hooks/use-bread.js';
import { type TGlobalData } from '../../types/menu.js';
import './bread.less';

type BreadProps = {
  children?: ReactElement;
};

export const Bread = (props: BreadProps) => {
  const ctx = bootstrapCtx();
  const globalData = getGlobalData<TGlobalData>();
  const breadRoutes = useBread(ctx.breads || {}, globalData.routeBaseName);
  const breadcrumbItems = useMemo(() => {
    const items = ctx.breadTitle ? [{ title: ctx.breadTitle }] : [];
    const routes = breadRoutes.sort((a, b) => {
      return a.path.length - b.path.length;
    });
    routes.forEach((item, index) => {
      const content = item && <Fragment>{item.name}</Fragment>;
      if (item) {
        if (routes.length - 1 !== index) {
          items.push({
            title: (
              <Link to={toLinkPath(item.path, item.query)}>{content}</Link>
            ),
          });
        } else {
          items.push({ title: item.name });
        }
      }
    });
    return items;
  }, [breadRoutes, ctx.breadTitle]);

  if (!breadRoutes.length) {
    return null;
  }
  return (
    <div className="bread-wrapper">
      <Breadcrumb
        {...ctx.breadcrumbProps}
        className={classNames('bread', ctx.breadcrumbProps?.className)}
        items={breadcrumbItems}
      />
      <div className="bread-extend">{props.children}</div>
    </div>
  );
};
