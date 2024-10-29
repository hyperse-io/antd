import { useMemo } from 'react';
import { type TAny, type TPlainObject } from '@hyperse/utils';
import { ButtonWrapper } from '../../button-wrapper/index.js';
import { fbaHooks } from '../../fba-hooks/index.js';
import { FlexLayout } from '../../flex-layout/index.js';
import { IconWrapper } from '../../icon-wrapper/index.js';
import { SvgHttpView } from '../../svg-http-view/index.js';
import { TipsWrapper } from '../../tips-wrapper/index.js';
import { FoldOperateDropdown } from '../fold-operate-dropdown.jsx';
import { type EasyTableProps } from '../type.js';

export const useColumnsAppendTips = (props: { columns: TPlainObject[] }) => {
  return useMemo(() => {
    const tempList = props.columns
      .map((item) => {
        const { tipsWrapperProps, title, ...otherProps } = item;
        if (typeof title === 'string' && tipsWrapperProps) {
          if (typeof tipsWrapperProps === 'string') {
            return {
              ...otherProps,
              title: (
                <TipsWrapper
                  tipType="popover"
                  popoverProps={{ content: tipsWrapperProps }}
                >
                  {title}
                </TipsWrapper>
              ),
            };
          }
          return {
            ...otherProps,
            title: <TipsWrapper {...tipsWrapperProps}>{title}</TipsWrapper>,
          };
        }
        return item;
      })
      .filter(Boolean);
    return [...tempList] as TPlainObject[];
  }, [props.columns]);
};

export const useColumnsAppendInnerColumn = (props: {
  columns: TPlainObject[];
  showFoldKeyList: string[];
  columnFoldConfig?: EasyTableProps['columnFoldConfig'];
  onOpenColumnFoldModal: () => void;
  onChangeFoldColumnList: (keyList: string[]) => void;
  foldColumnList: TPlainObject[];
}) => {
  const columnsNew = props.columns;
  return fbaHooks.useMemoCustom(() => {
    if (props.columnFoldConfig?.hidden) return columnsNew;
    const finalItem = columnsNew[columnsNew.length - 1];
    if (props.foldColumnList.length > 0 && columnsNew.length > 0) {
      const foldColumnTarget = columnsNew.find((item) => item['_isFoldColumn']);

      if (
        foldColumnTarget &&
        finalItem.dataIndex !== foldColumnTarget.dataIndex
      ) {
        foldColumnTarget.title = foldColumnTarget['_isFoldTitle'];
        foldColumnTarget['_isFoldColumn'] = false;
      }
      if (!finalItem['_isFoldColumn']) {
        finalItem['_isFoldTitle'] =
          finalItem['_isFoldTitle'] || finalItem.title;
        finalItem['_isFoldColumn'] = true;

        const triggerType = props.columnFoldConfig?.triggerType;

        finalItem.title = (
          <FlexLayout
            direction="horizontal"
            fullIndex={0}
            style={{ alignItems: 'center' }}
          >
            <span>{finalItem.title}</span>
            <div style={{ padding: '0 5px 0 20px', display: 'flex' }}>
              {triggerType === 'drawer' ? (
                <IconWrapper
                  onClick={props.onOpenColumnFoldModal}
                  text={props.columnFoldConfig?.text}
                  size="small"
                  icon={props.columnFoldConfig?.icon}
                  hoverTips={props.columnFoldConfig?.hoverTipText || '字段列表'}
                  style={{ padding: 0, margin: 0 }}
                />
              ) : (
                <FoldOperateDropdown
                  dataList={props.foldColumnList as TAny[]}
                  onChange={props.onChangeFoldColumnList}
                  cacheKey={props.columnFoldConfig?.cacheKey}
                  initSelectedRowKeys={props.showFoldKeyList}
                >
                  <IconWrapper
                    text={props.columnFoldConfig?.text}
                    style={{ padding: 0, margin: 0 }}
                    size="small"
                    icon={props.columnFoldConfig?.icon}
                  />
                </FoldOperateDropdown>
              )}
            </div>
          </FlexLayout>
        );
      }
    }
    return columnsNew;
  }, [props.columns, props.columnFoldConfig]);
};

export const useColumnsToHidden = (props: {
  columns: TPlainObject[];
  showFoldKeyList: string[];
}) => {
  return useMemo(() => {
    const tempList = props.columns
      .map((item) => {
        const { hidden, isFold } = item;
        if (hidden) return null;
        if (isFold && !props.showFoldKeyList.includes(item.dataIndex as string))
          return null;
        return item;
      })
      .filter(Boolean);
    return [...tempList] as TPlainObject[];
  }, [props.columns, props.showFoldKeyList]);
};

export const useColumnByAsyncColumnRequest = (props: {
  columns: TPlainObject[];
  asyncColumnRequestResult: TPlainObject;
}) => {
  return useMemo(() => {
    if (!Object.keys(props.asyncColumnRequestResult)) return props.columns;
    return props.columns.map((item: TAny) => {
      const dataIndex = item.dataIndex as string;
      const result = props.asyncColumnRequestResult[dataIndex];
      if (dataIndex && result) {
        if (result.loading) {
          item.render = (value) => {
            return (
              <ButtonWrapper
                loading
                type="text"
                loadingPosition="center"
                removeGap
              >
                {value}
              </ButtonWrapper>
            );
          };
        } else if (item.asyncRender) {
          item.render = (value, record, index) => {
            return item.asyncRender?.(value, record, index, result.respData);
          };
        }
      }
      return item;
    });
  }, [props.columns, props.asyncColumnRequestResult]);
};
