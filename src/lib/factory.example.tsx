import { useMemo } from 'react';
import { createPushModal } from './factory';
import { DialogWrapper, SheetWrapper } from '../components/wrappers';
import { usePushModal } from '../components/context';

export function FactoryExample() {
  const { pushModal, popAllModals, ModalProvider } = useMemo(
    () =>
      createPushModal({
        defaultWrapper: SheetWrapper,
        modals: {
          ModalExample: {
            Wrapper: DialogWrapper,
            Component: () => (
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
            ),
          },
          SheetExample: {
            Component: () => {
              const [options, setOptions] = usePushModal({
                onEscapeKeyDown(event) {
                  event.preventDefault();
                },
              });

              return (
                <div>
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
                  <div className="mt-8 flex gap-4">
                    <button
                      className="bg-slate-200 text-black px-4 py-2 rounded-md"
                      onClick={() =>
                        setOptions((prev) => ({
                          ...prev,
                          onInteractOutside: prev.onInteractOutside
                            ? undefined
                            : (event) => {
                                event.preventDefault();
                              },
                        }))
                      }
                    >
                      {!options.onInteractOutside ? 'Disable' : 'Enable'} close on click outside
                    </button>
                    <button
                      className="bg-slate-200 text-black px-4 py-2 rounded-md"
                      onClick={() =>
                        setOptions((prev) => ({
                          ...prev,
                          onEscapeKeyDown: prev.onEscapeKeyDown
                            ? undefined
                            : (event) => {
                                event.preventDefault();
                              },
                        }))
                      }
                    >
                      {!options.onEscapeKeyDown ? 'Disable' : 'Enable'} close on ESC
                    </button>
                  </div>
                </div>
              );
            },
          },
          WithProps: {
            Component: (props: { num: number; str: string; bool: boolean }) => (
              <div>
                <pre>{JSON.stringify(props, null, 2)}</pre>
              </div>
            ),
          },
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
            pushModal(
              'ModalExample',
              {},
              {
                Wrapper: SheetWrapper,
              }
            )
          }
        >
          ModalExample in a sheet!
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
          Open Sheet
        </button>
        <button
          className="bg-black text-white px-4 py-2 rounded-md"
          onClick={() =>
            pushModal(
              'WithProps',
              {
                num: 1,
                str: 'string',
                bool: true,
              },
              {
                onInteractOutside(event) {
                  event.preventDefault();
                },
              }
            )
          }
        >
          Prevent close on interact outside
        </button>
        <button
          className="bg-black text-white px-4 py-2 rounded-md"
          onClick={() =>
            pushModal(
              'WithProps',
              {
                num: 1,
                str: 'string',
                bool: true,
              },
              {
                onEscapeKeyDown(event) {
                  event.preventDefault();
                },
              }
            )
          }
        >
          Prevent close on esc
        </button>
      </div>
    </div>
  );
}
