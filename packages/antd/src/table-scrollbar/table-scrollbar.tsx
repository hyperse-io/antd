import { cloneElement, useEffect, useRef, useState } from 'react';
import { useCreation, useEventListener, useInViewport, useSize } from 'ahooks';
import { Affix } from 'antd';
import { get } from '@dimjs/utils';
import { fbaHooks } from '../fba-hooks/index.js';
import './style.less';
const { useEffectCustom } = fbaHooks;

type TableScrollProps = {
  children: React.ReactNode;
  /**
   * y轴的滚动条
   */
  target?: HTMLElement;
};

const getParentNodeScroll = (
  parentNode: HTMLElement | null | undefined
): HTMLElement | undefined => {
  if (!parentNode) return undefined;
  const computedStyle = getComputedStyle(parentNode);
  if (
    computedStyle.overflowY === 'scroll' ||
    computedStyle.overflowY === 'auto'
  ) {
    return parentNode;
  }
  return getParentNodeScroll(parentNode.parentNode as HTMLElement);
};
/**
 * 表格x轴浮动滚动条
 * ```
 * 使用方法
 * <TableScrollbar>
 *    <Table/>
 * </TableScrollbar>
 * ```
 */
export const TableScrollbar = ({
  children,
  target,
  ...props
}: TableScrollProps) => {
  const summary: any = get(children as any, 'props.summary');
  return cloneElement(children as any, {
    ...props,
    summary: (...args) => (
      <>
        {summary?.(...args)}
        <ScrollbarSummary target={target} />
      </>
    ),
  });
};
type ScrollbarSummaryProps = {
  target?: HTMLElement;
};
const ScrollbarSummary = ({ target }: ScrollbarSummaryProps) => {
  const refScrollBox = useRef<HTMLDivElement>();
  const refScroll = useRef<HTMLDivElement>();
  // 控制滚动条的显示
  const [show, setShow] = useState<boolean>(false);
  // 获取表格和表格包裹框
  const { table, tableBox } = useCreation(() => {
    const getParentTable = (
      parentNode: HTMLElement | null | undefined
    ): HTMLElement | undefined => {
      if (!parentNode) return undefined;
      if (parentNode.nodeName === 'TABLE') {
        return parentNode;
      }
      return getParentTable(parentNode.parentNode as HTMLElement);
    };
    const table = getParentTable(refScrollBox?.current?.parentElement);
    return {
      table,
      tableBox: table?.parentElement,
    };
  }, [refScrollBox.current]);
  // 表格是否显示
  const [inViewport] = useInViewport(table?.querySelector('tbody'));

  // 监听左右滚动框的大小变化
  const size = useSize(tableBox);
  // 获取上下滚动事件的滚动条
  const _target = useCreation(() => {
    if (target) return target;
    return getParentNodeScroll(table) || document.body;
  }, [target, table, size]);

  useEffectCustom(() => {
    if (show && refScrollBox.current && refScroll.current) {
      if (refScrollBox.current.clientWidth != tableBox?.clientWidth) {
        refScrollBox.current.style.width = `${tableBox?.clientWidth || 0}px`;
      }
      if (refScroll.current.clientWidth != table?.clientWidth) {
        refScroll.current.style.width = `${table?.clientWidth || 0}px`;
      }
    }
  }, [size, show]);
  // 注册原始滚动条事件
  useEventListener(
    'scroll',
    ({ target }) => {
      if (refScrollBox.current) {
        refScrollBox.current.scrollLeft = target.scrollLeft;
      }
    },
    { target: () => tableBox }
  );
  // 注册原始自定义滚动条时间
  useEventListener(
    'scroll',
    ({ target }) => {
      if (tableBox) tableBox.scrollLeft = target.scrollLeft;
    },
    { target: refScrollBox }
  );

  const [key, setKey] = useState<number>(0);
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let parentNode = rootRef.current?.parentNode as HTMLElement;
    let inModal = false;
    while (parentNode != null) {
      if (
        parentNode.classList?.contains('ant-modal-content') ||
        parentNode.classList?.contains('ant-drawer-body')
      ) {
        inModal = true;
        break;
      }
      parentNode = parentNode.parentNode as HTMLElement;
    }
    if (inModal) {
      setTimeout(() => {
        setKey(Date.now());
      }, 400);
    } else {
      setKey(Date.now());
    }
  }, []);

  return (
    <div className="scrollbar-main" ref={rootRef}>
      {key ? (
        <Affix
          offsetBottom={inViewport ? 13 : 0}
          style={{ opacity: show ? 1 : 0 }}
          onChange={(value) => {
            setShow(!!value);
          }}
          target={() => _target}
        >
          <div ref={refScrollBox as any} className="scrollbar-box">
            <div ref={refScroll as any} style={{ height: 1 }}></div>
          </div>
        </Affix>
      ) : null}
    </div>
  );
};
