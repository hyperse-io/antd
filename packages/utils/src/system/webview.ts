/**
 * Mozilla/5.0 (Linux; Android 8.0.0; ALP-AL00 Build/HUAWEIALP-AL00; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/63.0.3239.111 Mobile Safari/537.36/TcFinancial/9.01.06
 * return webview userAgent string.
 */
export const userAgent = () => {
  return typeof navigator !== 'undefined'
    ? navigator.userAgent.toLowerCase()
    : '';
};

/**
 * Check if device is iphone, ipad.
 * @param ua client webview userAgent
 */
export const isIphone = () => {
  return /(iphone|ipad)/i.test(userAgent());
};

export const isMac = () => {
  return /macintosh/i.test(userAgent());
};

export const isIphoneOrMac = () => {
  return isMac() && isIphone();
};

/**
 * Check if device is android.
 * @param ua client webview userAgent
 */
export const isAndroid = () => {
  return /(android)/i.test(userAgent());
};

/**
 * 判断当前是否是fabric webview, 拥有插件调用能力
 * Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 Fabric@inhome/1.0.0 Fabric/NoWebview
 * Fabric容器标识 `Fabric@inhome/1.0.0`
 * Fabric容器下通过?ntv_history打开的多一个标识 `Fabric/DisableWebview`注意此标识必须在应用级注入禁用标识, 并且不能随意改变策略, 否则定会出现兼容性问题.
 * @param ua
 */
export const isFabricWebview = (ua = userAgent()) => {
  const isFabric = new RegExp('fabric@', 'i').test(ua);
  // 目前`Fabric/DisableWebview`强制禁用fabric 能力,即便处于 fabric 容器
  // FIXME:目前 native 处理`Fabric/NoWebview`行为不一致, 所以此处 强制 always 配置 `Fabric/DisableWebview`
  const isDisallowFabric = new RegExp('Fabric/DisableWebview', 'i').test(ua);
  return isFabric && !isDisallowFabric;
};
