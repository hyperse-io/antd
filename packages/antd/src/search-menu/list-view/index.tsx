import { type CSSProperties, type FC, type ReactElement } from 'react';
import { Empty } from 'antd';
import { classNames } from '@dimjs/utils';
import { RollLocationCenter } from '../../roll-location-center/index.js';
import { type IListViewItem } from '../type.js';
import './style.less';

export interface IListViewProps {
  dataList: IListViewItem[];
  value?: string;
  onChange?: (key: string, item: IListViewItem) => void;
  style?: CSSProperties;
  /** 自定义空数据提示 */
  emptyView?: ReactElement;
}

/**
 * 搜索列表
 * @param props
 * @returns search menu list view
 */
export const ListView: FC<IListViewProps> = (props) => {
  const { value, dataList, onChange, style, emptyView } = props;
  // 数据判空提示
  if (!dataList?.length) {
    return emptyView ? (
      <>{emptyView}</>
    ) : (
      <Empty
        style={{
          marginTop: '40px',
        }}
        description="暂无数据"
      />
    );
  }

  return (
    <ul className="v-search-menu-list-view" style={style}>
      <RollLocationCenter
        activeKey={props.value}
        renderList={dataList.map((item) => {
          return {
            activeKey: item.key,
            render: (
              <li
                className={classNames('v-search-menu-list-view-item', {
                  'v-search-menu-list-view-item-active': value == item.key,
                })}
                key={item.key}
                onClick={onChange?.bind(null, item.key, item)}
              >
                {item.label}
              </li>
            ),
          };
        })}
      />
    </ul>
  );
};
