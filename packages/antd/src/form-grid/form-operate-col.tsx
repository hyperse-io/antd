import { type ReactElement, useMemo } from 'react';
import { Col, Form, Row, type RowProps, Space, type SpaceProps } from 'antd';
import { classNames } from '@dimjs/utils';

const fullGrid = { xs: 24, sm: 24, md: 24, lg: 24, xl: 24, xxl: 24 };
export type FormOperateColProps = {
  className?: string;
  leftList?: Array<ReactElement | null>;
  rightList?: Array<ReactElement | null>;
  // left、right 对齐方式，优先级最高
  justify?: RowProps['justify'];
  /** 强制单独一行 */
  forceAloneRow?: boolean;
  hidden?: boolean;
  leftSpaceProps?: SpaceProps;
  rightSpaceProps?: SpaceProps;
};

/**
 * FormOperateCol 布局说明
 * ```
 * 1. 网格数以及位置为动态计算，不支持 xs、sm、md等
 * 2. 如果FormRow只有一行col，则OperateCol会在当前行剩余网格内居左对齐
 * 3. 如果同时设置 leftList、rightList，则此cell会强制独占一行，并左右布局
 * 4. 如果只设置 leftList、rightList其中一个，则会在最后一行剩余网格内居右对齐
 * ```
 */
export const FormOperateCol = (props: FormOperateColProps) => {
  const {
    leftList,
    rightList,
    rowColTotal,
    justify,
    forceAloneRow,
    hidden,
    leftSpaceProps,
    rightSpaceProps,
    ...otherProps
  } = props as FormOperateColProps & {
    rowColTotal: number;
  };
  const _leftList = (leftList || []).filter(Boolean);
  const _rightList = (rightList || []).filter(Boolean);
  const hasAll = _leftList.length > 0 && _rightList.length > 0;
  const forceGrid = forceAloneRow || hasAll ? fullGrid : {};

  const colJustify = useMemo(() => {
    if (justify) return justify;
    if (hasAll) return 'space-between';
    if (forceAloneRow) return 'end';
    if (rowColTotal === 1) return 'start';
    return 'end';
  }, [forceAloneRow, hasAll, justify, rowColTotal]);

  const className = classNames(props.className, 'v-form-col-operate');

  if (hidden) return null;

  return (
    <Col {...otherProps} {...forceGrid} className={className}>
      <Form.Item>
        <Row justify={colJustify} wrap={false}>
          <Space
            {...leftSpaceProps}
            className={classNames(
              'v-form-col-operate-left',
              leftSpaceProps?.className
            )}
          >
            {_leftList.map((item) => item)}
          </Space>
          <Space
            {...rightSpaceProps}
            style={{ overflowX: 'auto', ...rightSpaceProps?.style }}
            className={classNames(
              'v-form-col-operate-right',
              rightSpaceProps?.className
            )}
          >
            {_rightList?.map((item) => item)}
          </Space>
        </Row>
      </Form.Item>
    </Col>
  );
};

FormOperateCol['domTypeName'] = 'FormOperateCol';
