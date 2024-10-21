import { FbaAppConfirm } from '../dialog-confirm/index.jsx';
import { FbaAppModalProps } from '../dialog-modal/index.jsx';

// export type DialogAlertProps = Omit<
//   DialogModalProps,
//   'onOk' | 'cancelHidden' | 'cancelButtonProps' | 'onCancel' | 'onClick'
// > & {
//   onClick?: (e: React.MouseEvent<HTMLElement>) => void | Promise<void>;
// };

// export const dialogAlert = {
//   open: (props: DialogAlertProps) => {
//     return dialogConfirm.open({
//       okText: '确定',
//       cancelHidden: true,
//       maskClosable: false,
//       ...props,
//       onOk: props.onClick,
//     } as DialogModalProps);
//   },
// };

export type FbaAppAlertProps = Omit<
  FbaAppModalProps,
  'onOk' | 'cancelHidden' | 'cancelButtonProps' | 'onCancel' | 'onClick'
> & {
  onClick?: (e: React.MouseEvent<HTMLElement>) => void | Promise<void>;
};

export const FbaAppAlert = (props: FbaAppAlertProps) => {
  return (
    <FbaAppConfirm
      okText="确定"
      cancelHidden={true}
      maskClosable={false}
      {...props}
      onOk={(_form, e) => {
        return props.onClick?.(e);
      }}
    />
  );
};
