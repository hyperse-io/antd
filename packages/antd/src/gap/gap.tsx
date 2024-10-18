import { CSSProperties } from 'react';

export type GapProps = {
  height?: number;
  width?: number;
  className?: string;
  style?: CSSProperties;
  inline?: boolean;
};

/**
 * 间隙组件
 * @param props
 * @returns
 */
export const Gap = (props: GapProps) => {
  return (
    <div
      style={{
        height: props.height,
        ...props.style,
        display: props.inline ? 'inline-block' : 'block',
        width: props.width,
      }}
      className={props.className}
    />
  );
};
