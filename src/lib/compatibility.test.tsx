import type { ComponentType, ReactNode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import type { DialogContentProps, DialogProps } from '@radix-ui/react-dialog';
import { createPushModal, createResponsiveWrapper } from '../index';

type LegacyWrapperProps = {
  open: boolean;
  onOpenChange: (open?: boolean) => void;
  children: ReactNode;
  defaultOpen?: boolean;
};

function LegacyWrapper({ open, defaultOpen, onOpenChange, children }: LegacyWrapperProps) {
  return (
    <section aria-label="Legacy wrapper" data-open={open} data-default-open={defaultOpen}>
      {children}
      <button onClick={() => onOpenChange()}>Legacy close</button>
    </section>
  );
}

it('preserves defaultOpen and no-argument close callbacks for existing custom wrappers', () => {
  const api = createPushModal({
    modals: { Legacy: { Wrapper: LegacyWrapper, Component: () => <span>Legacy content</span> } },
  });
  const changes = jest.fn();
  api.onPushModal('Legacy', changes);
  render(<api.ModalProvider />);
  act(() => api.pushModal('Legacy'));
  const wrapper = screen.getByRole('region', { name: 'Legacy wrapper' });
  expect(wrapper).toHaveAttribute('data-default-open', 'true');
  expect(wrapper).toHaveAttribute('data-open', 'true');
  fireEvent.click(screen.getByRole('button', { name: 'Legacy close' }));
  expect(wrapper).toHaveAttribute('data-open', 'false');
  expect(changes).toHaveBeenLastCalledWith(false, {}, 'Legacy');
});

// Check the complete original public signatures, not only the props used in examples.
type LegacyContentProps = Omit<DialogContentProps, 'onAnimationEnd'> & {
  onAnimationEnd?: (...args: any[]) => void;
};
type LegacyOptions<T> = {
  modals: {
    [K in keyof T]:
      | ComponentType<T[K]>
      | {
          Wrapper: ComponentType<LegacyWrapperProps>;
          Component: ComponentType<T[K]>;
        };
  };
};

function verifyLegacySignatures<T>(options: LegacyOptions<T>) {
  // Every previously valid options object must still be accepted.
  createPushModal(options);
  const Content: ComponentType<LegacyContentProps> = () => null;
  const Wrapper: ComponentType<DialogProps> = () => null;
  const Responsive = createResponsiveWrapper({
    desktop: { Wrapper, Content },
    mobile: { Wrapper, Content },
  });
  const OriginalWrapper: ComponentType<DialogProps> = Responsive.Wrapper;
  const OriginalContent: ComponentType<LegacyContentProps> = Responsive.Content;
  <OriginalWrapper modal defaultOpen onOpenChange={() => {}} />;
  <OriginalContent onAnimationEnd={(arbitraryLegacyArgument: string) => arbitraryLegacyArgument} />;
}
void verifyLegacySignatures;
