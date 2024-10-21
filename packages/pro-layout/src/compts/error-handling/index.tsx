import { message } from 'antd';
import { exception, hooks } from '@wove/react';
import { useIframe } from '../../layout/layout-iframe/use-iframe.js';
export const ErrorHandling = (props: {
  verifySessionExpired?: (err) => boolean;
}) => {
  const iframeApi = useIframe();
  // 可以通过`isFabricException(error)`获取异常类型进行过滤 action里面throw new FabricException()
  const [error, clearError] = exception.useException();
  hooks.useUpdateEffect(() => {
    if (error && error.message) {
      clearError();
      if (props.verifySessionExpired?.(error)) {
        iframeApi.postMessage({
          type: 'session_expired',
        });
        return;
      }
      void message.error(error.message);
    }
  }, [error]);
  return null;
};
