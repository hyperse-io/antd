import { CSSProperties } from 'react';
import { classNames } from '@dimjs/utils';
import './loader.less';

export type LoaderProps = {
  spinning?: boolean;
  fullScreen?: boolean;
  style?: CSSProperties;
  inner?: boolean;
};

export const Loader = ({
  spinning = false,
  fullScreen = false,
  style = {},
}: LoaderProps) => {
  return (
    <div
      style={style}
      className={classNames('loader', {
        hidden: !spinning,
        fullScreen,
      })}
    >
      <div className="loader-wrapper">
        <div className="loader-inner" />
        <div className="loader-text">LOADING</div>
      </div>
    </div>
  );
};
