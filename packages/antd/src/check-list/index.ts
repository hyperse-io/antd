import { fbaUtils } from '../fba-utils/fba-utils.js';
import { CheckListInner } from './check-list.jsx';
import { CheckListItem } from './check-list-item.jsx';

export const CheckList = fbaUtils.attachPropertiesToComponent(CheckListInner, {
  Item: CheckListItem,
});
