export enum IFrameEvents {
  /**
   * 接收从子iframe通知过来的消息, 或者父window发出的通知的消息
   */
  messageReceived = 'messageReceived',
}

export const IFRAME_EVENT_FLAG = `HYPERSE-LAYOUT`;

export type IframeMessage<T = unknown> = { type: 'HYPERSE-LAYOUT'; data: T };
export type IframeHandler<T = unknown> = (data: T) => void;
export type IframeEvents = {
  [name: string]: Array<IframeHandler<unknown>>;
};

export class IframeEventEmitter {
  private events: IframeEvents = {};

  on<T = unknown>(name: IFrameEvents, listener: IframeHandler<T>) {
    if (!this.events[name]) {
      this.events[name] = [];
    }
    this.events[name].push(listener as IframeHandler<unknown>);
    return this;
  }

  off<T = unknown>(name: IFrameEvents, listenerToRemove: IframeHandler<T>) {
    if (this.events[name]) {
      this.events[name] = this.events[name].filter(
        (listener) => listener !== listenerToRemove
      );
    }
    return this;
  }

  emit<T = unknown>(name: IFrameEvents, data: T) {
    const handlers = this.events[name] || [];
    if (handlers.length) {
      // console.log('IframeEventEmitter.emit(), name: ', name, 'handlers:', handlers);
      for (let index = 0; index < handlers.length; index++) {
        const handler = handlers[index];
        if (handler) {
          handler(data);
        }
      }
    }
    return this;
  }
}
