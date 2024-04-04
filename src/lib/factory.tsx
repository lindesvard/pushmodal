'use client';

import React, { Suspense, useEffect, useState } from 'react';
import mitt from 'mitt';
import { DialogWrapper } from '../components/wrappers';

interface CreatePushModalOptions<T> {
  modals: {
    [key in keyof T]: {
      Component: React.ComponentType<T[key]>;
      Wrapper?: typeof DialogWrapper;
    };
  };
  defaultWrapper?: typeof DialogWrapper;
}

interface PushModalOptions {
  Wrapper?: typeof DialogWrapper;
}

interface ControllerProps {
  children: React.ReactNode;
  onClosed: () => void;
}

export function createPushModal<T>({
  modals,
  defaultWrapper: DefaultWrapper = DialogWrapper,
}: CreatePushModalOptions<T>) {
  const emitter = mitt<{
    push: {
      name: ModalRoutes;
      props: Record<string, unknown>;
      options?: PushModalOptions;
    };
    replace: {
      name: ModalRoutes;
      props: Record<string, unknown>;
      options?: PushModalOptions;
    };
    pop: { name?: ModalRoutes };
  }>();

  type ModalRoutes = keyof typeof modals;

  interface StateItem {
    key: string;
    name: ModalRoutes;
    props: Record<string, unknown>;
    state: 'open' | 'closed';
    options?: PushModalOptions;
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
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && state.length > 0) {
          setState((p) => {
            p.pop();
            return [...p];
          });
        }
      });
    }, [state]);

    useEffect(() => {
      emitter.on('push', ({ name, props, options }) => {
        setState((p) => [
          ...p,
          {
            key: Math.random().toString(),
            name,
            props,
            state: 'open',
            options,
          },
        ]);
      });

      emitter.on('replace', ({ name, props, options }) => {
        setState([
          {
            key: Math.random().toString(),
            name,
            props,
            state: 'open',
            options,
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

      return () => emitter.all.clear();
    });
    return (
      <>
        {state.map((item) => {
          const { Component, ...options } = modals[item.name];
          const Wrapper = item.options?.Wrapper || options.Wrapper || DefaultWrapper;
          return (
            <Wrapper
              key={item.key}
              open={item.state === 'open'}
              onOpenChange={() => popModal(item.name)}
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
            </Wrapper>
          );
        })}
      </>
    );
  }

  type GetComponentProps<T> = T extends React.ComponentType<infer P> | React.Component<infer P>
    ? P
    : never;
  type GetDefinedProps<T> = T extends Record<string | number | symbol, unknown> ? T : never;

  const pushModal = <
    T extends StateItem['name'],
    B extends GetComponentProps<(typeof modals)[T]['Component']>,
  >(
    name: T,
    ...args: GetDefinedProps<B> extends never
      ? // No props provided
        [props?: undefined, options?: PushModalOptions]
      : // Props provided
        [props: B, options?: PushModalOptions]
  ) => {
    const [props, options] = args;

    return emitter.emit('push', {
      name,
      props: props ?? {},
      options,
    });
  };

  // const replaceModal = <
  //   T extends StateItem['name'],
  //   B extends OrUndefined<GetComponentProps<(typeof modals)[T]['Component']>>,
  // >(
  //   name: T,
  //   ...rest: B extends undefined ? [] : [B]
  // ) =>
  //   emitter.emit('replace', {
  //     name,
  //     props: Array.isArray(rest) && rest[0] ? rest[0] : {},
  //   });

  const popModal = (name?: StateItem['name']) =>
    emitter.emit('pop', {
      name,
    });

  return {
    ModalProvider,
    pushModal,
    popModal,
    // replaceModal,
  };
}
