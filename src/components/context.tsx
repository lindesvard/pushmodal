import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { PushModalOptions } from '../lib/types';

const context = createContext<[PushModalOptions, Dispatch<SetStateAction<PushModalOptions>>]>([
  {},
  () => {},
]);

type WrapperProviderProps = {
  value?: PushModalOptions;
  children: (options: PushModalOptions) => React.ReactNode;
} & PushModalOptions;

export const WrapperProvider = ({ children, value }: WrapperProviderProps) => {
  const [state, setState] = useState<PushModalOptions>(value ?? {});
  return (
    <context.Provider value={useMemo(() => [state, setState], [state])}>
      {children(state)}
    </context.Provider>
  );
};

export const usePushModal = (options?: PushModalOptions) => {
  const ctx = useContext(context);
  useEffect(() => {
    if (options) {
      ctx[1]((prev) => ({ ...prev, ...options }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return ctx;
};
