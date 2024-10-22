import { Fragment, isValidElement, type ReactElement, useState } from 'react';
import { type TAny } from '@hyperse/utils';

export interface ModalActionProps {
  children:
    | ReactElement
    | ((data: { onClose: () => void; open: boolean }) => ReactElement);
  action?:
    | (ReactElement & { onClick?: (e) => void })
    | ((data: {
        onClick: (e) => void;
        onClose: () => void;
        open: boolean;
      }) => ReactElement);
}

/**
 * 弹框 触发器
 * ```
 * <ModalAction action={<Button type="primary">打开</Button>}>
 *   {({ onClose }) => (
 *     <Modal onOk={onClose}>xxx</Modal>
 *   )}
 * </ModalAction>
 * ```
 */
export const ModalAction = (props: ModalActionProps) => {
  const { action, children } = props;

  const [open, setOpen] = useState<boolean>(false);

  const handleOnClick = async (e: unknown) => {
    if (isValidElement(action)) {
      const { onClick } = action.props;
      if (typeof onClick === 'function') {
        await onClick?.(e);
      }
    }
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };
  const childrenReactElement = isValidElement(children)
    ? children
    : (children as TAny)({ onClose, open });

  return (
    <Fragment>
      {isValidElement(action) ? (
        <action.type {...action.props} onClick={handleOnClick} />
      ) : (
        action?.({ onClick: handleOnClick, onClose, open })
      )}
      <childrenReactElement.type
        open={open}
        onClose={onClose}
        onCancel={onClose}
        {...childrenReactElement.props}
      />
    </Fragment>
  );
};
