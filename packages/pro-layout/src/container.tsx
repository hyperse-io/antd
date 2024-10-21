import { Fragment, type ReactElement, type ReactNode, useEffect } from 'react';
import { Result } from 'antd';
import { TPlainObject } from '@hyperse/utils';
import { type BootstrapOptions } from './types/layout.js';

export const Container = (props: {
  children: ReactNode;
  layoutMode: BootstrapOptions['layoutMode'];
  MenuEmptyRender?: ReactElement;
  menus: TPlainObject[];
  ignoreMenuEmptyJudge?: boolean;
}) => {
  useEffect(() => {
    window.addEventListener('message', function (event) {
      if (event?.data?.flatOssIframeType === 'reload') {
        window.location.reload();
      }
    });
  }, []);

  if (
    !props.ignoreMenuEmptyJudge &&
    (props.layoutMode === 'iframe-main' || props.layoutMode === 'normal') &&
    props.menus.length === 0
  ) {
    if (props.MenuEmptyRender) return props.MenuEmptyRender;
    return (
      <Result
        status="error"
        title="无菜单数据"
        subTitle={'请联系运营人员确定菜单数据配置'}
      ></Result>
    );
  }

  return <Fragment>{props.children}</Fragment>;
};
