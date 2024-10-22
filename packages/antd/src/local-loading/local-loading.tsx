import {
  type CSSProperties,
  forwardRef,
  type ReactElement,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Button, Result, Spin } from 'antd';
import { isDeepEqual } from '@dimjs/lang';
import { classNames } from '@dimjs/utils';
import { type TAny, toArray, type TPlainObject } from '@hyperse/utils';
import { fbaHooks } from '../fba-hooks/index.js';
import { LocalLoadingCtxProvider } from './context.js';
import './style.less';

export type LocalLoadingServiceConfig = {
  onRequest: (params?: TAny) => Promise<TAny>;
  params?: TPlainObject;
  /** 标记serviceConfig.params中无效参数，被设置的params key 不传入服务接口入参  */
  invalidParamKey?: string[];
};

export interface LocalLoadingProps {
  /** 接口数据配置 */
  serviceConfig: LocalLoadingServiceConfig;
  /** children 为函数，参数【respData】为接口返回数据 */
  children: (respData?: TAny) => ReactElement;
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
  /** loading高度，默认值：100；isAsync = true 无效 */
  loadingHeight?: number | string;
  className?: string;
  style?: CSSProperties;
  contentStyle?: CSSProperties;
}

export type LocalLoadingRefApi = {
  onRefresh: (params?: TPlainObject) => void;
};

/**
 * 局部加载，包含接口数据处理逻辑
 * ```
 * 包括
 * 1. loading显示效果
 * 2. error显示效果
 * 3. 获取服务数据
 * 4. 当 serviceConfig.params 值与上一次值不相等时，会主动发起服务调用
 * ```
 */
export const LocalLoadingInner = forwardRef<
  LocalLoadingRefApi,
  LocalLoadingProps
>((props, ref) => {
  const { serviceConfig, isAsync, children, errorRender } = props;
  const [status, setStatus] = useState<'success' | 'error' | 'init'>('init');
  const [respData, setRespData] = useState<TAny>();
  const loadingHeight =
    props.loadingHeight === undefined ? 100 : props.loadingHeight;
  const rootRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const errorRef = useRef<string>();

  const prevParams = fbaHooks.usePrevious(serviceConfig.params);

  // 用于直接发起接口调用，不能用于比较
  const serviceParams = useMemo(() => {
    if (
      !serviceConfig.params ||
      toArray(serviceConfig.invalidParamKey).length === 0
    ) {
      return serviceConfig.params;
    }
    const newParams = { ...serviceConfig.params };
    serviceConfig.invalidParamKey?.forEach((key) => {
      newParams[key] = undefined;
    });
    return newParams;
  }, [serviceConfig]);

  const onInitRequest = async (params?: TPlainObject) => {
    try {
      setLoading(true);
      const respData = await serviceConfig.onRequest({
        ...serviceParams,
        ...params,
      });
      setStatus('success');
      setRespData(respData);
    } catch (error: TAny) {
      console.error(error);
      setStatus('error');
      errorRef.current = error.message;
    } finally {
      setLoading(false);
    }
  };

  fbaHooks.useEffectCustomAsync(onInitRequest, []);

  fbaHooks.useEffectCustom(() => {
    if (prevParams) {
      if (!isDeepEqual(serviceConfig.params, prevParams)) {
        void onInitRequest();
      }
    }
  }, [prevParams, serviceConfig.params]);

  useImperativeHandle(ref, () => {
    return { onRefresh: onInitRequest };
  });

  if (status === 'error') {
    if (errorRender) {
      return errorRender({ message: errorRef.current });
    }
    return (
      <LocalLoadingCtxProvider value={{ onRequest: onInitRequest }}>
        <div className={classNames('local-loading-error', props.className)}>
          <div className="local-loading-area" ref={rootRef}></div>
          <Result
            status="error"
            subTitle={errorRef.current || '数据处理异常'}
            extra={[
              <Button
                type="primary"
                ghost
                key="console"
                size="small"
                onClick={() => {
                  setStatus('init');
                  void onInitRequest();
                }}
              >
                重新获取
              </Button>,
            ]}
          />
        </div>
      </LocalLoadingCtxProvider>
    );
  }

  if (status !== 'success' && !isAsync) {
    return (
      <div
        className={classNames('fba-local-loading-process', props.className)}
        style={{
          height: loadingHeight,
          display: 'flex',
          justifyContent: 'center',
          position: 'relative',
          backgroundColor: 'var(--block-bg-color)',
        }}
      >
        <Spin
          spinning={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            height: '100%',
            width: '100%',
          }}
        />
      </div>
    );
  }

  return (
    <LocalLoadingCtxProvider value={{ onRequest: onInitRequest }}>
      <div
        className={classNames('fba-local-loading', props.className)}
        style={props.style}
      >
        {loading ? (
          <Spin
            spinning={true}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'absolute',
              height: '100%',
              width: '100%',
            }}
          />
        ) : null}
        <div className="local-loading-content" style={props.contentStyle}>
          {children(respData)}
        </div>
      </div>
    </LocalLoadingCtxProvider>
  );
});
