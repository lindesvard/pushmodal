import { act, render, screen } from '@testing-library/react';
import { StrictMode, useLayoutEffect } from 'react';
import { createPushModal, ModalWrapperProps } from '../base-ui';

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

it.each(['factory', 'modal'] as const)('commits a closed %s wrapper before opening', (override) => {
  const commits: { open: boolean; defaultOpen?: boolean }[] = [];
  function Wrapper({ open, defaultOpen, children }: ModalWrapperProps) {
    useLayoutEffect(() => {
      commits.push({ open, defaultOpen });
    });
    return (
      <section data-testid="root" data-open={open}>
        {children}
      </section>
    );
  }
  const Component = () => null;
  const api = createPushModal({
    Wrapper: override === 'factory' ? Wrapper : undefined,
    modals: {
      Example: override === 'modal' ? { Wrapper, Component } : Component,
    },
  });
  render(
    <StrictMode>
      <api.ModalProvider />
    </StrictMode>
  );
  act(() => api.pushModal('Example'));
  expect(commits[0].open).toBe(false);
  expect(screen.getByTestId('root')).toHaveAttribute('data-open', 'false');
  act(() => jest.advanceTimersByTime(16));
  expect(commits.some(({ open }) => open)).toBe(true);
  expect(commits.every(({ defaultOpen }) => defaultOpen === undefined)).toBe(true);
  expect(screen.getByTestId('root')).toHaveAttribute('data-open', 'true');

  act(() => api.popModal());
  expect(screen.getByTestId('root')).toHaveAttribute('data-open', 'false');
});

it.each(['pop', 'popAll', 'replace'] as const)(
  'keeps a root closed when %s happens during its first commit',
  (operation) => {
    const opened = jest.fn();
    function Wrapper({ open, children }: ModalWrapperProps) {
      useLayoutEffect(() => {
        if (open) opened();
      }, [open, children]);
      return (
        <section data-testid="root" data-open={open}>
          {children}
        </section>
      );
    }
    function CancelOnMount() {
      useLayoutEffect(() => {
        if (operation === 'pop') api.popModal('Cancelled');
        if (operation === 'popAll') api.popAllModals();
        if (operation === 'replace') api.replaceWithModal('Replacement');
      }, []);
      return null;
    }
    const api = createPushModal({
      Wrapper,
      modals: { Cancelled: CancelOnMount, Replacement: () => null },
    });
    const { unmount } = render(<api.ModalProvider />);
    act(() => api.pushModal('Cancelled'));
    act(() => jest.advanceTimersByTime(16));
    const roots = screen.getAllByTestId('root');
    expect(roots[0]).toHaveAttribute('data-open', 'false');
    expect(opened).toHaveBeenCalledTimes(operation === 'replace' ? 1 : 0);
    if (operation === 'replace') expect(roots[1]).toHaveAttribute('data-open', 'true');
    unmount();
  }
);

it('cancels the pending opening frame when the provider unmounts', () => {
  const api = createPushModal({ Wrapper: () => null, modals: { Example: () => null } });
  const cancel = jest.spyOn(window, 'cancelAnimationFrame');
  const { unmount } = render(<api.ModalProvider />);
  act(() => api.pushModal('Example'));
  unmount();
  expect(cancel).toHaveBeenCalled();
  expect(jest.getTimerCount()).toBe(0);
  cancel.mockRestore();
});
