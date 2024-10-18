import { Fragment } from 'react';
import { TAny } from '@hyperse/utils';
import { useIframe } from './hooks';

export const IframeMainRegister = () => {
  const iframeApi = useIframe((data: TAny) => {
    if (data.type === '__refresh-iframe-tab') {
      iframeApi.broadcastMessages({
        type: data.type,
        data: data.data,
      });
    }
  });

  return <Fragment />;
};
