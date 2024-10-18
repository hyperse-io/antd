import {
  cloneElement,
  isValidElement,
  ReactElement,
  ReactNode,
  useMemo,
} from 'react';
import { Row, RowProps } from 'antd';
import { toArray, valueIsEqual } from '@hyperse/utils';
import { useResponsivePoint } from '../fba-hooks/use-responsive-point.js';
import { calculateOperateGrid } from './utils.js';

export type FormRowProps = RowProps & {
  children?: ReactNode | ReactNode[];
  /**
   * default = { xs: 24, sm: 12, md: 8, lg: 8, xl: 8, xxl: 6 };
   * small = { xs: 24, sm: 12, md: 8, lg: 6, xl: 6, xxl: 6 };
   */
  gridSize?: 'default' | 'small';
};
const defaultGrid = { xs: 24, sm: 12, md: 12, lg: 8, xl: 8, xxl: 6 };
const defaultSmallGrid = { xs: 24, sm: 12, md: 8, lg: 6, xl: 6, xxl: 6 };

/**
 * FormItem网格响应式布局
 *```
 * 1. 应用场景：Form条件布局
 * 2. 子元素只能是 FormGrid.Col、FormGrid.OperateCol，其他会被忽略
 * 3. 所有子元素中只能存在一个 FormGrid.OperateCol
 */
export const FormRow = (props: FormRowProps) => {
  const { gridSize, ...otherProps } = props;
  const screenType = useResponsivePoint() || 'md';

  const childrenList = toArray<ReactElement>(props.children).filter((item) => {
    if (!item || !isValidElement(item)) return false;
    return valueIsEqual(item.type['domTypeName'], [
      'FormOperateCol',
      'FormCol',
    ]);
  });
  const defaultGridSize = gridSize === 'small' ? defaultSmallGrid : defaultGrid;

  const { gridList, gridGroupList } = useMemo(() => {
    const operateColIndex = childrenList.findIndex((item) => {
      return item.type['domTypeName'] === 'FormOperateCol';
    });
    if (screenType === undefined) {
      return { gridList: [] as number[], gridGroupList: [] };
    }
    const _currentGridList = childrenList.map((temp, index) => {
      if (index === operateColIndex) return 0;
      const span = temp.props?.span as number;
      if (['md', 'sm', 'xs'].includes(screenType)) {
        const innerSpan =
          temp.props?.[screenType] || defaultGridSize[screenType];
        if (screenType == 'md' && span) {
          return span > innerSpan ? span : innerSpan;
        }
        return innerSpan;
      }
      return temp.props?.[screenType] || span || defaultGridSize[screenType];
    });
    if (operateColIndex < 0) {
      return { gridList: _currentGridList, gridGroupList: [] };
    }
    return calculateOperateGrid(_currentGridList, operateColIndex);
  }, [childrenList, defaultGridSize, screenType]);

  // if (!screenType) return <Fragment>{props.children}</Fragment>;
  return (
    <Row {...otherProps}>
      {childrenList.map((item, index) => {
        const itemProps = { ...defaultGridSize, ...item.props };
        const newProps = {
          key: index,
          ...itemProps,
          [screenType]: gridList[index] || itemProps[screenType],
        };
        if (item.type['domTypeName'] === 'FormOperateCol') {
          newProps['rowColTotal'] = gridGroupList.length;
        }
        return cloneElement(item, newProps);
      })}
    </Row>
  );
};
