import { ReactNode, useContext, useState } from 'react';
import { getUuid, TPlainObject } from '@hyperse/utils';
import { hooks } from '@wove/react';
import { FbaAppContext, FbaAppContextApi } from './context.js';
import { FbaAppAlert, FbaAppAlertProps } from './dialog-alert/index.jsx';
import { FbaAppConfirm, FbaAppConfirmProps } from './dialog-confirm/index.jsx';
import { useFbaAppDialogDrawerCtx } from './dialog-drawer/context.js';
import { FbaAppDrawer, FbaAppDrawerProps } from './dialog-drawer/index.jsx';
import { FbaAppLoading, FbaAppLoadingProps } from './dialog-loading/index.jsx';
import { useFbaAppDialogModalCtx } from './dialog-modal/context.js';
import { FbaAppModal, FbaAppModalProps } from './dialog-modal/index.jsx';

/**
 * 不支持多个弹框，第二个弹框可使用useDialogDrawer2
 */
export const useDialogDrawer = () => {
  const ctx = useContext(FbaAppContext);

  const onClose = () => {
    ctx.dialogDrawerClose?.();
  };

  return {
    appDialogDrawer: {
      open: (data: FbaAppDrawerProps) => {
        ctx.dialogDrawerOpen?.({ ...data, open: true });
        return { onClose };
      },
      close: onClose,
      /**
       * ```
       * 1. rerenderFooter 携带指定数据重新渲染 footer，可用于切换footer中的按钮状态
       * ```
       */
      useAppDialogDrawer: () => {
        const ctx = useFbaAppDialogDrawerCtx();
        return {
          /** 重新渲染 footer， data为携带的数据，是footer的第二个参数  */
          rerenderFooter: (data?: TPlainObject) => {
            ctx.rerenderFooter(data);
          },
        };
      },
    },
  };
};

/**
 * 不支持多个弹框，第二个弹框可使用useDialogDrawer2
 */
export const useDialogDrawer2 = () => {
  const ctx = useContext(FbaAppContext);

  const onClose = () => {
    ctx.dialogDrawerClose2?.();
  };

  return {
    appDialogDrawer2: {
      open: (data: FbaAppDrawerProps) => {
        ctx.dialogDrawerOpen2?.({ ...data, open: true });
        return { onClose };
      },
      close: onClose,
      /**
       * ```
       * 1. rerenderFooter 携带指定数据重新渲染 footer，可用于切换footer中的按钮状态
       * ```
       */
      useAppDialogDrawer: () => {
        const ctx = useFbaAppDialogDrawerCtx();
        return {
          /** 重新渲染 footer， data为携带的数据，是footer的第二个参数  */
          rerenderFooter: (data?: TPlainObject) => {
            ctx.rerenderFooter(data);
          },
        };
      },
    },
  };
};

/**
 * 不支持多个弹框，第二个弹框可使用useDialogModal2
 * ```
 * 1. 配置size属性可使用预设的弹窗尺寸，如果不使用内置尺寸可设置 size = null
 * ```
 */
export const useDialogModal = () => {
  const ctx = useContext(FbaAppContext);

  const onClose = () => {
    ctx.dialogModalClose?.();
  };

  return {
    appDialogModal: {
      open: (data: FbaAppModalProps) => {
        ctx.dialogModalOpen?.({ ...data, open: true });
        return { onClose };
      },
      close: onClose,
      /**
       * rerenderFooter 携带指定数据重新渲染 footer，可用于切换footer中的按钮状态
       */
      useAppDialogModal: () => {
        const ctx = useFbaAppDialogModalCtx();
        return {
          /** 重新渲染 footer， data为携带的数据，是footer的第二个参数  */
          rerenderFooter: (data?: TPlainObject) => {
            ctx.rerenderFooter(data);
          },
        };
      },
    },
  };
};

/**
 * 不支持多个弹框
 * ```
 * 1. 配置size属性可使用预设的弹窗尺寸，如果不使用内置尺寸可设置 size = null
 * ```
 */
export const useDialogModal2 = () => {
  const ctx = useContext(FbaAppContext);

  const onClose = () => {
    ctx.dialogModalClose2?.();
  };

  return {
    appDialogModal2: {
      open: (data: FbaAppModalProps) => {
        ctx.dialogModalOpen2?.({ ...data, open: true });
        return { onClose };
      },
      close: onClose,
      /**
       * rerenderFooter 携带指定数据重新渲染 footer，可用于切换footer中的按钮状态
       */
      useAppDialogModal: () => {
        const ctx = useFbaAppDialogModalCtx();
        return {
          /** 重新渲染 footer， data为携带的数据，是footer的第二个参数  */
          rerenderFooter: (data?: TPlainObject) => {
            ctx.rerenderFooter(data);
          },
        };
      },
    },
  };
};

/**
 * 不支持多个弹框
 * @returns
 */
export const useDialogAlert = () => {
  const ctx = useContext(FbaAppContext);

  const onClose = () => {
    ctx.dialogAlertClose?.();
  };

  return {
    appDialogAlert: {
      open: (data: FbaAppAlertProps) => {
        ctx.dialogAlertOpen?.({ ...data, open: true });
        return { onClose };
      },
      close: onClose,
    },
  };
};
/**
 * 不支持多个弹框
 * @returns
 */
export const useDialogConfirm = () => {
  const ctx = useContext(FbaAppContext);

  const onClose = () => {
    ctx.dialogConfirmClose?.();
  };

  return {
    appDialogConfirm: {
      open: (data: FbaAppConfirmProps) => {
        ctx.dialogConfirmOpen?.({ ...data, open: true });
        return { onClose };
      },
      close: onClose,
    },
  };
};
/**
 * 不支持多个弹框
 * @returns
 */
export const useDialogLoading = () => {
  const ctx = useContext(FbaAppContext);

  const onClose = () => {
    ctx.dialogLoadingClose?.();
  };

  return {
    appDialogLoading: {
      open: (data?: FbaAppLoadingProps) => {
        ctx.dialogLoadingOpen?.({ ...data, open: true });
        return { onClose };
      },
      close: onClose,
    },
  };
};

export const FbaApp = (props: { children: ReactNode }) => {
  const [drawerProps, setDrawerProps] = useState<FbaAppDrawerProps>(
    {} as FbaAppDrawerProps
  );
  const [drawerKey, setDrawerKey] = useState(getUuid());

  const [drawerProps2, setDrawerProps2] = useState<FbaAppDrawerProps>(
    {} as FbaAppDrawerProps
  );
  const [drawerKey2, setDrawerKey2] = useState(getUuid());

  const [modalProps, setModalProps] = useState<FbaAppModalProps>(
    {} as FbaAppModalProps
  );
  const [modalKey, setModalKey] = useState(getUuid());

  const [modalProps2, setModalProps2] = useState<FbaAppModalProps>(
    {} as FbaAppModalProps
  );
  const [modalKey2, setModalKey2] = useState(getUuid());

  const [alertProps, setAlertProps] = useState<FbaAppAlertProps>(
    {} as FbaAppAlertProps
  );
  const [confirmProps, setConfirmProps] = useState<FbaAppConfirmProps>(
    {} as FbaAppConfirmProps
  );
  const [loadingProps, setLoadingProps] = useState<FbaAppLoadingProps>();

  const [alertKey, setAlertKey] = useState(getUuid());
  const [confirmKey, setConfirmKey] = useState(getUuid());
  const [loadingKey, setLoadingKey] = useState(getUuid());

  const dialogDrawerOpen: FbaAppContextApi['dialogDrawerOpen'] =
    hooks.useCallbackRef((data) => {
      setDrawerProps(data);
    });
  const dialogDrawerClose = hooks.useCallbackRef((e) => {
    setDrawerProps({ ...drawerProps, open: false } as FbaAppDrawerProps);
    drawerProps.onClose?.(e);
    setTimeout(() => {
      setDrawerKey(getUuid());
    }, 200);
  });

  const dialogDrawerOpen2: FbaAppContextApi['dialogDrawerOpen2'] =
    hooks.useCallbackRef((data) => {
      setDrawerProps2(data);
    });

  const dialogDrawerClose2 = hooks.useCallbackRef((e) => {
    setDrawerProps2({ ...drawerProps2, open: false } as FbaAppDrawerProps);
    drawerProps2.onClose?.(e);
    setTimeout(() => {
      setDrawerKey2(getUuid());
    }, 200);
  });

  const dialogModalOpen: FbaAppContextApi['dialogModalOpen'] =
    hooks.useCallbackRef((data) => {
      setModalProps(data);
    });

  const dialogModalClose = hooks.useCallbackRef(() => {
    setModalProps({ ...modalProps, open: false } as FbaAppModalProps);
    modalProps.onClose?.();
    setTimeout(() => {
      setModalKey(getUuid());
    }, 200);
  });

  const dialogModalOpen2: FbaAppContextApi['dialogModalOpen2'] =
    hooks.useCallbackRef((data) => {
      setModalProps2(data);
    });

  const dialogModalClose2 = hooks.useCallbackRef(() => {
    setModalProps2({ ...modalProps2, open: false } as FbaAppModalProps);
    modalProps2.onClose?.();
    setTimeout(() => {
      setModalKey2(getUuid());
    }, 200);
  });

  const dialogAlertOpen: FbaAppContextApi['dialogAlertOpen'] =
    hooks.useCallbackRef((data) => {
      setAlertProps(data);
    });

  const dialogAlertClose = hooks.useCallbackRef(() => {
    setAlertProps({ ...alertProps, open: false } as FbaAppAlertProps);
    alertProps.onClose?.();
    setTimeout(() => {
      setAlertKey(getUuid());
    }, 200);
  });

  const dialogConfirmOpen: FbaAppContextApi['dialogConfirmOpen'] =
    hooks.useCallbackRef((data) => {
      setConfirmProps(data);
    });

  const dialogConfirmClose = hooks.useCallbackRef(() => {
    setConfirmProps({ ...confirmProps, open: false } as FbaAppConfirmProps);
    confirmProps.onClose?.();
    setTimeout(() => {
      setConfirmKey(getUuid());
    }, 200);
  });

  const dialogLoadingOpen: FbaAppContextApi['dialogLoadingOpen'] =
    hooks.useCallbackRef((data) => {
      setLoadingProps(data);
    });

  const dialogLoadingClose = hooks.useCallbackRef(() => {
    setLoadingProps({ ...loadingProps, open: false } as FbaAppLoadingProps);
    setTimeout(() => {
      setLoadingKey(getUuid());
    }, 200);
  });

  return (
    <FbaAppContext.Provider
      value={{
        dialogDrawerOpen,
        dialogDrawerClose,
        dialogDrawerOpen2,
        dialogDrawerClose2,
        dialogModalOpen,
        dialogModalClose,
        dialogModalOpen2,
        dialogModalClose2,
        dialogAlertOpen,
        dialogAlertClose,
        dialogConfirmOpen,
        dialogConfirmClose,
        dialogLoadingOpen,
        dialogLoadingClose,
      }}
    >
      <FbaAppDrawer
        {...drawerProps}
        onClose={dialogDrawerClose}
        key={drawerKey}
      ></FbaAppDrawer>
      <FbaAppDrawer
        {...drawerProps2}
        onClose={dialogDrawerClose2}
        key={drawerKey2}
      ></FbaAppDrawer>
      <FbaAppModal
        {...modalProps}
        onClose={dialogModalClose}
        key={modalKey}
      ></FbaAppModal>
      <FbaAppModal
        {...modalProps2}
        onClose={dialogModalClose2}
        key={modalKey2}
      ></FbaAppModal>
      <FbaAppAlert
        {...alertProps}
        onClose={dialogAlertClose}
        key={alertKey}
      ></FbaAppAlert>
      <FbaAppConfirm
        {...confirmProps}
        onClose={dialogConfirmClose}
        key={confirmKey}
      ></FbaAppConfirm>
      <FbaAppLoading {...loadingProps} key={loadingKey}></FbaAppLoading>
      {props.children}
    </FbaAppContext.Provider>
  );
};
