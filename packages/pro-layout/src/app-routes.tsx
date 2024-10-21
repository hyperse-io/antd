import { Fragment, isValidElement, type ReactElement, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { isString } from '@dimjs/lang';
import { getQueryString } from '@dimjs/utils';
import {
  type TAny,
  toLinkPathWithQuery,
  urlJoinMulti,
  valueIsEqual,
} from '@hyperse/utils';
import { NotFound } from './compts/404/index.js';
import { Bread } from './compts/bread/index.js';
import { Loader } from './compts/loader/loader.js';
import {
  type BootstrapOptions,
  BreadConfigItem,
  type TRouteItemProps,
} from './types/index.js';

export type AppRouteProps = {
  routeList: TRouteItemProps[];
  hideDefaultBread?: boolean;
  breads?: BreadConfigItem[];
  breadExtendRender?: ReactElement;
  breadTitle?: string | ReactElement;
  layoutMode: BootstrapOptions['layoutMode'];
};

export const AppRoutes = (props: AppRouteProps) => {
  const hideBreads = getQueryString('hideBreads');

  const routeList = props.routeList;
  const globbingRouteList = routeList.filter((item) => {
    return valueIsEqual(item.path, ['*', '/*', '/*/']);
  });

  return (
    <Fragment>
      <Routes>
        {routeList.map((route, index) => {
          const { path, caseSensitive, element: Element, redirect } = route;
          const isGlobbing = valueIsEqual(path, ['*', '/*', '/*/']);
          if (isString(redirect)) {
            return (
              <Route
                key={index}
                path={path}
                element={<Navigate to={toLinkPathWithQuery(redirect)} />}
              />
            );
          }
          if (Element) {
            let elementRender: ReactElement | null = null;
            if (isValidElement(Element)) {
              elementRender = Element;
            } else {
              const CElement = Element as TAny;
              elementRender = (
                <Suspense fallback={<Loader spinning />}>
                  <CElement />
                </Suspense>
              );
            }
            const tempPath = isGlobbing
              ? '*'
              : path.endsWith('/*')
                ? path
                : urlJoinMulti(path, '*');
            return (
              <Route
                key={index}
                path={tempPath}
                caseSensitive={caseSensitive}
                element={
                  <Fragment>
                    {props.breads &&
                    props.hideDefaultBread !== true &&
                    !hideBreads ? (
                      <Bread>{props.breadExtendRender}</Bread>
                    ) : null}
                    {elementRender}
                  </Fragment>
                }
              />
            );
          }
          return null;
        })}

        {globbingRouteList.length === 0 ? (
          <Route path="*" element={<NotFound />} />
        ) : null}
      </Routes>
    </Fragment>
  );
};
