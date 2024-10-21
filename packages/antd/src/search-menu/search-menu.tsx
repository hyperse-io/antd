import { useMemo, useState } from 'react';
import { classNames } from '@dimjs/utils';
import { type TPlainObject, valueIsEqual } from '@hyperse/utils';
import { hooks } from '@wove/react';
import { fbaHooks } from '../fba-hooks/index.js';
import { InputSearchWrapper } from '../input-search-wrapper/index.js';
import { type IListViewProps, ListView } from './list-view/index.jsx';
import { type ISearchMenuProps } from './type.js';
import './style.less';

/**
 * 列表搜索
 * @param props
 * @returns
 */
export function SearchMenu(
  props: ISearchMenuProps & Pick<IListViewProps, 'emptyView'>
) {
  const {
    value,
    onChange,
    dataSource,
    searchKeyList,
    wrapStyle,
    style,
    placeholder,
    fieldNames,
    renderItem,
    lazySearch,
    className,
    searchStyle,
    emptyView,
    showSearch,
    size,
  } = props;
  const [listFilter, setListFilter] = useState<TPlainObject[]>([]);

  /** 格式化对象 */
  const mergeFormatOption = useMemo(() => {
    return {
      label: 'label',
      key: 'key',
      ...fieldNames,
    };
  }, [fieldNames]);

  /** 可搜索的字段值 */
  const targetSearchKeyList = searchKeyList?.length
    ? searchKeyList
    : [mergeFormatOption.label];

  /** 生成菜单列表 */
  const listViewData = useMemo(() => {
    const { label, key } = mergeFormatOption;
    return listFilter?.map((item) => {
      return {
        ...item,
        label: renderItem ? renderItem(item) : item?.[label],
        key: item?.[key],
      };
    });
  }, [listFilter, mergeFormatOption, renderItem]);

  /**
   * 数据格式化
   */
  fbaHooks.useEffectCustom(() => {
    handleSearch('');
  }, [dataSource]);

  /** 搜索 */
  const handleSearch = (searchWord: string) => {
    if (!searchWord) {
      // 还原列表
      setListFilter(dataSource);
      return;
    }
    // 根据搜索次过滤
    const resList = dataSource.filter((item) => {
      return !!targetSearchKeyList?.find((key) => {
        return item[key]?.includes(searchWord);
      });
    });
    setListFilter(resList);
  };

  /**
   * 搜索词变换
   * @param e
   */
  const handleWordChange = (e) => {
    handleSearch(e.target.value);
  };

  /**
   * 点击条目
   */
  const onClick = hooks.useCallbackRef((key) => {
    const targetItem = dataSource.find((item) =>
      valueIsEqual(key, item[mergeFormatOption.key])
    );
    onChange?.(key, targetItem);
  });

  const cname = classNames(className, 'v-search-menu', {
    'v-search-menu-small': size === 'small',
  });

  return (
    <div style={wrapStyle} className={cname}>
      {showSearch !== false ? (
        <div className="v-search-menu-search-area" style={searchStyle}>
          <InputSearchWrapper
            onSearch={lazySearch ? handleSearch : undefined}
            onChange={!lazySearch ? handleWordChange : undefined}
            placeholder={placeholder || '请输入搜索关键词'}
            allowClear
          />
          {!!props.searchExtraElement && (
            <div className="v-search-menu-search-extra">
              {props.searchExtraElement}
            </div>
          )}
        </div>
      ) : null}
      <ListView
        style={style}
        value={value}
        dataList={listViewData}
        onChange={onClick}
        emptyView={emptyView}
      />
    </div>
  );
}
