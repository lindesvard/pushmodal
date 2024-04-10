'use client';

import React, { Suspense, useEffect, useState } from 'react';
import mitt, { Handler } from 'mitt';
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

export function createPushModal<T>({ modals }: CreatePushModalOptions<T>) {
  type Modals = typeof modals;
  type ModalKeys = keyof Modals;

  type EventHandlers = {
    change: { name: ModalKeys; open: boolean; props: Record<string, unknown> };
    push: {
      name: ModalKeys;
      props: Record<string, unknown>;
    };
    replace: {
      name: ModalKeys;
      props: Record<string, unknown>;
    };
    pop: { name?: ModalKeys };
    popAll: undefined;
  };

  interface StateItem {
    key: string;
    name: ModalKeys;
    props: Record<string, unknown>;
    open: boolean;
    closedAt?: number;
  }

  const filterGarbage = (item: StateItem): boolean => {
    if (item.open || !item.closedAt) {
      return true;
    }
    return Date.now() - item.closedAt < 300;
  };

  const emitter = mitt<EventHandlers>();

  function ModalProvider() {
    const [state, setState] = useState<StateItem[]>([]);

    // Run this to ensure we remove closed modals from the state
    // Otherwise the unmount in useEffect will not be triggered until the next modal is opened
    useEffect(() => {
      const hasClosedModals = state.some((item) => typeof item.closedAt === 'number');
      let timer: NodeJS.Timeout | undefined;
      if (hasClosedModals) {
        timer = setInterval(() => {
          setState((p) => [...p.filter(filterGarbage)]);
        }, 100);
      } else {
        clearInterval(timer);
      }

      return () => {
        clearInterval(timer);
      };
    }, [state]);

    useEffect(() => {
      const pushHandler: Handler<EventHandlers['push']> = ({ name, props }) => {
        emitter.emit('change', { name, open: true, props });
        setState((p) =>
          [
            ...p,
            {
              key: Math.random().toString(),
              name,
              props,
              open: true,
            },
          ].filter(filterGarbage)
        );
      };
      const replaceHandler: Handler<EventHandlers['replace']> = ({ name, props }) => {
        setState((p) => {
          // find last item to replace
          const last = p.findLast((item) => item.open);
          if (last) {
            // if found emit close event
            emitter.emit('change', { name: last.name, open: false, props: last.props });
          }
          emitter.emit('change', { name, open: true, props });

          return [
            // 1) close last item 2) filter garbage 3) add new item
            ...p
              .map((item) => {
                if (item.key === last?.key) {
                  return { ...item, open: false, closedAt: Date.now() };
                }
                return item;
              })
              .filter(filterGarbage),
            {
              key: Math.random().toString(),
              name,
              props,
              open: true,
            },
          ];
        });
      };

      const popHandler: Handler<EventHandlers['pop']> = ({ name }) => {
        setState((items) => {
          // Find last index
          const index =
            name === undefined
              ? // Pick last item if no name is provided
                items.length - 1
              : items.findLastIndex((item) => item.name === name && item.open);
          const match = items[index];
          if (match) {
            emitter.emit('change', {
              name: match.name,
              open: false,
              props: match.props,
            });
          }
          return items.map((item) =>
            match?.key !== item.key ? item : { ...item, open: false, closedAt: Date.now() }
          );
        });
      };

      const popAllHandler: Handler<EventHandlers['popAll']> = () => {
        setState((items) => items.map((item) => ({ ...item, open: false, closedAt: Date.now() })));
      };
      emitter.on('push', pushHandler);
      emitter.on('replace', replaceHandler);
      emitter.on('pop', popHandler);
      emitter.on('popAll', popAllHandler);
      return () => {
        emitter.off('push', pushHandler);
        emitter.off('replace', replaceHandler);
        emitter.off('pop', popHandler);
        emitter.off('popAll', popAllHandler);
      };
    }, [state.length]);
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
              open={item.open}
              onOpenChange={(isOpen) => {
                if (!isOpen) {
                  popModal(item.name);
                }
              }}
              defaultOpen
            >
              <Suspense>
                <Component {...(item.props as any)} />
              </Suspense>
            </Root>
          );
        })}
      </>
    );
  }

  type Prettify<T> = {
    [K in keyof T]: T[K];
    // eslint-disable-next-line @typescript-eslint/ban-types
  } & {};
  type GetComponentProps<T> = T extends
    | React.ComponentType<infer P>
    | React.Component<infer P>
    | { Component: React.ComponentType<infer P> }
    ? P
    : never;
  type IsObject<T> =
    Prettify<T> extends Record<string | number | symbol, unknown> ? Prettify<T> : never;
  type HasKeys<T> = keyof T extends never ? never : T;

  const pushModal = <T extends StateItem['name'], B extends Prettify<GetComponentProps<Modals[T]>>>(
    name: T,
    ...args: HasKeys<IsObject<B>> extends never
      ? // No props provided
        []
      : // Props provided
        [props: B]
  ) => {
    const [props] = args;
    return emitter.emit('push', {
      name,
      props: props ?? {},
    });
  };

  const popModal = (name?: StateItem['name']) =>
    emitter.emit('pop', {
      name,
    });

  const replaceWithModal = <T extends StateItem['name'], B extends GetComponentProps<Modals[T]>>(
    name: T,
    ...args: HasKeys<IsObject<B>> extends never
      ? // No props provided
        []
      : // Props provided
        [props: B]
  ) => {
    const [props] = args;
    emitter.emit('replace', {
      name,
      props: props ?? {},
    });
  };

  const popAllModals = () => emitter.emit('popAll');

  type EventCallback<T extends ModalKeys> = (
    open: boolean,
    props: GetComponentProps<Modals[T]>,
    name?: T
  ) => void;

  const onPushModal = <T extends ModalKeys>(name: T | '*', callback: EventCallback<T>) => {
    const fn: Handler<EventHandlers['change']> = (payload) => {
      if (payload.name === name) {
        callback(payload.open, payload.props as GetComponentProps<Modals[T]>, payload.name as T);
      } else if (name === '*') {
        callback(payload.open, payload.props as any, payload.name as T);
      }
    };
    emitter.on('change', fn);
    return () => emitter.off('change', fn);
  };

  return {
    ModalProvider,
    pushModal,
    popModal,
    popAllModals,
    replaceWithModal,
    onPushModal,
    useOnPushModal: <T extends ModalKeys>(name: T | '*', callback: EventCallback<T>) => {
      useEffect(() => {
        return onPushModal(name, callback);
      }, [name, callback]);
    },
  };
}
