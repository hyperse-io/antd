import { CSSProperties, ReactElement } from 'react';
import { classNames } from '@dimjs/utils';
import { isUndefinedOrNull } from '@hyperse/utils';
import { fbaHooks } from '../fba-hooks/index.js';
import { FlexLayout } from '../flex-layout/index.js';
import './style.less';

export type RuleDataItem = {
  title?: string | ReactElement;
  desc?: string | ReactElement;
};
export type RuleDescribeProps = {
  title?: string;
  showTitleIndex?: boolean;
  ruleDataList: RuleDataItem[];
  titleSign?: boolean;
  className?: string;
  ruleItemTitleStyle?: CSSProperties;
  ruleItemDescStyle?: CSSProperties;
  ruleItemStyle?: CSSProperties;
};

export const RuleDescribe = (props: RuleDescribeProps) => {
  const showTitleIndex = isUndefinedOrNull(props.showTitleIndex)
    ? true
    : props.showTitleIndex;

  const theme = fbaHooks.useThemeToken();

  const style = {
    '--rule-describe-colorPrimary': theme.colorPrimary,
  } as CSSProperties;

  return (
    <div
      className={classNames('v-rule-describe', props.className)}
      style={style}
    >
      {props.title ? (
        <div
          className={classNames('v-rule-describe-title', {
            'v-rule-describe-title-sign': props.titleSign,
          })}
        >
          {props.title}
        </div>
      ) : null}
      {props.ruleDataList.map((item, index) => {
        if (showTitleIndex && item.title) {
          return (
            <div
              key={index}
              className="v-rule-describe-item"
              style={props.ruleItemStyle}
            >
              <FlexLayout
                fullIndex={1}
                direction="horizontal"
                className="v-rule-describe-item-title"
                style={props.ruleItemTitleStyle}
              >
                <span className="v-rule-describe-item-title-index">
                  {index + 1}.{' '}
                </span>
                <span className="v-rule-describe-item-title-content">
                  {item.title}
                </span>
              </FlexLayout>
              {item.desc ? (
                <FlexLayout
                  direction="horizontal"
                  className="v-rule-describe-item-desc"
                  style={props.ruleItemDescStyle}
                  fullIndex={1}
                >
                  <span className="v-rule-describe-item-title-index"></span>
                  <span className="v-rule-describe-item-title-content">
                    {item.desc}
                  </span>
                </FlexLayout>
              ) : null}
            </div>
          );
        }
        return (
          <div key={index} className="v-rule-describe-item">
            {item.title ? (
              <div
                className="v-rule-describe-item-title"
                style={props.ruleItemTitleStyle}
              >
                {item.title}
              </div>
            ) : null}
            {item.desc ? (
              <div
                className="v-rule-describe-item-desc"
                style={props.ruleItemDescStyle}
              >
                {item.desc}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
