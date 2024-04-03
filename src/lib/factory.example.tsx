import { useMemo } from 'react';
import { createPushModal } from './factory';
import { DialogWrapper, SheetWrapper } from '../components/wrappers';

export function FactoryExample() {
  const { pushModal, ModalProvider } = useMemo(
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
                  onClick={() => pushModal('ModalExample', {})}
                >
                  Open Modal
                </button>
                <button
                  className="bg-black text-white px-4 py-2 rounded-md"
                  onClick={() => pushModal('SheetExample', {})}
                >
                  Open Sheet
                </button>
              </div>
            ),
          },
          SheetExample: {
            Component: () => (
              <div className="flex gap-4">
                <button
                  className="bg-black text-white px-4 py-2 rounded-md"
                  onClick={() => pushModal('ModalExample', {})}
                >
                  Open Modal
                </button>
                <button
                  className="bg-black text-white px-4 py-2 rounded-md"
                  onClick={() => pushModal('SheetExample', {})}
                >
                  Open Sheet
                </button>
              </div>
            ),
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
          onClick={() => pushModal('ModalExample', {})}
        >
          Open Modal
        </button>
        <button
          className="bg-black text-white px-4 py-2 rounded-md"
          onClick={() => pushModal('SheetExample', {})}
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
      </div>
    </div>
  );
}
