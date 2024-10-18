import { type CSSProperties, Fragment } from 'react';
import { Spin, Tooltip } from 'antd';
import { QuestionCircleFilled, RedoOutlined } from '@ant-design/icons';
import { isUndefinedOrNull, TAny } from '@hyperse/utils';
import { TextOverflow } from '../text-overflow/text-overflow.js';
import { TipsWrapper } from '../tips-wrapper/tips-wrapper.js';
import { type FormItemTextProps } from './types.js';

export const FormItemTextContent = (
  props: Pick<FormItemTextProps, 'render' | 'wrap' | 'placeholderValue'> & {
    value?: string;
    style?: CSSProperties;
    loading?: boolean;
    status?: 'success' | 'error' | 'init';
    onRequest?: () => TAny;
    errorMsg?: string;
  }
) => {
  const originalValue = (function () {
    if (isUndefinedOrNull(props.value)) return props.placeholderValue;
    return typeof props.value === 'string'
      ? props.value
      : JSON.stringify(props.value);
  })();
  const valueFt = props.wrap ? (
    originalValue
  ) : (
    <TextOverflow text={originalValue || ''} />
  );

  if (props.status === 'error') {
    return (
      <Fragment>
        <TipsWrapper
          tipType="tooltip"
          tooltipProps={{ title: props.errorMsg }}
          icon={<QuestionCircleFilled style={{ color: 'red' }} />}
          gap={6}
        >
          <Tooltip title="点击查询">
            <RedoOutlined
              style={{ color: 'red' }}
              onClick={props.onRequest}
              className="fitc-reload-icon"
            />
          </Tooltip>
        </TipsWrapper>
      </Fragment>
    );
  }

  if (props.loading) {
    return (
      <span className="form-item-text-content fitc-loading" style={props.style}>
        <Spin spinning={props.loading} size="small">
          <span style={{ textIndent: '-9999px', display: 'inline-block' }}>
            Loading
          </span>
        </Spin>
      </span>
    );
  }
  return (
    <span className="form-item-text-content" style={props.style}>
      {props.render ? props.render(props.value) : valueFt}
    </span>
  );
};
