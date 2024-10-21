import { getCtx } from './context.js';
import { TableTrHandle } from './table-tr-handle.jsx';

export const Row = (props) => {
  const ctx = getCtx();
  return <TableTrHandle {...props} dragIcon={ctx.dragIcon} />;
};
