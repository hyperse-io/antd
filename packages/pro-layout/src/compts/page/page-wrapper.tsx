import {
  Children,
  forwardRef,
  Fragment,
  type ReactElement,
  useImperativeHandle,
  useState,
} from 'react';
import { isFragment } from 'react-is';
import { Button, Result } from 'antd';
import { dialogLoading, fbaHooks } from '@hyperse/antd';
import { type TAny, type TPlainObject } from '@hyperse/utils';
import { hooks } from '@wove/react';
import { PageWrapperCtxProvider, usePageWrapperCtx } from './ctx.js';
import { Page, type PageProps } from './page.jsx';

type PageContentProps = Omit<PageWrapperProps, 'serviceConfig'> & {
  respData?: TAny;
  loading: boolean;
};

export type PageWrapperServiceConfig = {
  onRequest: (params?: TAny) => Promise<TAny>;
  params?: TPlainObject | (() => TPlainObject);
};

export interface PageWrapperProps extends Omit<PageProps, 'children'> {
  /** 接口数据配置 */
  serviceConfig: PageWrapperServiceConfig;
  /** children 为函数，参数【respData】为接口返回数据 */
  children?:
    | ReactElement
    | ReactElement[]
    | ((respData?: TAny) => ReactElement);
  /**
   * 是否异步，默认：false
   * ```
   * true（异步）：onRequest、react dom渲染同步执行
   * false（同步）：onRequest有结果了才渲染 react dom
   * ```
   */
  isAsync?: boolean;
  /** 自定义异常渲染处理 */
  errorRender?: (error?: TAny) => ReactElement;
}

export type PageWrapperRefApi = {
  onRefresh: (showLoading?: boolean) => void;
};

const PageContent = (props: PageContentProps) => {
  const { respData, ...otherProps } = props;
  const children =
    typeof props.children === 'function'
      ? props.children?.(respData)
      : props.children;
  if (isFragment(children)) {
    const childrenList = Children.toArray(
      (children as ReactElement).props.children
    ) as ReactElement[];
    return <Page {...otherProps}>{childrenList}</Page>;
  }
  return <Page {...otherProps}>{children}</Page>;
};

/**
 * 为Page内置接口处理流程组件，如果无全局初始化接口请求场景，请使用Page组件
 * ```
 * 包括
 * 1. loading显示效果
 * 2. error显示效果
 * 3. 正常接口数据渲染
 * ```
 * @param props
 * @returns
 */
export const PageWrapper = forwardRef<PageWrapperRefApi, PageWrapperProps>(
  (props, ref) => {
    const { serviceConfig, isAsync, errorRender, ...otherProps } = props;
    const [result, setResult] = useState<{
      status: 'success' | 'error' | 'loading';
      respData?: TAny;
    }>({
      status: 'loading',
    });

    const onRequest = async () => {
      try {
        const params =
          typeof serviceConfig.params === 'function'
            ? serviceConfig.params()
            : serviceConfig.params;
        const result = await serviceConfig.onRequest(params);
        setResult({
          status: 'success',
          respData: result,
        });
      } catch (error) {
        setResult({
          status: 'error',
          respData: error,
        });
      }
      return Promise.resolve();
    };

    fbaHooks.useEffectCustomAsync(onRequest, []);

    const onReload = hooks.useCallbackRef(() => {
      setResult({ status: 'loading' });
      void onRequest();
    });

    useImperativeHandle(ref, () => {
      return {
        onRefresh: (showLoading) => {
          const showLoadingNew = showLoading === undefined ? true : showLoading;
          if (showLoadingNew) {
            dialogLoading.open();
          }
          onRequest().finally(() => {
            if (showLoadingNew) {
              dialogLoading.close();
            }
          });
        },
      };
    });

    if (result.status === 'error') {
      if (errorRender) {
        return errorRender(result.respData);
      }
      return (
        <Page fullIndex={0} style={{ backgroundColor: '#fff' }}>
          <Result
            status="error"
            title={'数据获取异常'}
            subTitle={(result.respData?.message as string) || '数据请求异常'}
            extra={[
              <Button type="primary" key="console" onClick={onReload}>
                重新获取
              </Button>,
            ]}
          />
        </Page>
      );
    }

    if (result.status === 'loading' && !isAsync) {
      return (
        <Page loading={true} {...otherProps}>
          <Fragment />
        </Page>
      );
    }

    return (
      <PageWrapperCtxProvider value={{ onReload: onReload }}>
        <PageContent
          loading={result.status === 'loading'}
          respData={result.respData}
          {...otherProps}
        />
      </PageWrapperCtxProvider>
    );
  }
);

export const usePageWrapper = () => {
  const ctx = usePageWrapperCtx();
  return {
    onReload: () => {
      ctx.onReload();
    },
  };
};
