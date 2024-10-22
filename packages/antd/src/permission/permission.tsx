import { Fragment, type ReactNode } from 'react';
import { fbaUtils } from '../fba-utils/index.js';

export interface PermissionProps {
  name?: string;
  children?: ReactNode | ReactNode[];
}
export const Permission = (props: PermissionProps) => {
  const permissionList = fbaUtils.getPermissionList();
  if (!props.name || permissionList.includes(props.name)) {
    return <Fragment>{props.children}</Fragment>;
  }
  return null;
};
