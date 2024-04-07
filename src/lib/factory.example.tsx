import { createPushModal } from './factory';
import { SheetContent } from '../components/sheet';
import { DialogContent } from '../components/dialog';
import { Drawer, DrawerContent } from '../components/drawer';
import { useEffect } from 'react';

const { onPushModal, useOnPushModal, pushModal, popAllModals, replaceWithModal, ModalProvider } =
  createPushModal({
    modals: {
      ModalExample: () => (
        <DialogContent>
          <div className="flex gap-4">
            <button
              className="bg-black text-white px-4 py-2 rounded-md"
              onClick={() => pushModal('ModalExample')}
            >
              Open Modal
            </button>
            <button
              className="bg-black text-white px-4 py-2 rounded-md"
              onClick={() => pushModal('SheetExample')}
            >
              Open Sheet
            </button>
            <button
              className="bg-black text-white px-4 py-2 rounded-md"
              onClick={() => replaceWithModal('SheetExample')}
            >
              Replace with Sheet
            </button>
            <button
              className="bg-black text-white px-4 py-2 rounded-md"
              onClick={() => popAllModals()}
            >
              Close all!
            </button>
          </div>
        </DialogContent>
      ),
      SheetExample: () => {
        return (
          <SheetContent>
            <div className="flex gap-4">
              <button
                className="bg-black text-white px-4 py-2 rounded-md"
                onClick={() => pushModal('ModalExample')}
              >
                Open Modal
              </button>
              <button
                className="bg-black text-white px-4 py-2 rounded-md"
                onClick={() => pushModal('SheetExample')}
              >
                Open Sheet
              </button>
              <button
                className="bg-black text-white px-4 py-2 rounded-md"
                onClick={() => replaceWithModal('ModalExample')}
              >
                Replace with Modal
              </button>
            </div>
          </SheetContent>
        );
      },
      DrawerExample: {
        Component: () => <DrawerContent>Drawer</DrawerContent>,
        Wrapper: Drawer,
      },
      DrawerExampleWithProps: {
        Component: ({ int }: { int: number }) => <DrawerContent>Drawer</DrawerContent>,
        Wrapper: Drawer,
      },
      WithProps: (props: { num: number; str: string; bool: boolean }) => (
        <DialogContent>
          <pre>{JSON.stringify(props, null, 2)}</pre>
        </DialogContent>
      ),
    },
  });

export function FactoryExample() {
  useEffect(() => {
    onPushModal('WithProps', (open, props, name) => {
      console.log('useEffect - onPushModal', {
        name,
        open,
        props,
      });
    });
  }, []);

  useOnPushModal('ModalExample', (open, props, name) => {
    console.log('useOnPushModal - ModalExample', { open, props, name });
  });

  useOnPushModal('*', (open, props, name) => {
    console.log('useOnPushModal - *', { open, props, name });
  });

  // This will never happen, just testing types
  if (!ModalProvider) {
    // eslint-disable-next-line
    // @ts-expect-error
    pushModal('DrawerExampleWithProps');

    pushModal('DrawerExampleWithProps', {
      int: 1,
    });

    pushModal('DrawerExample');

    pushModal('ModalExample');

    pushModal('SheetExample');

    // eslint-disable-next-line
    // @ts-expect-error
    pushModal('WithProps');

    pushModal('WithProps', {
      num: 1,
      str: 'string',
      bool: true,
    });
  }

  return (
    <div>
      <ModalProvider />
      <div className="flex gap-4">
        <button
          className="bg-black text-white px-4 py-2 rounded-md"
          onClick={() => pushModal('ModalExample')}
        >
          Open Modal
        </button>
        <button
          className="bg-black text-white px-4 py-2 rounded-md"
          onClick={() => pushModal('SheetExample')}
        >
          Open Sheet
        </button>
        <button
          className="bg-black text-white px-4 py-2 rounded-md"
          onClick={() => pushModal('DrawerExample')}
        >
          Open Drawer
        </button>
        <button
          className="bg-black text-white px-4 py-2 rounded-md"
          onClick={() =>
            pushModal('WithProps', {
              num: 1,
              str: 'string',
              bool: true,
            })
          }
        >
          Open with props
        </button>
      </div>
    </div>
  );
}
