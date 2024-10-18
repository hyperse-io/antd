import { fbaUtils } from '../fba-utils/fba-utils.js';
import { CheckListInner } from './check-list.js';
import { CheckListItem } from './check-list-item.js';

export const CheckList = fbaUtils.attachPropertiesToComponent(CheckListInner, {
  Item: CheckListItem,
});
