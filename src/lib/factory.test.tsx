import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect } from 'react';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import * as RadixDialog from '@radix-ui/react-dialog';
import { createPushModal as createRadixPushModal } from '../index';
import { createPushModal as createBasePushModal } from '../base-ui';
import { createPushModal as createCorePushModal, ModalWrapperProps } from '../core';

function BaseModal({ label }: { label: string }) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop />
      <BaseDialog.Popup>
        <BaseDialog.Title>{label}</BaseDialog.Title>
        <BaseDialog.Description>Base UI modal</BaseDialog.Description>
        <BaseDialog.Close>Close</BaseDialog.Close>
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
}

function RadixModal({ label }: { label: string }) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay />
      <RadixDialog.Content>
        <RadixDialog.Title>{label}</RadixDialog.Title>
        <RadixDialog.Description>Radix UI modal</RadixDialog.Description>
        <RadixDialog.Close>Close</RadixDialog.Close>
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}

describe.each([
  ['Radix', createRadixPushModal, RadixModal],
  ['Base UI', createBasePushModal, BaseModal],
] as const)('%s entry point', (_name, createPushModal, Component) => {
  it('opens shorthand modals with inferred props and closes from the primitive', async () => {
    const user = userEvent.setup();
    const api = createPushModal({ modals: { Example: Component } });
    const changes = jest.fn();
    const unsubscribe = api.onPushModal('Example', changes);
    render(<api.ModalProvider />);

    act(() => api.pushModal('Example', { label: 'Example title' }));
    const dialog = await screen.findByRole('dialog', { name: 'Example title' });
    expect(changes).toHaveBeenCalledWith(true, { label: 'Example title' }, 'Example');

    await user.click(within(dialog).getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(changes).toHaveBeenLastCalledWith(false, { label: 'Example title' }, 'Example');
    unsubscribe();
  });

  it('retains closed content briefly for exit animations, then unmounts it', () => {
    jest.useFakeTimers();
    try {
      const unmount = jest.fn();
      const api = createPushModal({
        modals: {
          Tracked: () => {
            useEffect(
              () => () => {
                unmount();
              },
              []
            );
            return <Component label="Tracked" />;
          },
        },
      });
      render(<api.ModalProvider />);
      act(() => api.pushModal('Tracked'));
      act(() => api.popModal());
      expect(unmount).not.toHaveBeenCalled();
      act(() => jest.advanceTimersByTime(400));
      expect(unmount).toHaveBeenCalledTimes(1);
    } finally {
      jest.useRealTimers();
    }
  });

  it('handles Escape, replacement, named pop, and popAll', async () => {
    const user = userEvent.setup();
    const api = createPushModal({ modals: { Example: Component, Other: Component } });
    render(<api.ModalProvider />);
    act(() => api.pushModal('Example', { label: 'First' }));
    await screen.findByRole('dialog', { name: 'First' });
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    act(() => api.pushModal('Example', { label: 'Original' }));
    await screen.findByRole('dialog', { name: 'Original' });
    act(() => api.replaceWithModal('Other', { label: 'Replacement' }));
    await screen.findByRole('dialog', { name: 'Replacement' });
    await waitFor(() => expect(screen.queryByText('Original')).not.toBeInTheDocument());
    act(() => api.popModal('Other'));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    act(() => api.pushModal('Example', { label: 'One' }));
    await screen.findByRole('dialog', { name: 'One' });
    act(() => api.pushModal('Other', { label: 'Two' }));
    await screen.findByRole('dialog', { name: 'Two' });
    act(() => api.popAllModals());
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});

it('allows a factory default and a per-modal override in the same provider', async () => {
  const api = createCorePushModal({
    Wrapper: BaseDialog.Root,
    modals: {
      Base: BaseModal,
      Radix: { Wrapper: RadixDialog.Root, Component: RadixModal },
    },
  });
  render(<api.ModalProvider />);
  act(() => api.pushModal('Base', { label: 'Base default' }));
  await screen.findByRole('dialog', { name: 'Base default' });
  act(() => api.popAllModals());
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  act(() => api.pushModal('Radix', { label: 'Radix override' }));
  await screen.findByRole('dialog', { name: 'Radix override' });
});

it('allows overriding the default in both convenience entry points', async () => {
  const radix = createRadixPushModal({ Wrapper: BaseDialog.Root, modals: { Base: BaseModal } });
  const base = createBasePushModal({ Wrapper: RadixDialog.Root, modals: { Radix: RadixModal } });
  render(
    <>
      <radix.ModalProvider />
      <base.ModalProvider />
    </>
  );
  act(() => radix.pushModal('Base', { label: 'Custom Base' }));
  await screen.findByRole('dialog', { name: 'Custom Base' });
  act(() => radix.popAllModals());
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  act(() => base.pushModal('Radix', { label: 'Custom Radix' }));
  await screen.findByRole('dialog', { name: 'Custom Radix' });
});

function TestWrapper({ open, onOpenChange, children }: ModalWrapperProps) {
  return (
    <div role="group" data-open={open}>
      {children}
      <button onClick={() => onOpenChange(false)}>Dismiss instance</button>
    </div>
  );
}

it('closes the instance that requested dismissal, even when its name is duplicated', () => {
  const api = createCorePushModal({
    Wrapper: TestWrapper,
    modals: { Example: ({ label }: { label: string }) => <span>{label}</span> },
  });
  const changes = jest.fn();
  api.onPushModal('Example', changes);
  render(<api.ModalProvider />);
  act(() => {
    api.pushModal('Example', { label: 'First' });
    api.pushModal('Example', { label: 'Second' });
  });
  const [first, second] = screen.getAllByRole('group');
  fireEvent.click(within(first).getByRole('button'));
  expect(first).toHaveAttribute('data-open', 'false');
  expect(second).toHaveAttribute('data-open', 'true');
  expect(changes).toHaveBeenLastCalledWith(false, { label: 'First' }, 'Example');

  // Repeated callbacks from an exiting root must not close another instance.
  fireEvent.click(within(first).getByRole('button'));
  expect(second).toHaveAttribute('data-open', 'true');
  act(() => api.popModal());
  expect(second).toHaveAttribute('data-open', 'false');
});
