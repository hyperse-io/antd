import { Fragment, memo } from 'react';
type IframePageProps = {
  id: string;
  link: string;
  iframeKey: string;
  onLoad: () => void;
  menuKey?: string;
};

const IframePageInner = (props: IframePageProps) => {
  return (
    <Fragment>
      <iframe
        id={`iframe_${String(props.id)}`}
        src={props.link}
        width="100%"
        height="100%"
        key={props.iframeKey}
        style={{ border: 'none' }}
        onLoad={props.onLoad}
        className={`iframe-${props.menuKey}`}
      />
    </Fragment>
  );
};

export const IframePage = memo(IframePageInner, (prevProps, nextProps) => {
  return prevProps.iframeKey === nextProps.iframeKey;
});
