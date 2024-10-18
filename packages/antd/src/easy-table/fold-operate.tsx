import { type CSSProperties, Fragment, useState } from 'react';
import { Drawer, Table } from 'antd';
import { type ColumnsType } from 'antd/es/table';
import { type TableRowSelection } from 'antd/es/table/interface.js';
import {
  localStorageCache,
  type TAny,
  type TPlainObject,
} from '@hyperse/utils';

type FoldOperateProps = {
  style?: CSSProperties;
  dataList: { dataIndex?: string; title: string }[];
  onChange: (keys: string[]) => void;
  open?: boolean;
  onClose?: () => void;
  cacheKey?: string;
  initSelectedRowKeys?: string[];
};

export const FoldOperate = (props: FoldOperateProps) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>(
    props.initSelectedRowKeys || []
  );
  const rowSelection = {
    type: 'checkbox',
    selectedRowKeys: selectedRowKeys,
    onChange: (selectedRowKeys: string[]) => {
      setSelectedRowKeys(selectedRowKeys);
      props.onChange(selectedRowKeys);
      if (props.cacheKey) {
        localStorageCache.set(`easy_tab_${props.cacheKey}`, {
          keys: selectedRowKeys,
        });
      }
    },
  } as TableRowSelection<TAny>;

  const columns: ColumnsType<TPlainObject> = [
    {
      title: '字段名称',
      dataIndex: 'title',
      render: (value, recrd) => {
        return recrd['_isFoldTitle'] || value;
      },
    },
    { title: '字段Key', dataIndex: 'dataIndex' },
  ];

  return (
    <Fragment>
      <Drawer
        title="选择字段"
        open={props.open}
        onClose={props.onClose}
        width={'35%'}
        styles={{
          body: {
            padding: 15,
          },
        }}
      >
        <Table
          bordered
          size="small"
          columns={columns}
          rowSelection={rowSelection}
          rowKey="dataIndex"
          pagination={false}
          scroll={{ x: 'max-content' }}
          dataSource={props.dataList}
        />
      </Drawer>
    </Fragment>
  );
};
