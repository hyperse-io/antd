import { CSSProperties, ReactElement, type ReactNode } from 'react';
import { Space } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { classNames } from '@dimjs/utils';
import './style.less';

export type TipsTitleProps = {
  className?: string;
  style?: CSSProperties;
  title: string | ReactElement;
  titleStyle?: CSSProperties;
  children: ReactNode;
  size?: 'default' | 'small';
  /** 自定义 help icon */
  helpIcon?: ReactElement;
  /** 配置 helpIcon 后，此参数失效 */
  onHelp?: () => void;
  hidden?: boolean;
  borderColor?: string;
};

export const TipsTitle = (props: TipsTitleProps) => {
  if (props.hidden) return null;
  const helpElement = props.helpIcon ? (
    props.helpIcon
  ) : props.onHelp ? (
    <QuestionCircleOutlined onClick={props.onHelp} />
  ) : null;

  return (
    <div
      className={classNames(
        'tips-title',
        {
          'tips-title-small': props.size === 'small',
        },
        props.className
      )}
      style={
        {
          ...props.style,
          '--v-border-color': props.borderColor,
        } as CSSProperties
      }
    >
      <Space className="tips-title-title" size={5} direction="horizontal">
        <span style={props.titleStyle}>{props.title}</span>
        {helpElement}
      </Space>
      <div className="tips-title-content">{props.children}</div>
    </div>
  );
};
