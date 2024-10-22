import {
  type CSSProperties,
  Fragment,
  type ReactElement,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Space } from 'antd';
import { CheckOutlined, CloseOutlined, EditOutlined } from '@ant-design/icons';
import { isArray, isNumber, isString } from '@dimjs/lang';
import { classNames } from '@dimjs/utils';
import { isUndefinedOrNull, type TAny } from '@hyperse/utils';
import { EditableFieldContext } from '../editable-field-provider/context.js';
import { fbaHooks } from '../fba-hooks/index.js';
import { IconWrapper } from '../icon-wrapper/index.js';
import './style.less';

export interface EditableFieldProps {
  className?: string;
  style?: CSSProperties;
  editRender:
    | ReactElement
    | ((data: {
        value?: TAny;
        onChange?: (data?: TAny) => void;
      }) => ReactElement);
  viewRender?: (value?: TAny) => ReactNode;
  value?: TAny;
  onChange?: (data?: TAny) => void;
  placeholderValue?: string;
  /** edit 区域是否铺满，showEditableIcon=false 无效  */
  isEditFull?: boolean;
  /** 只读状态 */
  readonly?: boolean;
  /** 显示为编辑状态 */
  showEditable?: boolean;
  /** 是否显示编辑、确认、取消操作icon，默认值：true */
  showEditableIcon?: boolean;
  /** 点击编辑按钮，操作前，返回reject不会开启编辑效果 */
  onClickEditIconPre?: (value?: TAny) => Promise<void>;
  onEditCallback?: (value?: TAny) => void;
  /** 点击确定按钮，操作前，返回reject不会执行确定功能 */
  onClickConfirmIconPre?: (value?: TAny, preValue?: TAny) => Promise<void>;
  onConfirmCallback?: (value?: TAny, preValue?: TAny) => void;
  /** 组件操作Icon配置 */
  iconConfig?: {
    editIcon?: (options: { onClick: () => void }) => ReactElement;
    confirmIcon?: (options: { onClick: () => void }) => ReactElement;
    cancelIcon?: (options: { onClick: () => void }) => ReactElement;
  };
}

/**
 * 可编辑字段组件
 * @param props
 * @returns
 * ```
 * 字段渲染有两种状态
 * 1. 只读：如果value类型为复杂格式，必须要通过【viewRender】来进行处理操作，转成简单数据类型
 * 2. 编辑：参数value的格式要求必须满足编辑组件入参value要求
 * 3. 可自定义编辑Icon、确定Icon、取消Icon
 * 4. 可拦截编辑操作、确定操作
 * ```
 */
export const EditableField = (props: EditableFieldProps) => {
  const {
    value,
    onChange,
    viewRender,
    placeholderValue = '-',
    editRender,
    isEditFull,
    onClickEditIconPre,
    onClickConfirmIconPre,
    iconConfig,
    onEditCallback,
    onConfirmCallback,
    showEditable,
  } = props;
  const [isEdit, setIsEdit] = useState(showEditable);
  const ctx = useContext(EditableFieldContext);
  const originalValue = useRef<TAny>(value);
  const showEditableIcon =
    props.showEditableIcon === undefined ? true : props.showEditableIcon;

  const showEditableIconNew = (function () {
    if (ctx.isCtx) {
      return props.showEditableIcon === undefined
        ? ctx.showEditableIcon
        : showEditableIcon;
    }
    return showEditableIcon;
  })();

  const readonly = useMemo(() => {
    if (ctx.isCtx) {
      return props.readonly === undefined ? ctx.readonly : props.readonly;
    }
    return props.readonly;
  }, [ctx.isCtx, ctx.readonly, props.readonly]);

  useEffect(() => {
    if (ctx.isCtx) {
      setIsEdit(
        props.showEditable === undefined ? ctx.showEditable : props.showEditable
      );
    } else {
      setIsEdit(props.showEditable);
    }
  }, [ctx.showEditable, ctx.isCtx, props.showEditable]);

  const theme = fbaHooks.useThemeToken();

  const onClickEditIcon = async () => {
    if (onClickEditIconPre) {
      await onClickEditIconPre(value);
    }
    originalValue.current = value;
    setIsEdit(true);
    onEditCallback?.(value);
  };

  const editIcon = iconConfig?.editIcon ? (
    iconConfig.editIcon({ onClick: onClickEditIcon })
  ) : (
    <IconWrapper
      size="small"
      icon={<EditOutlined />}
      onClick={onClickEditIcon}
    />
  );

  const onCancel = () => {
    if (value !== originalValue.current) {
      onChange?.(originalValue.current);
    }
    setIsEdit(false);
  };

  const onEditChange = (value) => {
    let target = value;
    /** 为了处理 Input、TextArea等onChange取值 */
    if (
      typeof value === 'object' &&
      value !== null &&
      !isArray(value) &&
      value.target
    ) {
      const _value = value.target?.value;
      if (isString(_value) || isNumber(_value) || isUndefinedOrNull(_value)) {
        target = value.target?.value;
      }
    }
    onChange?.(target);
  };

  const onOk = async () => {
    if (onClickConfirmIconPre) {
      await onClickConfirmIconPre(value, originalValue.current);
    }
    setIsEdit(false);
    onConfirmCallback?.(value, originalValue.current);
  };

  const confirmIcon = iconConfig?.confirmIcon ? (
    iconConfig.confirmIcon({ onClick: onOk })
  ) : (
    <IconWrapper
      size="small"
      icon={<CheckOutlined style={{ color: theme.colorPrimary }} />}
      onClick={onOk}
    />
  );

  const cancelIcon = iconConfig?.cancelIcon ? (
    iconConfig.cancelIcon({ onClick: onCancel })
  ) : (
    <IconWrapper
      size="small"
      icon={<CloseOutlined style={{ color: theme.colorPrimary }} />}
      onClick={onCancel}
    />
  );

  const editRenderElement =
    typeof editRender === 'function'
      ? editRender({ value: value, onChange: onEditChange })
      : editRender;

  const viewValue =
    (viewRender ? viewRender(props.value) : props.value) || placeholderValue;

  if (readonly) {
    return <Fragment>{viewValue}</Fragment>;
  }

  if (!isEdit) {
    if (!showEditableIconNew) {
      return viewValue;
    }
    return (
      <Space size={8}>
        <span>{viewValue}</span>
        {editIcon}
      </Space>
    );
  }

  if (!showEditableIconNew) {
    return (
      <editRenderElement.type
        value={value}
        onChange={onEditChange}
        {...editRenderElement.props}
      />
    );
  }

  return (
    <Space
      direction="horizontal"
      size={12}
      style={props.style}
      className={classNames(
        'editable-field',
        { 'editable-field-full': isEditFull },
        props.className
      )}
    >
      <editRenderElement.type
        value={value}
        onChange={onEditChange}
        {...editRenderElement.props}
      />
      {confirmIcon}
      {cancelIcon}
    </Space>
  );
};
