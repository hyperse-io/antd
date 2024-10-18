import { CSSProperties, FC, ReactElement } from 'react';
import { classNames } from '@dimjs/utils';
import { fbaHooks } from '../../fba-hooks/index.js';
import './style.less';

export type FormItemCardProps = {
  title?: string | ReactElement;
  children: ReactElement | ReactElement[];
  className?: string;
  style?: CSSProperties;
  titleSign?: boolean;
};
export const FormItemCard: FC<FormItemCardProps> = (props) => {
  const classNamePrefix = 'form-item-group-card';

  const theme = fbaHooks.useThemeToken();

  const style = {
    '--form-item-group-colorPrimary': theme.colorPrimary,
  } as CSSProperties;

  return (
    <div
      className={classNames(classNamePrefix, props.className)}
      style={{ ...style, ...props.style }}
    >
      {props.title ? (
        <div
          className={classNames(`${classNamePrefix}-title`, {
            [`${classNamePrefix}-title-sign`]: props.titleSign === true,
          })}
        >
          {props.title}
        </div>
      ) : null}
      {props.children}
    </div>
  );
};

FormItemCard.defaultProps = {
  titleSign: true,
};
