import { createContext } from 'react';
import { FbaAppAlertProps } from './dialog-alert/index.js';
import { FbaAppConfirmProps } from './dialog-confirm/index.js';
import { FbaAppDrawerProps } from './dialog-drawer/index.js';
import { FbaAppLoadingProps } from './dialog-loading/index.js';
import { FbaAppModalProps } from './dialog-modal/index.js';

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
