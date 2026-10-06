import { act, render, screen } from '@testing-library/react';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { Drawer as BaseDrawer } from '@base-ui/react/drawer';
import * as RadixDialog from '@radix-ui/react-dialog';
import { Drawer as VaulDrawer } from 'vaul';
import { createResponsiveWrapper, createPushModal } from '../base-ui';
import { createPushModal as createCorePushModal } from '../core';

it('infers Base UI popup props and switches both root and content at the breakpoint', () => {
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const mediaQuery = {
    matches: false,
    addEventListener: jest.fn((_type: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.add(listener);
    }),
    removeEventListener: jest.fn(
      (_type: string, listener: (event: MediaQueryListEvent) => void) => {
        listeners.delete(listener);
      }
    ),
  };
  const matchMedia = jest.fn(() => mediaQuery);
  Object.defineProperty(window, 'matchMedia', { configurable: true, value: matchMedia });

  const Responsive = createResponsiveWrapper({
    desktop: {
      Wrapper: BaseDialog.Root,
      Content: ({ children, ...props }: BaseDialog.Popup.Props) => (
        <BaseDialog.Portal>
          <BaseDialog.Popup {...props}>
            <BaseDialog.Title>Desktop</BaseDialog.Title>
            {children}
          </BaseDialog.Popup>
        </BaseDialog.Portal>
      ),
    },
    mobile: {
      Wrapper: BaseDialog.Root,
      Content: ({ children, ...props }: BaseDialog.Popup.Props) => (
        <BaseDialog.Portal>
          <BaseDialog.Popup {...props}>
            <BaseDialog.Title>Mobile</BaseDialog.Title>
            {children}
          </BaseDialog.Popup>
        </BaseDialog.Portal>
      ),
    },
    breakpoint: 700,
  });
  const api = createPushModal({
    modals: {
      Responsive: {
        Wrapper: Responsive.Wrapper,
        Component: () => (
          <Responsive.Content className={(state) => (state.open ? 'open' : 'closed')} />
        ),
      },
    },
  });
  render(<api.ModalProvider />);
  act(() => api.pushModal('Responsive'));
  expect(screen.getByRole('dialog', { name: 'Desktop' })).toHaveClass('open');
  expect(matchMedia).toHaveBeenCalledWith('(max-width: 700px)');
  act(() => {
    mediaQuery.matches = true;
    listeners.forEach((listener) => listener({ matches: true } as MediaQueryListEvent));
  });
  expect(screen.getByRole('dialog', { name: 'Mobile' })).toHaveClass('open');
});

// Compile-time checks are part of `typecheck`; this function is never invoked.
function checkTypes() {
  const Base = createResponsiveWrapper({
    desktop: { Wrapper: BaseDialog.Root, Content: BaseDialog.Popup },
    mobile: { Wrapper: BaseDrawer.Root, Content: BaseDrawer.Popup },
  });
  createPushModal({
    modals: { Example: { Wrapper: Base.Wrapper, Component: () => <Base.Content /> } },
  });
  <Base.Content
    className={(state: { open: boolean }) => (state.open ? 'open' : 'closed')}
    finalFocus={false}
  />;
  // @ts-expect-error Unknown popup props are rejected.
  <Base.Content nonexistent="value" />;

  const Mixed = createResponsiveWrapper({
    desktop: { Wrapper: BaseDialog.Root, Content: BaseDialog.Popup },
    mobile: { Wrapper: VaulDrawer.Root, Content: VaulDrawer.Content },
  });
  <Mixed.Content className="shared" />;
  // @ts-expect-error Vaul does not accept Base UI's function-valued className.
  <Mixed.Content className={() => 'open'} />;

  const Radix = createResponsiveWrapper({
    desktop: { Wrapper: RadixDialog.Root, Content: RadixDialog.Content },
    mobile: { Wrapper: VaulDrawer.Root, Content: VaulDrawer.Content },
  });
  <Radix.Content onEscapeKeyDown={(event) => event.preventDefault()} />;

  const api = createPushModal({
    modals: {
      Empty: () => null,
      Required: ({ count }: { count: number }) => <span>{count}</span>,
      Override: {
        Wrapper: RadixDialog.Root,
        Component: ({ text }: { text: string }) => <span>{text}</span>,
      },
    },
  });
  api.pushModal('Empty');
  api.pushModal('Required', { count: 1 });
  api.replaceWithModal('Override', { text: 'valid' });
  // @ts-expect-error Modal names are inferred.
  api.pushModal('Missing');
  // @ts-expect-error Required props remain required.
  api.pushModal('Required');
  // @ts-expect-error Prop values remain checked.
  api.replaceWithModal('Required', { count: 'invalid' });
  // @ts-expect-error The UI-agnostic entry requires an explicit default wrapper.
  createCorePushModal({ modals: { Empty: () => null } });
}

// Keep the compile-time fixture checked without invoking it.
void checkTypes;
