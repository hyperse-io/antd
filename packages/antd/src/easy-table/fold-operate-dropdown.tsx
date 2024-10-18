import {
  type CSSProperties,
  Fragment,
  type ReactElement,
  useState,
} from 'react';
import { Checkbox, Popover } from 'antd';
import { localStorageCache } from '@hyperse/utils';

type FoldOperateProps = {
  style?: CSSProperties;
  dataList: { dataIndex: string; title: string }[];
  onChange: (keys: string[]) => void;
  cacheKey?: string;
  initSelectedRowKeys?: string[];
  children?: ReactElement;
};

export const FoldOperateDropdown = (props: FoldOperateProps) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>(
    props.initSelectedRowKeys || []
  );

  const onChange = (keys) => {
    setSelectedRowKeys(keys);
    props.onChange(keys);
    if (props.cacheKey) {
      localStorageCache.set(`easy_tab_${props.cacheKey}`, { keys: keys });
    }
  };

  const content = (
    <Fragment>
      <Checkbox.Group
        defaultValue={selectedRowKeys}
        onChange={onChange}
        value={selectedRowKeys}
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        {props.dataList.map((item) => {
          const label = item['_isFoldTitle'] || item.title;
          return (
            <Checkbox
              value={item.dataIndex}
              key={item.dataIndex}
              style={{ padding: '0 0 5px 0' }}
            >
              {label}
            </Checkbox>
          );
        })}
      </Checkbox.Group>
    </Fragment>
  );

  const onChangeAll = (e) => {
    if (e.target.checked) {
      onChange(props.dataList.map((item) => item.dataIndex));
    } else {
      onChange([]);
    }
  };

  return (
    <Popover
      content={content}
      title={
        <Checkbox
          checked={selectedRowKeys.length === props.dataList.length}
          onChange={onChangeAll}
        >
          全选（字段列表）
        </Checkbox>
      }
      placement="bottomRight"
      overlayClassName="fold-operate-popiver"
    >
      {props.children}
    </Popover>
  );
};
