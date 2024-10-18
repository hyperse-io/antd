import { isArray } from '@dimjs/lang';
import { getGlobalData, getUuid } from '@hyperse/utils';

const getPermissionList = () => {
  const { elemAclLimits } = getGlobalData<{ elemAclLimits: string[] }>();
  const permissionList: string[] = isArray(elemAclLimits) ? elemAclLimits : [];
  return permissionList;
};

const hasPermission = (name?: string) => {
  if (!name) return true;
  const permissionList = getPermissionList();
  if (permissionList.includes(name)) {
    return true;
  }
  return false;
};

function attachPropertiesToComponent<C, P extends Record<string, unknown>>(
  component: C,
  properties: P
): C & P {
  const ret = component as Record<string, unknown>;
  for (const key in properties) {
    if (Object.prototype.hasOwnProperty.call(properties, key)) {
      ret[key] = properties[key];
    }
  }
  return ret as C & P;
}

const getModelKey = () => {
  return getUuid();
};

export const fbaUtils = {
  hasPermission,
  getPermissionList,
  attachPropertiesToComponent,
  getModelKey,
};
