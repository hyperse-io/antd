import * as React from 'react';
import { Select, type SelectProps } from 'antd';

type CompoundedComponent = React.FC<SelectProps> & {
  Option: typeof Select.Option;
};

/**
 * 由于 antd 5.3.x 分页Pagination组件，存在点击分页选择框框时，一直朝下
 * issues：https://github.com/ant-design/ant-design/issues/36866
 * 为了兼容，在 Pagination 中添加了 selectComponentClass 属性，后期antd 官方优化了bug，可取消 配置selectComponentClass
 * @param props
 * @returns
 */
export const SmallSelect: CompoundedComponent = (props) => (
  <Select size="small" {...props} placement="topLeft" />
);

SmallSelect.Option = Select.Option;

export const LargeSelect: CompoundedComponent = (props) => (
  <Select size="large" {...props} placement="topLeft" />
);

LargeSelect.Option = Select.Option;

export const MiddleSelect: CompoundedComponent = (props) => (
  <Select size="middle" {...props} placement="topLeft" />
);

MiddleSelect.Option = Select.Option;
