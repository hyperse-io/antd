import { type Dispatch, type SetStateAction, useState } from 'react';
import { hooks } from '@wove/react';

export const useSafeState = <S extends undefined | unknown>(
  initialState?: S | (() => S)
): [S, Dispatch<SetStateAction<S>>] => {
  const [state, setState] = useState(initialState as S);
  const isMounted = hooks.useIsMounted();

  return [
    state,
    (value) => {
      if (isMounted.current) {
        return setState(value);
      }
    },
  ];
};
