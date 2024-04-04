import { useMemo } from 'react';
import { createPushModal } from './factory';
import { SheetContent } from '../components/sheet';
import { DialogContent } from '../components/dialog';

export function FactoryExample() {
  const { pushModal, popAllModals, ModalProvider } = useMemo(
    () =>
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
                </div>
              </SheetContent>
            );
          },
          WithProps: (props: { num: number; str: string; bool: boolean }) => (
            <DialogContent>
              <pre>{JSON.stringify(props, null, 2)}</pre>
            </DialogContent>
          ),
        },
      }),
    []
  );

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
