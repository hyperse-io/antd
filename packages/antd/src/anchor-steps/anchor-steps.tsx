import { ReactElement, useRef, useState } from 'react';
import { Anchor, Steps } from 'antd';
import { classNames } from '@dimjs/utils';
import { Gap } from '../gap/gap.jsx';
import './style.less';

function isElement(node: Element) {
  const ELEMENT_NODE_TYPE = 1;
  return (
    node.tagName !== 'HTML' &&
    node.tagName !== 'BODY' &&
    node.nodeType === ELEMENT_NODE_TYPE
  );
}

function getParentScroll(el: HTMLElement) {
  let node = el;

  while (node && isElement(node)) {
    const { overflowY } = window.getComputedStyle(node);
    if (/scroll|auto/i.test(overflowY)) {
      return node;
    }
    node = node.parentNode as HTMLElement;
  }
  return undefined;
}

export type AnchorStepsProps = {
  steps: {
    id: string;
    title: string;
    content: ReactElement;
  }[];
  className?: string;
};

/**
 * 锚点步骤组件
 * @param props
 * @returns
 */
export const AnchorSteps = (props: AnchorStepsProps) => {
  const [activeKey, setActiveKey] = useState<string>();
  const rootNode = useRef<HTMLDivElement>();

  const onChange = (link: string) => {
    if (link) {
      setActiveKey(link.replace('#vas-', ''));
    }
  };

  const getContainer = () => {
    return (
      getParentScroll(rootNode.current as HTMLElement) || (window as Window)
    );
  };
  const refHandle = (node) => {
    if (node) {
      rootNode.current = node;
    }
  };

  return (
    <div
      className={classNames('v-anchor-steps', props.className)}
      ref={refHandle}
    >
      <Anchor
        onChange={onChange}
        className="v-fixed-anchor"
        onClick={(e) => {
          e.preventDefault();
        }}
        affix={false}
        getContainer={getContainer}
      >
        <Steps
          size="small"
          direction="vertical"
          current={props.steps.findIndex((item) => item.id === activeKey)}
          items={props.steps.map((item) => {
            return {
              title: (
                <Anchor.Link href={`#vas-${item.id}`} title={item.title} />
              ),
              description: <Gap height={20} />,
              status: item.id === activeKey ? 'process' : 'wait',
            };
          })}
        />
      </Anchor>
      {props.steps.map((item) => {
        return (
          <div id={`vas-${item.id}`} key={item.id}>
            {item.content}
          </div>
        );
      })}
    </div>
  );
};
