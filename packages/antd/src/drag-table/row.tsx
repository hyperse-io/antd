import { getCtx } from './context.js';
import { TableTr } from './table-tr.js';
import { TableTrHandle } from './table-tr-handle.js';

export const Row = (props) => {
  const ctx = getCtx();
  return ctx.dragIcon === false ? (
    <TableTr {...props} dragIcon={ctx.dragIcon} />
  ) : (
    <TableTrHandle {...props} dragIcon={ctx.dragIcon} />
  );
};
