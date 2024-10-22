import { createContext } from 'react';
import { type FbaAppAlertProps } from './dialog-alert/index.js';
import { type FbaAppConfirmProps } from './dialog-confirm/index.js';
import { type FbaAppDrawerProps } from './dialog-drawer/index.js';
import { type FbaAppLoadingProps } from './dialog-loading/index.js';
import { type FbaAppModalProps } from './dialog-modal/index.js';

export type FbaAppContextApi = {
  dialogDrawerOpen?: (data: FbaAppDrawerProps) => void;
  dialogDrawerClose?: (e?) => void;

  dialogDrawerOpen2?: (data: FbaAppDrawerProps) => void;
  dialogDrawerClose2?: (e?) => void;

  dialogModalOpen?: (data: FbaAppModalProps) => void;
  dialogModalClose?: () => void;

  dialogModalOpen2?: (data: FbaAppModalProps) => void;
  dialogModalClose2?: () => void;

  dialogAlertOpen?: (data: FbaAppAlertProps) => void;
  dialogAlertClose?: () => void;

  dialogConfirmOpen?: (data: FbaAppConfirmProps) => void;
  dialogConfirmClose?: () => void;

  dialogLoadingOpen?: (data?: FbaAppLoadingProps & { open?: boolean }) => void;
  dialogLoadingClose?: () => void;
};

export const FbaAppContext = createContext<FbaAppContextApi>({});
