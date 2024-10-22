/**
 * 通过「 HTML Script 」标签加载库，Sentry 会挂载到 window 上
 */
const Sentry = window['Sentry'];

import { getQueryString, type PlainObject } from '@dimjs/utils';
import { type TAny } from '../types/index.js';

type SeverityLevel = 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug';

const env = getQueryString('env') || 'prod';

/**
 * Sentry初始化参数
 */
export interface ISentryInitOptions {
  dsn: string;
  release?: string;
  debug?: boolean;
  env?: string;
  tags?: Record<string, string>;
  user?: Record<'id' | 'username' | string, string>;
  context?: Record<string, string>;
  extra?: PlainObject;
  beforeBreadcrumb?: (sentryBreadcrumb: PlainObject) => PlainObject | null;
  beforeSend?: (sentryEventData: PlainObject) => PlainObject | null;
}

/**
 * 初始化 Sentry
 */
const init = (options: ISentryInitOptions) => {
  try {
    const {
      dsn,
      release,
      debug,
      env: customEnv,
      tags,
      user,
      extra = {},
      beforeBreadcrumb: custonBeforeBreadcrumb,
      beforeSend: customBeforeSend,
    } = options || {};

    Sentry.init({
      dsn,
      debug: debug || env !== 'prod',
      environment: customEnv || env,
      release: release || window['SENTRY_RELEASE'],
      beforeBreadcrumb(sentryBreadcrumb) {
        let data = beforeBreadcrumb(sentryBreadcrumb);
        if (data && custonBeforeBreadcrumb) {
          data = custonBeforeBreadcrumb(data);
        }
        return data;
      },
      beforeSend(sentryEventData: PlainObject) {
        let data = beforeSend(sentryEventData);
        if (data && customBeforeSend) {
          data = customBeforeSend(data);
        }
        return data;
      },
    });

    Sentry.setUser({ ip_address: '{{auto}}', ...user });
    const tagInfo = { ...tags };
    Sentry.setTags(tagInfo);

    if (document.referrer) {
      Sentry.setExtras({
        referrer: document.referrer,
      });
    }
    extra.deviceInfo = extra?.deviceInfo || window['deviceInfo'];
    Sentry.setExtras(extra);
  } catch (error) {
    console.error('== Sentry.init error', error);
  }
};

/**
 * 日志前筛
 */
const beforeBreadcrumb = (sentryBreadcrumb: PlainObject) => {
  try {
    // 过滤掉一些不重要的console
    if (
      sentryBreadcrumb.category === 'console' &&
      sentryBreadcrumb.level !== 'error'
    ) {
      return null;
    }

    // 如果接入听云，会有大量的请求发送，对分析异常作用不大，这里过滤掉
    if (
      sentryBreadcrumb.category === 'xhr' &&
      ((sentryBreadcrumb.data || {}).url || '').indexOf('tingyun') !== -1
    ) {
      return null;
    }
  } catch (_error) {
    return sentryBreadcrumb;
  }

  return sentryBreadcrumb;
};

/**
 * 发送过滤
 */
const beforeSend = (sentryEventData: PlainObject) => {
  try {
    const history = localStorage.getItem('historyPages');
    if (history) {
      sentryEventData['extra']['history'] = JSON.parse(history || '[]');
    }

    const { exception, message, level, tags } = sentryEventData || {};
    const { values = [] } = exception || {};
    if (!values[0]) {
      values[0] = { value: '' };
    }
    const { value } = values[0];
    const exceptionMsg = String(value || '');

    /**
     * Promise.reject() 抛出的异常 或 捕获的是一个对象
     * 抓取后没有实际参考价值，丢弃
     */
    if (
      exceptionMsg.indexOf('promise rejection captured') !== -1 ||
      exceptionMsg.indexOf('exception captured with keys') !== -1
    ) {
      return null;
    }

    /**
     * 异常标题追加「 env 」区分环境
     * JS异常：values[0].value
     * API异常、手动发送日志：message
     */
    if (env && env !== 'prod') {
      if (values[0].value) {
        values[0].value += `, env=${env}`;
      }
      if (message) {
        sentryEventData.message += `, env=${env}`;
      }
    }

    /**
     * 如果是接口异常，改写 request.url，这样收集到的日志，列表中可以直接查看 apiMsg
     */
    if (tags.api && tags.apiMsg) {
      sentryEventData.request.url = tags.apiMsg;
      tags.url = location.href;
    }

    if (['fatal', 'error'].includes(level)) {
      let apiWarningMessage = sentryEventData.message;
      if (tags.apiMsg) {
        apiWarningMessage += tags.apiMsg || '?';
      }
      console.error(
        '== SentryException:',
        values[0].value || apiWarningMessage
      );
    }

    /**
     * 过滤掉一些不存在的环境、不想收集的异常消息
     */
    const filteredByEnv = ![
      'prod',
      'rc',
      'inte',
      'inte2',
      'uat',
      'me',
    ].includes(env);
    const filteredByMessage = isBlockedByMessage(exceptionMsg);
    if (filteredByEnv || filteredByMessage) {
      console.warn(
        `== Sentry: 异常已被过滤，不会发送到服务器 - ${exceptionMsg}`,
        sentryEventData
      );
      return null;
    }
  } catch (error) {
    console.info('== Sentry: beforeSend error');
    console.error(error);
    return sentryEventData;
  }
  return sentryEventData;
};

/**
 * 已知的异常消息过滤
 */
export const isBlockedByMessage = (message: string) => {
  if (!message) {
    return false;
  }

  try {
    const GLOBAL = window['GLOBAL'] || {};
    const sentryMessageFilter =
      GLOBAL['sentryMessageFilter'] || 'RTCPeerConnection';
    return sentryMessageFilter.indexOf(String(message)) !== -1;
  } catch (_error) {
    return false;
  }
};

/**
 * 已知的异常错误码过滤
 */
export const isBlockedByCode = (code: string) => {
  if (!code) {
    return false;
  }

  try {
    const GLOBAL = window['GLOBAL'] || {};
    const sentryCodeFilter =
      GLOBAL['sentryCodeFilter'] || 'MKT.AUTHORIZE.TOKEN.EXPIRE';
    return sentryCodeFilter.indexOf(String(code)) !== -1;
  } catch (_error) {
    return false;
  }
};

/**
 * 接口异常类型定义
 */
export interface IRequestError {
  config: {
    params: PlainObject;
    url: string;
    baseURL: string;
    method: string;
    headers: PlainObject;
    withCredentials: boolean;
    data:
      | any
      | {
          protocol: {
            functionCode: string;
          };
        };
  };
  response: {
    status: number;
    statusText: string;
    headers: PlainObject;
    data: {
      code: string;
      data: object;
      message: string;
    };
  };
}

/**
 * 接口异常捕获
 *
 * !status || status !== 200
 * !response || typeof response !== 'object'
 * !code || code !== '0000'
 */
const catchRequestError = (error: IRequestError) => {
  try {
    const { config: requestConfig, response } = error || {};
    const {
      data: responseData,
      status,
      headers: responseHeaders,
      statusText,
    } = response || {};
    const { code, message = statusText || '...' } = responseData || {};

    // 接口正常，不发送日志
    if (responseData && typeof responseData === 'object' && code === '0000') {
      return;
    }

    // code过滤
    const filteredByCode = isBlockedByCode(code);
    if (filteredByCode) {
      console.warn(`== Sentry: 异常已被过滤，不会发送到服务器 - ${code}`);
      return;
    }

    let { data: requestConfigData } = requestConfig || {};
    const {
      params,
      url,
      method,
      headers: requestHeaders,
      withCredentials,
      baseURL,
    } = requestConfig || {};
    if (typeof requestConfigData === 'string') {
      try {
        requestConfigData = JSON.parse(requestConfigData);
      } catch (error) {
        console.error(error);
      }
    }

    const { protocol, deviceInfo, ...restConfigData } = requestConfigData || {};
    const { functionCode } = protocol || {};

    // 按情况设置请求接口
    let API: string = functionCode;
    if (method === 'get') {
      const { restApi } = window['GLOBAL'] || {};
      if (restApi) {
        API = url.split('?')[0].replace(restApi, '');
      } else {
        API = url.split('?')[0].split('/').reverse()[0];
      }
    }

    // title组装
    let title = '未知异常';
    let errorLevel: SeverityLevel = 'error';
    if (API) {
      Sentry.setTags({ api: API, apiMsg: message });
      if (!status || String(status).indexOf('undefined') !== -1) {
        title = `网络异常 @${API}, 请求无响应`;
        errorLevel = 'fatal';
      } else if (status !== 200) {
        title = `网络异常 @${API}, status=${status}`;
        errorLevel = 'fatal';
        Sentry.setTags({ apiStatus: status });
      } else if (typeof responseData !== 'object' || !code) {
        title = `接口异常 @${API}, 接口响应格式错误`;
        errorLevel = 'fatal';
        Sentry.setTags({ apiMsg: '不符合code、data、message规范' });
      } else if (code !== '0000') {
        title = `接口异常 @${API}, code=${code}`;
      } else if (message) {
        title = `未知异常 @${API}, message=${message}`;
      }
    }

    // 添加额外信息
    let isGateway = false;
    if (
      baseURL.indexOf('apiwallet') !== -1 ||
      baseURL.indexOf('appgateway') !== -1
    ) {
      isGateway = true;
    }
    const extras = {
      ['request.config']: {
        url: isGateway ? '网关中转' : url || '/',
        method,
        status,
        statusText,
        withCredentials,
        baseURL,
      },
      ['request.headers']: requestHeaders,
      ['request.protocol']: requestConfigData['protocol'] || '/',
      ['request.param']: params || '/',
      ['response.headers']: responseHeaders,
      ['response.body']: responseData,
    };
    if (deviceInfo) {
      extras['deviceInfo'] = deviceInfo;
    }
    Object.keys(restConfigData).forEach((key) => {
      extras[`request.${key}`] = restConfigData[key];
    });
    Sentry.setExtras(extras);
    Sentry.captureMessage(title, errorLevel);

    /* 日志发送完成后，清除设置的内容，避免对其他异常收集，造成干扰 */
    setTimeout(() => {
      const resetExtra = {
        ['request.config']: '/',
        ['request.headers']: '/',
        ['request.protocol']: '/',
        ['request.param']: '/',
        ['response.headers']: '/',
        ['response.body']: '/',
      };
      Object.keys(restConfigData).forEach((key) => {
        resetExtra[`request.${key}`] = '/';
      });
      Sentry.setTags({ api: null, apiMsg: null, apiStatus: null });
      Sentry.setExtras(resetExtra);
    }, 0);
  } catch (error) {
    console.info('== Sentry: catchRequestError error');
    console.error(error);
  }
};

/**
 * 手动捕获异常
 */
const captureException = (error: Error, extras?: PlainObject) => {
  try {
    if (extras && Object.keys(extras).length) {
      Sentry.setExtras(extras);
    }
    Sentry.captureException(error);
  } catch (error) {
    console.error(error);
  }
};

/**
 * 手动捕获消息
 */
const captureMessage = (
  message: string,
  extras?: PlainObject,
  level?: SeverityLevel,
  prefix?: string
) => {
  try {
    if (extras && Object.keys(extras).length) {
      Sentry.setExtras(extras);
    }
    Sentry.captureMessage(`${prefix || '业务日志'}, ${message}`, level);
  } catch (error) {
    console.error(error);
  }
};

/**
 * 手动添加日志
 */
const addBreadcrumb = (message: string) => {
  try {
    Sentry.addBreadcrumb({
      category: 'debug',
      message,
    });
  } catch (error) {
    console.error(error);
  }
};

/**
 * 手动添加数据
 */
const setExtras = (extras: PlainObject) => {
  try {
    Sentry.setExtras(extras);
  } catch (error) {
    console.error(error);
  }
};

/**
 * 手动添加内容
 */
const setContext = (key: string, value: PlainObject) => {
  try {
    Sentry.setContext(key, value);
  } catch (error) {
    console.error(error);
  }
};

/**
 * 手动设置标签
 */
const setTags = (tags: PlainObject) => {
  try {
    Sentry.setTags(tags);
  } catch (error) {
    console.error(error);
  }
};

/**
 * 手动设置用户信息
 */
const setUser = (user: PlainObject) => {
  try {
    Sentry.setUser(user);
  } catch (error) {
    console.error(error);
  }
};

/**
 * 手动打开用户反馈（暂不可用，存在跨域问题）
 * https://docs.sentry.io/platforms/javascript/enriching-events/user-feedback
 */
const showReportDialog = (options) => {
  try {
    Sentry.showReportDialog(options);
  } catch (error) {
    console.error(error);
  }
};

/**
 * 监听页面loading，超过10s「 #global-spinner 」未关闭，发送异常报告
 */
const sendUnrenderExceptionAfter10s = (
  options = { spinnerId: 'global-spinner' }
) => {
  try {
    let timeout: TAny = null;
    const { spinnerId } = options || {};
    const $spinner = document.getElementById(spinnerId) as HTMLElement;

    const observer = new MutationObserver((mutationsList) => {
      for (let index = 0; index < mutationsList.length; index++) {
        const element = mutationsList[index] || {};
        const { clientWidth } = $spinner || {};
        if (element.type === 'attributes' && !clientWidth) {
          if (timeout) {
            clearTimeout(timeout);
          }
          observer.disconnect();
          break;
        }
      }
    });
    observer.observe($spinner, { attributes: true });

    timeout = setTimeout(() => {
      const { className } = $spinner || {};
      if (className && className.indexOf('hide') === -1) {
        captureMessage(
          `Page unRender after 10s, ${location.href}`,
          {},
          'warning'
        );
        observer.disconnect();
      }
    }, 10000);
  } catch (error) {
    console.error(error);
  }
};

/**
 * Sentry 异常捕获、日志收集系统API
 */
export const sentry = {
  init,
  setExtras,
  setContext,
  captureException,
  captureMessage,
  addBreadcrumb,
  setTags,
  setUser,
  beforeBreadcrumb,
  beforeSend,
  catchRequestError,
  sendUnrenderExceptionAfter10s,
  showReportDialog,
};
