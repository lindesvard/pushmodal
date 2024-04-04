'use client';

import React, { Suspense, useEffect, useState } from 'react';
import mitt from 'mitt';
import * as Dialog from '@radix-ui/react-dialog';

interface CreatePushModalOptions<T> {
  modals: {
    [key in keyof T]:
      | {
          Wrapper: React.ComponentType<{
            open: boolean;
            onOpenChange: (open?: boolean) => void;
            children: React.ReactNode;
            defaultOpen?: boolean;
          }>;
          Component: React.ComponentType<T[key]>;
        }
      | React.ComponentType<T[key]>;
  };
}

interface ControllerProps {
  children: React.ReactNode;
  onClosed: () => void;
}

export function createPushModal<T>({ modals }: CreatePushModalOptions<T>) {
  let lastModal: null | keyof T = null;
  const emitter = mitt<{
    push: {
      name: ModalRoutes;
      props: Record<string, unknown>;
    };
    replace: {
      name: ModalRoutes;
      props: Record<string, unknown>;
    };
    pop: { name?: ModalRoutes };
    popAll: undefined;
  }>();

  type ModalRoutes = keyof typeof modals;

  interface StateItem {
    key: string;
    name: ModalRoutes;
    props: Record<string, unknown>;
    state: 'open' | 'closed';
  }

  function Controller({ children, onClosed }: ControllerProps) {
    useEffect(() => {
      return () => onClosed();
    }, [onClosed]);

    return <Suspense>{children}</Suspense>;
  }

  function ModalProvider() {
    const [state, setState] = useState<StateItem[]>([]);

    useEffect(() => {
      if (state.length === 0) {
        lastModal = null;
      }
      emitter.on('push', ({ name, props }) => {
        setState((p) => [
          ...p,
          {
            key: Math.random().toString(),
            name,
            props,
            state: 'open',
          },
        ]);
      });

      emitter.on('replace', ({ name, props }) => {
        setState([
          {
            key: Math.random().toString(),
            name,
            props,
            state: 'open',
          },
        ]);
      });

      emitter.on('pop', ({ name }) => {
        setState((items) => {
          const match =
            name === undefined
              ? // Pick last item if no name is provided
                items.length - 1
              : items.findLastIndex((item) => item.name === name);
          return items.map((item, index) =>
            index !== match ? item : { ...item, state: 'closed' }
          );
        });
      });

      emitter.on('popAll', () => {
        setState((items) => items.map((item) => ({ ...item, state: 'closed' })));
      });

      return () => emitter.all.clear();
    });
    return (
      <>
        {state.map((item) => {
          const modal = modals[item.name];
          const Component =
            'Component' in modal ? modal.Component : (modal as React.ComponentType<unknown>);
          const Root = 'Wrapper' in modal ? modal.Wrapper : Dialog.Root;

          return (
            <Root
              key={item.key}
              open={item.state === 'open'}
              onOpenChange={(isOpen) => {
                if (!isOpen) {
                  popModal(item.name);
                }
              }}
              defaultOpen
            >
              <Controller
                onClosed={() => {
                  if (item.state === 'closed') {
                    setState((prev) => {
                      const match = prev.findIndex((i) => i.key === item.key);
                      return prev.filter((_, index) => index !== match);
                    });
                  }
                }}
              >
                <Component {...(item.props as any)} />
              </Controller>
            </Root>
          );
        })}
      </>
    );
  }

  type GetComponentProps<T> = T extends React.ComponentType<infer P> | React.Component<infer P>
    ? P
    : never;
  type GetDefinedProps<T> = T extends Record<string | number | symbol, unknown> ? T : never;

  const pushModal = <T extends StateItem['name'], B extends GetComponentProps<(typeof modals)[T]>>(
    name: T,
    ...args: GetDefinedProps<B> extends never
      ? // No props provided
        [props?: undefined]
      : // Props provided
        [props: B]
  ) => {
    const [props] = args;
    lastModal = name;
    return emitter.emit('push', {
      name,
      props: props ?? {},
    });
  };

  const popModal = (name?: StateItem['name']) =>
    emitter.emit('pop', {
      name,
    });

  const replaceWithModal = <
    T extends StateItem['name'],
    B extends GetComponentProps<(typeof modals)[T]>,
  >(
    name: T,
    ...args: GetDefinedProps<B> extends never
      ? // No props provided
        [props?: undefined]
      : // Props provided
        [props: B]
  ) => {
    const [props] = args;
    emitter.emit('push', {
      name,
      props: props ?? {},
    });
    if (lastModal) {
      popModal(lastModal);
    }
    lastModal = name;
  };

  const popAllModals = () => emitter.emit('popAll');

  return {
    ModalProvider,
    pushModal,
    popModal,
    popAllModals,
    replaceWithModal,
  };
}
