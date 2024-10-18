import { useEffect, useState } from 'react';
import { ColorPicker, type ColorPickerProps } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import { IconWrapper } from '../icon-wrapper/icon-wrapper.js';
import './style.less';

export type ColorPickerWrapperProps = Omit<
  ColorPickerProps,
  'value' | 'onChange'
> & {
  /** 格式：#1677ff */
  value?: string;
  /** 转换成 hex 格式颜色字符串，返回格式如：#1677ff  */
  onChange?: (hex?: string) => void;
  viewMinWidth?: number;
};

export const ColorPickerWrapper = (props: ColorPickerWrapperProps) => {
  const [color, setColor] = useState<string>();

  useEffect(() => {
    setColor(props.value);
  }, [props.value]);

  return (
    <div className="color-picker-wrapper">
      <ColorPicker
        {...props}
        onChange={(color) => {
          setColor(color.toHexString());
          props.onChange?.(color.toHexString());
        }}
      >
        {!color ? (
          <div className="color-placeholder">请选择颜色</div>
        ) : undefined}
      </ColorPicker>

      {color ? (
        <IconWrapper
          icon={<CloseCircleOutlined />}
          onClick={() => {
            props.onChange?.(undefined);
          }}
          size="small"
          style={{ marginLeft: 10, color: '#cfcece' }}
          hideHoverBgColor
        />
      ) : null}
    </div>
  );
};
