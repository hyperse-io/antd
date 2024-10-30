import { useEffect } from 'react';
import { parse } from '@dimjs/utils';
import { hooks } from '@wove/react';
import {
  IFRAME_EVENT_FLAG,
  iframeApi,
  IframeEventEmitter,
  IFrameEvents,
  type IframeHandler,
  type IframeMessage,
} from './iframe-api/index.js';

const iframeEvent = new IframeEventEmitter();

window.addEventListener('message', (e) => {
  try {
    const { type, data } = parse<IframeMessage>(e.data);
    // 忽略框架外的消息通讯传递
    if (type === IFRAME_EVENT_FLAG) {
      iframeEvent.emit(IFrameEvents.messageReceived, data);
    }
  } catch (_error) {
    /** */
  }
});

/**
 * 使用Iframe通讯的API
 * @param onReceivedMessageCallback 接收iframe通讯消息的回调函数引用
 * @demo https://xx.xx.com/docs/admin/main/exchange
 * @example
 * ```tsx
 * const iframeApi = useIframe<MessageData>((data) => {
 *    updateMessage(data);
 *  });
 *
 *  const handleClick = hooks.useCallbackRef(() => {
 *    iframeApi.broadcastMessages({
 *      fromHeader: '1',
 *    });
 *  });
 *
 * ```
 */
export const useIframe = <T>(
  onReceivedMessageCallback: IframeHandler<T> = () => {
    /** */
  }
) => {
  const callbackRef = hooks.useCallbackRef(onReceivedMessageCallback);

  useEffect(() => {
    iframeEvent
      .off(IFrameEvents.messageReceived, callbackRef)
      .on(IFrameEvents.messageReceived, callbackRef);
    return () => {
      iframeEvent.off(IFrameEvents.messageReceived, callbackRef);
    };
  }, [callbackRef]);

  return iframeApi;
};
