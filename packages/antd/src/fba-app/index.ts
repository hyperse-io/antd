import { fbaUtils } from '../fba-utils/fba-utils.js';
import {
  FbaApp as FbaAppInner,
  useDialogAlert,
  useDialogConfirm,
  useDialogDrawer,
  useDialogDrawer2,
  useDialogLoading,
  useDialogModal,
  useDialogModal2,
} from './fba-app.jsx';

export const FbaApp = fbaUtils.attachPropertiesToComponent(FbaAppInner, {
  /** 不支持多次弹框，第二个弹框可使用useDialogDrawer2 */
  useDialogDrawer,
  useDialogDrawer2,
  /** 不支持多次弹框，第二个弹框可使用useDialogModal2 */
  useDialogModal,
  useDialogModal2,
  /** 不支持多次弹框 */
  useDialogConfirm,
  /** 不支持多次弹框 */
  useDialogAlert,
  /** 不支持多次弹框 */
  useDialogLoading,
});
