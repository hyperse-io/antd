/**
 * 验证xml格式的正确性
 * ```
 *  result / true 验证通过
 *  result / false 验证不通过，message为失败描述
 * ```
 */
export const xmlValidate = (xmlContent: string) => {
  // errorCode 0是xml正确，1是xml错误，2是无法验证
  let errorCode = 0;
  let errorMessage;
  // code for IE
  if (window['ActiveXObject']) {
    const xmlDoc = new window['ActiveXObject']('Microsoft.XMLDOM');
    xmlDoc.async = 'false';
    xmlDoc.loadXML(xmlContent);

    if (xmlDoc.parseError.errorCode != 0) {
      errorMessage = `错误code: ${xmlDoc.parseError.errorCode} \n`;
      errorMessage = `${errorMessage} 错误原因: ${xmlDoc.parseError.reason} \n`;
      errorMessage = `${errorMessage} 错误位置: ${xmlDoc.parseError.line}`;
      errorCode = 1;
    } else {
      errorMessage = '格式正确';
    }
  }
  // code for Mozilla, Firefox, Opera, chrome, safari,etc.
  else if (document['implementation']?.['createDocument']) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
    const error = xmlDoc.getElementsByTagName('parsererror');
    if (error.length > 0) {
      if (xmlDoc.documentElement.nodeName == 'parsererror') {
        errorCode = 1;
        errorMessage = xmlDoc.documentElement.childNodes[0].nodeValue;
      } else {
        errorCode = 1;
        errorMessage = xmlDoc.getElementsByTagName('parsererror')[0].innerHTML;
      }
    } else {
      errorMessage = '格式正确';
    }
  } else {
    errorCode = 2;
    errorMessage = '浏览器不支持验证，无法验证xml正确性';
  }
  return {
    message: errorMessage,
    result: errorCode == 0 ? true : false,
  };
};
