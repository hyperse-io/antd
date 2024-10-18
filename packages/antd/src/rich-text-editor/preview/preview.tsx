import { Fragment } from 'react';
import { Image } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import { dynamicNode } from '../../dynamic-node/index.js';
import { fbaHooks } from '../../fba-hooks/index.js';
import './preview.less';

export const Preview = (props) => {
  const { visible, url } = props;

  fbaHooks.useEffectCustom(() => {
    if (visible) {
      dynamicNode.append({
        content: (
          <PlusCircleOutlined
            onClick={props.close}
            className="preview-image-popup-close"
            twoToneColor="#1890ff"
          />
        ),
      });
    } else {
      dynamicNode.remove();
    }
  }, [visible]);

  if (!url) return <></>;

  return (
    <Fragment>
      <Image
        key={url}
        style={{ left: '100px' }}
        preview={{
          className: 'preview-image-popup',
          maskStyle: { backgroundColor: 'rgba(0,0,0,0.85)' },
          visible,
          src: url,
          onVisibleChange: () => {
            props.close();
          },
        }}
      />
    </Fragment>
  );
};
