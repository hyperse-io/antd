import { Pagination, type PaginationProps } from 'antd';
import { MiddleSelect, SmallSelect } from './select.jsx';

/**
 * 由于 antd 5.3.x 分页Pagination组件，存在点击分页选择框时，一直朝下
 * issues：https://github.com/ant-design/ant-design/issues/36866
 * 为了兼容，在 Pagination 中添加了 selectComponentClass 属性，后期antd 官方优化了bug，可取消 配置selectComponentClass
 * @param props
 * @returns
 */
export const PaginationWrapper = (props: PaginationProps) => {
  const selectComponentClass =
    props.size === 'small' ? SmallSelect : MiddleSelect;
  return <Pagination {...props} selectComponentClass={selectComponentClass} />;
};
